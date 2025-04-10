let mongoose = require('mongoose');

let wishlistSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user', // Tham chiếu đến user
        required: true
    },
    products: [{
        type: mongoose.Types.ObjectId,
        ref: 'product', // Tham chiếu đến product
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('wishlist', wishlistSchema);