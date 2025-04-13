const mongoose = require('mongoose');

// Voucher Schema
const voucherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    maximumDiscount: { type: Number, required: true, min: 0 }, // Số tiền giảm tối đa
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Voucher = mongoose.model('Voucher', voucherSchema);

// RedeemedVoucher Schema
const redeemedVoucherSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true }, // Người dùng đã sử dụng voucher
    voucher: { type: mongoose.Types.ObjectId, ref: 'Voucher', required: true }, // Voucher đã sử dụng
    redeemedAt: { type: Date, default: Date.now } // Thời gian sử dụng voucher
}, { timestamps: true });

const RedeemedVoucher = mongoose.model('RedeemedVoucher', redeemedVoucherSchema);

module.exports = {
    Voucher,
    RedeemedVoucher
};