const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middlewares/auth'); // Middleware xác thực người dùng

// Lấy wishlist của người dùng
router.get('/', authMiddleware, wishlistController.getWishlist);

// Thêm sản phẩm vào wishlist
router.post('/add', authMiddleware, wishlistController.addToWishlist);

// Xóa sản phẩm khỏi wishlist
router.post('/remove', authMiddleware, wishlistController.removeFromWishlist);

module.exports = router;