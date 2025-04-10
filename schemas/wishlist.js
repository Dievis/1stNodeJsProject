const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user', // Tham chiếu đến user
        required: true
    },
    products: [{
        type: mongoose.Types.ObjectId,
        ref: 'product', // Tham chiếu đến product
        required: true
    }]
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('wishlist', wishlistSchema);