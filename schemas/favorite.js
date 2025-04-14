let mongoose = require('mongoose');

let favoriteSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'product', 
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
}, {
    timestamps: true 
});

// Thêm unique index để ngăn lưu trùng
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('favorite', favoriteSchema);
