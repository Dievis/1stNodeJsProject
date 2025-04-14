const Payment = require('../schemas/payment');
const Cart = require('../schemas/cart');
const Product = require('../schemas/product'); 
const { Voucher, RedeemedVoucher } = require('../schemas/voucher'); 
const { redeemVoucher } = require('./voucher'); 
var menuController = require('../controllers/menus');

// Tạo thanh toán
const createPayment = async (req, res) => {
    try {
        const { userId, voucherCodes } = req.body; 

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const selectedItems = cart.items.filter(item => item.isChoosed);
        if (selectedItems.length === 0) {
            return res.status(400).json({ message: 'No items selected for payment' });
        }

        const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const redeemedVouchers = await RedeemedVoucher.find({ user: userId }).select('voucher');
        const redeemedVoucherIds = redeemedVouchers.map(rv => rv.voucher);

        const vouchers = await Voucher.find({
            code: { $in: voucherCodes }, 
            _id: { $nin: redeemedVoucherIds }, 
            isActive: true 
        });

        let totalDiscount = 0;
        const usedVoucherIds = [];  
        for (const voucher of vouchers) {
            const discount = Math.min(
                (totalPrice * voucher.discountPercentage) / 100, 
                voucher.maximumDiscount 
            );
            totalDiscount += discount;

            const redeemResult = await redeemVoucher({
                body: { userId, voucherId: voucher._id }
            }, {
                status: () => ({ json: () => null }) 
            });

            if (redeemResult?.status === 400) {
                return res.status(400).json({ message: `Failed to redeem voucher: ${voucher.code}` });
            }

            usedVoucherIds.push(voucher._id);
        }

        const finalPrice = totalPrice - totalDiscount;

        const payment = new Payment({
            user: userId,
            items: selectedItems,
            itemTotalPrice: totalPrice, 
            discountTotal: totalDiscount, 
            totalPrice: finalPrice, 
            vouchers: usedVoucherIds 
        });

        await payment.save();

        cart.items = cart.items.filter(item => !item.isChoosed);
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0); // Cập nhật tổng giá tiền
        await cart.save();

        for (const item of selectedItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.quantity -= item.quantity; 
                if (product.quantity < 0) {
                    product.quantity = 0; 
                }
                await product.save();
            }
        }

        res.status(201).json({ message: 'Payment created successfully', payment });
    } catch (error) {
        console.error('Error creating payment:', error.message);
        res.status(500).json({ message: error.message });
    }
};

const getPaymentPreview = async (req, res) => {
    try {
        const { userId } = req.params;
        const { voucherCodes } = req.body; 

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            return res.render('user/payments', {
                title: 'Xác nhận thanh toán',
                selectedItems: [],
                totalPrice: 0,
                totalDiscount: 0,
                finalPrice: 0,
                message: 'Giỏ hàng không tồn tại'
            });
        }
        
        const selectedItems = cart.items.filter(item => item.isChoosed);
        if (selectedItems.length === 0) {
            return res.render('user/payments', {
                title: 'Xác nhận thanh toán',
                selectedItems: [],
                totalPrice: 0,
                totalDiscount: 0,
                finalPrice: 0,
                message: 'Không có sản phẩm nào được chọn để thanh toán'
            });
        }

        const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const redeemedVouchers = await RedeemedVoucher.find({ user: userId }).select('voucher');
        const redeemedVoucherIds = redeemedVouchers.map(rv => rv.voucher);

        const vouchers = await Voucher.find({
            code: { $in: voucherCodes }, 
            _id: { $nin: redeemedVoucherIds }, 
            isActive: true 
        });
        let menus = await menuController.GetAllMenus();
        let totalDiscount = 0;
        for (const voucher of vouchers) {
            const discount = Math.min(
                (totalPrice * voucher.discountPercentage) / 100,
                voucher.maximumDiscount 
            );
            totalDiscount += discount;
        }

        const finalPrice = totalPrice - totalDiscount;

        res.render('user/payments', {
            title: 'Xác nhận thanh toán',
            menus: menus,
            selectedItems: selectedItems,
            totalPrice: totalPrice,
            totalDiscount: totalDiscount,
            finalPrice: finalPrice,
            message: null
        });
    } catch (error) {
        console.error('Error in getPaymentPreview:', error.message);
        res.status(500).render('user/payments', {
            title: 'Xác nhận thanh toán',
            selectedItems: [],
            totalPrice: 0,
            totalDiscount: 0,
            finalPrice: 0,
            message: 'Đã xảy ra lỗi khi xử lý thanh toán'
        });
    }
};

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

module.exports = {
    createPayment,
    getPaymentPreview,
    getPaymentById,
    deletePayment
};