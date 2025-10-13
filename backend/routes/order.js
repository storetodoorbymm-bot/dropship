const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; 
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or missing user' });
    }

    const { items, total, shippingAddress, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: 'No items to place order' });
    }

    for (const it of items) {
      const product = await Product.findById(it.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${it.product}` });
      }
      if (product.stock < it.quantity) {
        return res.status(400).json({
          message: `Not enough stock for product "${product.name}". Available: ${product.stock}, Requested: ${it.quantity}`
        });
      }
    }

    for (const it of items) {
      await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.quantity } });
    }

    const order = new Order({
      user: userId,
      items: items.map(i => ({
        product: i.product,
        name: i.title || i.name || 'Unnamed product',
        quantity: i.quantity,
        price: i.price
      })),
      total,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      status: 'pending'
    });

    await order.save();
    await User.findByIdAndUpdate(userId, { cart: [] });

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order._id
    });

  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Invalid or missing user' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('items.product');
    return res.status(200).json(orders);
    
  } catch (err) {
    console.error('getOrders error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put("/cancel/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/return/:id", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      console.log("❌ No reason provided");
      return res.status(400).json({ message: "Return reason is required" });
    }
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const order = await Order.findById(req.params.id).populate("items.product");
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    if (order.status === "returned") {
      return res.status(400).json({ message: "Order is already returned" });
    }

    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
    
    order.status = "returned";
    await order.save();
    
    res.json({ message: "Order returned successfully" });
    
  } catch (err) {
    res.status(500).json({ 
      message: "Server error while returning order",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

router.get("/all", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("items.product", "title price");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:orderId/status", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
