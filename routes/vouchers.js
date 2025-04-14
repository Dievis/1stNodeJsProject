const express = require('express');
const {
    addVoucher,
    deleteVoucher,
    updateVoucher,
    getVoucher,
    getAllVouchers,
    getAvailableVouchers,
    redeemVoucher,
    getRedeemedVouchers
} = require('../controllers/voucher');
let { check_authentication, check_authorization } = require('../utils/check_auth');

const router = express.Router();

// Lấy danh sách tất cả các voucher
router.get('/', check_authentication, check_authorization(["admin", "mod"]), getAllVouchers);

// Lấy voucher theo ID (dùng cho form sửa voucher)
router.get('/:id', check_authentication, getVoucher);

// Thêm voucher
router.post('/', check_authentication, check_authorization(["admin", "mod"]), addVoucher);

// Xóa voucher theo ID
router.delete('/:id', check_authentication, check_authorization(["admin", "mod"]), deleteVoucher);

// Cập nhật voucher theo ID
router.put('/:id', check_authentication, check_authorization(["admin", "mod"]), updateVoucher);

// Lấy danh sách voucher chưa sử dụng
router.get('/available/:userId', getAvailableVouchers);

// Đánh dấu voucher là đã sử dụng
router.post('/redeem', redeemVoucher);

// Lấy danh sách voucher đã sử dụng
router.get('/redeemed/:userId', getRedeemedVouchers);


module.exports = router;
