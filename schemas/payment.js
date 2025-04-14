const mongoose = require('mongoose');

const paymentDetailSchema = mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'product', 
        required: true
    },
    quantity: {
        type: Number,
        min: 1,
        required: true
    },
    price: {
        type: Number,
        required: true 
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0 
    },
    voucher: [{
        type: mongoose.Types.ObjectId,
        ref: 'voucher' 
    }]
}, {
    timestamps: true 
});

const paymentSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user', 
        required: true
    },
    items: [paymentDetailSchema],
    itemTotalPrice: {
        type: Number,
        default: 0
    },
    discountTotal: {
        type: Number,
        default: 0 
    },
    totalPrice: {
        type: Number,
        default: 0 
    },
    vouchers: [{
        type: mongoose.Types.ObjectId,
        ref: 'voucher' 
    }]
}, {
    timestamps: true 
});

module.exports = mongoose.model('payment', paymentSchema);