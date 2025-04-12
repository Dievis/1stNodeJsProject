const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payments');

// Tạo thanh toán
router.post('/', paymentController.createPayment);

// Lấy các sản phẩm được chọn từ giỏ hàng
router.get('/preview/:userId', paymentController.getPaymentPreview);

// Lấy thông tin thanh toán
router.get('/:id', paymentController.getPaymentById);

// Xóa thanh toán
router.delete('/:id', paymentController.deletePayment);

module.exports = router;