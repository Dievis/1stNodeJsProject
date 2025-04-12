const Payment = require('../schemas/payment');
const Cart = require('../schemas/cart');

// Tạo thanh toán
const createPayment = async (req, res) => {
    try {
        const { userId } = req.body;

        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Lọc các sản phẩm được chọn (isChoosed: true)
        const selectedItems = cart.items.filter(item => item.isChoosed);
        if (selectedItems.length === 0) {
            return res.status(400).json({ message: 'No items selected for payment' });
        }

        // Tính toán tổng giá trị
        const itemTotalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountTotal = selectedItems.reduce((sum, item) => sum + ((item.price * item.quantity) * 0), 0);
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

        // Xóa các mặt hàng đã được thanh toán khỏi giỏ hàng
        cart.items = cart.items.filter(item => !item.isChoosed);
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0); // Cập nhật tổng giá tiền
        await cart.save();

        res.status(201).json({ message: 'Payment created successfully', payment });
    } catch (error) {
        console.error('Error creating payment:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Lấy các sản phẩm được chọn từ giỏ hàng
const getPaymentPreview = async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const selectedItems = cart.items.filter(item => item.isChoosed);
        if (selectedItems.length === 0) {
            return res.status(400).json({ message: 'No items selected for payment' });
        }

        res.status(200).json({ message: 'Selected items for payment', items: selectedItems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy thông tin thanh toán
const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('items.product');
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa thanh toán
const deletePayment = async (req, res) => {
    try {
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
};

// Export các hàm xử lý
module.exports = {
    createPayment,
    getPaymentPreview,
    getPaymentById,
    deletePayment
};