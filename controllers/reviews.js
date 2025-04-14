const ReviewModel = require('../schemas/review');

async function addReview(userId, productId, rating, comment) {
    try {
        console.log('Adding review:', { userId, productId, rating, comment }); 
        const review = new ReviewModel({
            user: userId,
            product: productId,
            rating: rating,
            comment: comment
        });

        await review.save();
        await review.populate('user', 'username'); 
        return review;
    } catch (error) {
        throw error;
    }
}


async function getReviewsByProduct(productId) {
    try {
        const reviews = await ReviewModel.find({ product: productId })
            .populate('user', 'username') 
            .populate('product', 'name'); 
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
            { new: true } 
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