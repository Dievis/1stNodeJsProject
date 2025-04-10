let mongoose = require('mongoose');

let reviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user', // Tham chiếu đến schema user
        required: true
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'product', // Tham chiếu đến schema product
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now // Thời gian tạo review
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('review', reviewSchema);