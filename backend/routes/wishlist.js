const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/auth");
const mongoose = require("mongoose");

router.post("/add", authMiddleware, async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.wishlist.some(item => item.toString() === productId.toString())) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      message: "Product added to wishlist successfully",
      wishlistCount: user.wishlist.length
    });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "wishlist",
      select: "title price image description rating stock category"
    });

    if (!user) {
      return res.status(404).json({ message: "User not found", wishlist: [] });
    }

    const validWishlist = (user.wishlist || []).filter(Boolean);
    return res.status(200).json(validWishlist);
  } catch (err) {
    console.error("Fetch wishlist error:", err);
    return res.status(500).json({ message: "Internal server error", wishlist: [] });
  }
});

router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());

    if (user.wishlist.length === initialLength) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    await user.save();
    return res.status(200).json({
      message: "Product removed successfully",
      wishlistCount: user.wishlist.length
    });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = [];
    await user.save();
    return res.status(200).json({ message: "Wishlist cleared successfully" });
  } catch (err) {
    console.error("Clear wishlist error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
