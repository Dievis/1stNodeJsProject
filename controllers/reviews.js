//- filepath: d:\Github\TPD\1stNodeJsProject\controllers\reviews.js

const ReviewModel = require('../schemas/review');

// Thêm review
async function addReview(userId, productId, rating, comment) {
    try {
        const review = new ReviewModel({
            user: userId,
            product: productId,
            rating: rating,
            comment: comment
        });
        await review.save();
        return review;
    } catch (error) {
        throw error;
    }
}

// Lấy danh sách review của sản phẩm
async function getReviewsByProduct(productId) {
    try {
        const reviews = await ReviewModel.find({ product: productId })
            .populate('user', 'username') // Lấy thông tin người dùng (chỉ username)
            .populate('product', 'name'); // Lấy thông tin sản phẩm (chỉ name)
        return reviews;
    } catch (error) {
        throw error;
    }
}

// Cập nhật review
async function updateReview(reviewId, rating, comment) {
    try {
        const updatedReview = await ReviewModel.findByIdAndUpdate(
            reviewId,
            { rating: rating, comment: comment },
            { new: true } // Trả về document đã được cập nhật
        );
        if (!updatedReview) {
            throw new Error('Review không tồn tại');
        }
        return updatedReview;
    } catch (error) {
        throw error;
    }
}

// Xóa review
async function deleteReview(reviewId) {
    try {
        const result = await ReviewModel.findByIdAndDelete(reviewId);
        if (!result) {
            throw new Error('Review không tồn tại');
        }
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    addReview,
    getReviewsByProduct,
    updateReview,
    deleteReview
};