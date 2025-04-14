//- filepath: d:\Github\TPD\1stNodeJsProject\controllers\payments.js

const Payment = require('../schemas/payment');
const Cart = require('../schemas/cart');
const Product = require('../schemas/product'); // Import schema Product
const { Voucher, RedeemedVoucher } = require('../schemas/voucher'); // Import schema Voucher and RedeemedVoucher
const { redeemVoucher } = require('./voucher'); // Import hàm redeemVoucher
var menuController = require('../controllers/menus');

// Tạo thanh toán
const createPayment = async (req, res) => {
    try {
        const { userId, voucherCodes } = req.body; // Nhận danh sách mã voucher từ request body

        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Lọc các sản phẩm được chọn (isChoosed: true)
        const selectedItems = cart.items.filter(item => item.isChoosed);
        if (selectedItems.length === 0) {
            return res.status(400).json({ message: 'No items selected for payment' });
        }

        // Tính tổng giá tiền của các sản phẩm được chọn
        const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Tìm các voucher đã được người dùng này sử dụng
        const redeemedVouchers = await RedeemedVoucher.find({ user: userId }).select('voucher');
        const redeemedVoucherIds = redeemedVouchers.map(rv => rv.voucher);

        // Tìm các voucher từ database dựa trên mã voucher và loại bỏ những voucher đã được sử dụng
        const vouchers = await Voucher.find({
            code: { $in: voucherCodes }, // Chỉ lấy các voucher có mã trong danh sách
            _id: { $nin: redeemedVoucherIds }, // Loại bỏ các voucher đã được người dùng sử dụng
            isActive: true // Chỉ lấy các voucher đang hoạt động
        });

        // Tính tổng tiền giảm giá dựa trên các voucher
        let totalDiscount = 0;
        const usedVoucherIds = []; // Danh sách ObjectId của các voucher đã sử dụng
        for (const voucher of vouchers) {
            const discount = Math.min(
                (totalPrice * voucher.discountPercentage) / 100, // Giảm giá theo phần trăm
                voucher.maximumDiscount // Giới hạn số tiền giảm tối đa
            );
            totalDiscount += discount;

            // Gọi hàm redeemVoucher để đánh dấu voucher đã được sử dụng
            const redeemResult = await redeemVoucher({
                body: { userId, voucherId: voucher._id }
            }, {
                status: () => ({ json: () => null }) // Mock response object
            });

            if (redeemResult?.status === 400) {
                return res.status(400).json({ message: `Failed to redeem voucher: ${voucher.code}` });
            }

            // Thêm ObjectId của voucher vào danh sách các voucher đã sử dụng
            usedVoucherIds.push(voucher._id);
        }

        // Tính tổng tiền sau khi đã trừ đi tổng tiền giảm giá
        const finalPrice = totalPrice - totalDiscount;

        // Tạo thanh toán
        const payment = new Payment({
            user: userId,
            items: selectedItems,
            itemTotalPrice: totalPrice, // Tổng giá tiền ban đầu
            discountTotal: totalDiscount, // Tổng tiền giảm giá
            totalPrice: finalPrice, // Tổng tiền sau khi giảm giá
            vouchers: usedVoucherIds // Lưu ObjectId của các voucher đã sử dụng
        });

        await payment.save();

        // Xóa các mặt hàng đã được thanh toán khỏi giỏ hàng
        cart.items = cart.items.filter(item => !item.isChoosed);
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0); // Cập nhật tổng giá tiền
        await cart.save();

        // Giảm số lượng sản phẩm trong bảng product
        for (const item of selectedItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.quantity -= item.quantity; // Trừ số lượng đã thanh toán
                if (product.quantity < 0) {
                    product.quantity = 0; // Đảm bảo số lượng không âm
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

// Lấy các sản phẩm được chọn từ giỏ hàng
const getPaymentPreview = async (req, res) => {
    try {
        const { userId } = req.params;
        const { voucherCodes } = req.body; // Nhận danh sách mã voucher từ request body

        // Tìm giỏ hàng của người dùng và populate sản phẩm
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
        
        // Lọc các sản phẩm được chọn (isChoosed: true)
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

        // Tính tổng giá tiền của các sản phẩm được chọn
        const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Tìm các voucher đã được người dùng này sử dụng
        const redeemedVouchers = await RedeemedVoucher.find({ user: userId }).select('voucher');
        const redeemedVoucherIds = redeemedVouchers.map(rv => rv.voucher);

        // Tìm các voucher từ database dựa trên mã voucher và loại bỏ những voucher đã được sử dụng
        const vouchers = await Voucher.find({
            code: { $in: voucherCodes }, // Chỉ lấy các voucher có mã trong danh sách
            _id: { $nin: redeemedVoucherIds }, // Loại bỏ các voucher đã được người dùng sử dụng
            isActive: true // Chỉ lấy các voucher đang hoạt động
        });
        let menus = await menuController.GetAllMenus();
        // Tính tổng tiền giảm giá dựa trên các voucher
        let totalDiscount = 0;
        for (const voucher of vouchers) {
            const discount = Math.min(
                (totalPrice * voucher.discountPercentage) / 100, // Giảm giá theo phần trăm
                voucher.maximumDiscount // Giới hạn số tiền giảm tối đa
            );
            totalDiscount += discount;
        }

        // Tính tổng tiền sau khi đã trừ đi tổng tiền giảm giá
        const finalPrice = totalPrice - totalDiscount;

        // Render giao diện payments.pug
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