let mongoose = require('mongoose');

let favoriteSchema = mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now // Thời gian thêm vào danh sách yêu thích
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('favorite', favoriteSchema);