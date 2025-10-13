const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product")
const authMiddleware = require("../middleware/auth");

router.post("/add", authMiddleware, async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.stock != null && product.stock <= 0) {
      return res.status(400).json({ message: "Product is out of stock" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingItemIndex = user.cart.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();
    const updatedUser = await User.findById(req.userId).populate("cart.productId");
    res.status(200).json({
      message: "Product added to cart successfully",
      cart: updatedUser.cart
    });

  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({
      message: "Failed to add to cart",
      error: err.message
    });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("cart.productId");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const validCartItems = user.cart.filter(item => item.productId !== null);
    if (validCartItems.length !== user.cart.length) {
      user.cart = validCartItems;
      await user.save();
    }

    res.status(200).json(validCartItems);
  } catch (err) {
    console.error("Fetch cart error:", err);
    res.status(500).json({ 
      message: "Failed to fetch cart", 
      error: err.message 
    });
  }
});

router.put("/update", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  
  try {
    if (!productId || quantity < 1) {
      return res.status(400).json({ message: "Invalid product ID or quantity" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItem = user.cart.find(item => item.productId.toString() === productId);
    
    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cartItem.quantity = quantity;
    await user.save();
    
    const updatedUser = await User.findById(req.userId).populate("cart.productId");
    res.status(200).json({ 
      message: "Cart updated successfully", 
      cart: updatedUser.cart 
    });
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ 
      message: "Failed to update cart", 
      error: err.message 
    });
  }
});

router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  const { productId } = req.params;
  
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const initialCartLength = user.cart.length;
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    
    if (user.cart.length === initialCartLength) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await user.save();
    
    const updatedUser = await User.findById(req.userId).populate("cart.productId");
    res.status(200).json({ 
      message: "Product removed from cart successfully", 
      cart: updatedUser.cart 
    });
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ 
      message: "Failed to remove item from cart", 
      error: err.message 
    });
  }
});

router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = [];
    await user.save();
    
    res.status(200).json({ 
      message: "Cart cleared successfully", 
      cart: [] 
    });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ 
      message: "Failed to clear cart", 
      error: err.message 
    });
  }
});

module.exports = router;