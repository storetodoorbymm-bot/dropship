const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  address: String,
  contact: String,
  role: { type: String, enum: ["user", "admin"], default: "user" }, 
  dateJoined: {
    type: Date,
    default: Date.now
  },
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
  wishlist: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product' 
    }
  ],
});

module.exports = mongoose.model('User', userSchema);
