const express = require('express');
const router = express.Router();
const Payment = require('../schemas/payment');
const Cart = require('../schemas/cart');

// Create: Tạo thanh toán và lưu vào database sau khi thanh toán thành công
router.post('/', async (req, res) => {
    try {
        const { userId } = req.body;

        // Lấy giỏ hàng của người dùng
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Lọc các sản phẩm được chọn (IsChoosed: true)
        const selectedItems = cart.items.filter(item => item.isChoosed);

        if (selectedItems.length === 0) {
            return res.status(400).json({ message: 'No items selected for payment' });
        }

        // Tính toán tổng giá trị
        const itemTotalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountTotal = selectedItems.reduce((sum, item) => sum + ((item.price * item.discount / 100) * item.quantity), 0);
        const totalPrice = itemTotalPrice - discountTotal;

        // Tạo thanh toán
        const payment = new Payment({
            user: userId,
            items: selectedItems,
            itemTotalPrice,
            discountTotal,
            totalPrice
        });

        await payment.save();
        res.status(201).json({ message: 'Payment created successfully', payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Read: Lấy các sản phẩm có thuộc tính IsChoosed từ cart để hiển thị trên trang thanh toán
router.get('/preview/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Lấy giỏ hàng của người dùng
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Lọc các sản phẩm được chọn (IsChoosed: true)
        const selectedItems = cart.items.filter(item => item.isChoosed);

        if (selectedItems.length === 0) {
            return res.status(400).json({ message: 'No items selected for payment' });
        }

        res.status(200).json({ message: 'Selected items for payment', items: selectedItems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Read: Lấy thông tin thanh toán
router.get('/:id', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('items.product');
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete: Xóa thanh toán (chỉ dành cho quản lý)
router.delete('/:id', async (req, res) => {
    try {
        // Kiểm tra quyền quản lý (giả sử có một middleware kiểm tra quyền)
        const isAdmin = req.user && req.user.role === 'admin';
        if (!isAdmin) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;