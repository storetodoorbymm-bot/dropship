const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

async function createOrder(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or missing user' });
    }

    const { items, total, shippingAddress, paymentMethod } = req.body;
    if (!items?.length) {
      return res.status(400).json({ message: 'No items to place order' });
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

  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function getOrders(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Invalid or missing user' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      const orders = await Order.find().sort({ createdAt: -1 })
        .populate('user', 'name email')
        .populate('items.product');
      return res.status(200).json(orders);
    } else {
      const orders = await Order.find({ user: userId }).sort({ createdAt: -1 })
        .populate('items.product');
      return res.status(200).json(orders);
    }
  } catch (err) {
    console.error('getOrders error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { createOrder, getOrders };
