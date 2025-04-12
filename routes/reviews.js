//- filepath: d:\Github\TPD\1stNodeJsProject\routes\reviews.js

const express = require('express');
const router = express.Router();
const { check_authentication } = require('../utils/check_auth');
const { addReview, getReviewsByProduct, updateReview, deleteReview } = require('../controllers/reviews');

// Thêm review
router.post('/', check_authentication, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user._id; // Lấy user từ middleware
        const review = await addReview(userId, productId, rating, comment);
        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Lấy danh sách review của sản phẩm
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await getReviewsByProduct(productId);
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cập nhật review
router.put('/:reviewId', check_authentication, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const updatedReview = await updateReview(reviewId, rating, comment);
        res.status(200).json({ success: true, data: updatedReview });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Xóa review
router.delete('/:reviewId', check_authentication, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const result = await deleteReview(reviewId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;