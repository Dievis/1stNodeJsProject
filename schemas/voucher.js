const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Tên của mã giảm giá
    code: { type: String, required: true, unique: true }, // Mã giảm giá
    discountPercentage: { type: Number, required: true, min: 0, max: 100 }, // Số phần trăm giảm giá
    expirationDate: { type: Date, required: true }, // Ngày hết hạn
    isActive: { type: Boolean, default: true }, // Trạng thái voucher
    isDelete: { type: Boolean, default: false } // Trạng thái xóa mềm
}, { timestamps: true });

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;