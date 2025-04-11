const express = require('express');
const { addVoucher, deleteVoucher, updateVoucher } = require('../controllers/voucherController');

const router = express.Router();

router.post('/vouchers', addVoucher); // Thêm voucher
router.delete('/vouchers/:id', deleteVoucher); // Xóa voucher
router.put('/vouchers/:id', updateVoucher); // Sửa voucher

module.exports = router;