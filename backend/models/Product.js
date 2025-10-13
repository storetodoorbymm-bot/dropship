const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  category: String,
  stock: Number,
  image: String,
  rating: Number
});

module.exports = mongoose.model("Product", productSchema);
