//- filepath: d:\Github\TPD\1stNodeJsProject\routes\vouchers.js

const express = require('express');
const { addVoucher, deleteVoucher, updateVoucher, getAllVouchers } = require('../controllers/voucher');
let {check_authentication,check_authorization} = require('../utils/check_auth')


const router = express.Router();

// Route để lấy danh sách tất cả các voucher
router.get('/',check_authentication,check_authorization(["admin","mod"]), getAllVouchers); // Lấy tất cả voucher

// Route để thêm một voucher mới
router.post('/',check_authentication,check_authorization(["admin","mod"]), addVoucher); // Thêm voucher

// Route để xóa một voucher theo ID
router.delete('/:id',check_authentication,check_authorization(["admin","mod"]), deleteVoucher); // Xóa voucher

// Route để cập nhật một voucher theo ID
router.put('/:id',check_authentication,check_authorization(["admin","mod"]), updateVoucher); // Sửa voucher

module.exports = router;