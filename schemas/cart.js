const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'product', // Tham chiếu đến schema product
        required: true
    },
    quantity: {
        type: Number,
        min: 1,
        required: true
    },
    price: {
        type: Number,
        required: true // Lưu giá sản phẩm tại thời điểm thêm vào giỏ hàng
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0 // Lưu giảm giá áp dụng cho sản phẩm
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user', // Tham chiếu đến schema user
        required: true
    },
    items: [cartItemSchema], // Mảng các sản phẩm trong giỏ hàng
    totalPrice: {
        type: Number,
        default: 0 // Tổng giá trị của giỏ hàng
    },
    isCheckedOut: {
        type: Boolean,
        default: false // Trạng thái giỏ hàng (đã thanh toán hay chưa)
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('cart', cartSchema);