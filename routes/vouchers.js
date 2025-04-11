const express = require('express');
const { addVoucher, deleteVoucher, updateVoucher, getAllVouchers } = require('../controllers/voucher');

const router = express.Router();

// Route để lấy danh sách tất cả các voucher
router.get('/', getAllVouchers); // Lấy tất cả voucher

// Route để thêm một voucher mới
router.post('/', addVoucher); // Thêm voucher

// Route để xóa một voucher theo ID
router.delete('/:id', deleteVoucher); // Xóa voucher

// Route để cập nhật một voucher theo ID
router.put('/:id', updateVoucher); // Sửa voucher

module.exports = router;