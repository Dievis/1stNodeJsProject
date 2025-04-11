const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist');

// Lấy wishlist của người dùng
router.get('/', wishlistController.getWishlist);

// Thêm sản phẩm vào wishlist
router.post('/add', wishlistController.addToWishlist);

// Xóa sản phẩm khỏi wishlist
router.post('/remove', wishlistController.removeFromWishlist);

module.exports = router;