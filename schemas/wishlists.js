const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'user', // Tham chiếu đến schema user
    required: true,
  },
  products: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'product', // Tham chiếu đến schema product
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // Thời gian tạo wishlist
  },
});

module.exports = mongoose.model('wishlist', wishlistSchema);