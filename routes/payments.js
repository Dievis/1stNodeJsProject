const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payments');
const { check_authentication } = require('../utils/check_auth');
const Voucher = require('../schemas/voucher'); // Import model Voucher

// Lấy lịch sử thanh toán của người dùng
router.get('/history', check_authentication, paymentController.getPaymentHistory);

// Tạo thanh toán
router.post('/:userId', check_authentication, paymentController.createPayment);

// Lấy các sản phẩm được chọn từ giỏ hàng
router.get('/preview/:userId', check_authentication, paymentController.getPaymentPreview);

// Lấy thông tin thanh toán
router.get('/:id', check_authentication, paymentController.getPaymentById);

// Xóa thanh toán
router.delete('/:id', check_authentication, paymentController.deletePayment);

module.exports = router;