const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    code: { type: String, required: true, unique: true }, 
    discountPercentage: { type: Number, required: true, min: 0, max: 100 }, 
    expirationDate: { type: Date, required: true }, 
    isActive: { type: Boolean, default: true }, 
    isDelete: { type: Boolean, default: false } 
}, { timestamps: true });

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;