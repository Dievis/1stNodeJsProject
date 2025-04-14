const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payments');

router.post('/', paymentController.createPayment);

router.get('/preview/:userId', paymentController.getPaymentPreview);

router.get('/:id', paymentController.getPaymentById);

router.delete('/:id', paymentController.deletePayment);

module.exports = router;