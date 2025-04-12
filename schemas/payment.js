const mongoose = require('mongoose');

const paymentDetailSchema = mongoose.Schema({
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
        required: true // Lưu giá sản phẩm tại thời điểm thanh toán
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0 // Lưu giảm giá áp dụng cho sản phẩm
    },
    voucher: [{
        type: mongoose.Types.ObjectId,
        ref: 'voucher' // Tham chiếu đến schema voucher
    }]
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

const paymentSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user', // Tham chiếu đến schema user
        required: true
    },
    items: [paymentDetailSchema], // Mảng các sản phẩm trong thanh toán
    itemTotalPrice: {
        type: Number,
        default: 0 // Tổng giá trị sản phẩm được chọn
    },
    discountTotal: {
        type: Number,
        default: 0 // Tổng giá trị được giảm
    },
    totalPrice: {
        type: Number,
        default: 0 // Tổng giá trị sau khi giảm
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('payment', paymentSchema);