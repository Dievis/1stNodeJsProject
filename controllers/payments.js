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
    const { userId } = req.params;

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

    // Lấy danh sách voucher từ giỏ hàng
    const voucherCodes = cart.vouchers || [];

    // Tìm các voucher từ database
    const vouchers = await Voucher.find({
      code: { $in: voucherCodes },
      isActive: true
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

      // Đánh dấu voucher đã được sử dụng
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
      vouchers: usedVoucherIds, // Lưu ObjectId của các voucher đã sử dụng
      status: 'Completed' // Trạng thái thanh toán
    });

    await payment.save();

    // Xóa các mặt hàng đã được thanh toán khỏi giỏ hàng
    cart.items = cart.items.filter(item => !item.isChoosed);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0); // Cập nhật tổng giá tiền
    await cart.save();

    // Xóa các voucher đã chọn khỏi giỏ hàng
    cart.vouchers = [];
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

    // Hiển thị thông báo và chuyển hướng về giỏ hàng
    res.status(200).send(`
      <script>
        alert('Thanh toán thành công!');
        window.location.href = '/carts';
      </script>
    `);
  } catch (error) {
    console.error('Error creating payment:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy các sản phẩm được chọn từ giỏ hàng
const getPaymentPreview = async (req, res) => {
    try {
        const { userId } = req.params;

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

        // Lấy danh sách voucher từ giỏ hàng
        const voucherCodes = cart.vouchers || [];

        // Tìm các voucher từ database
        const vouchers = await Voucher.find({
            code: { $in: voucherCodes },
            isActive: true
        });

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
            userId,
            title: 'Xác nhận thanh toán',
            selectedItems,
            totalPrice,
            totalDiscount,
            finalPrice,
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

// Lấy lịch sử thanh toán
const getPaymentHistory = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).send('Bạn cần đăng nhập để xem lịch sử thanh toán.');
        }

        const userId = req.user._id;
        const payments = await Payment.find({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name price'
            })
            .sort({ createdAt: -1 });

        // Lọc các sản phẩm không tồn tại
        const validPayments = payments.map(payment => {
            payment.items = payment.items.filter(item => item.product !== null);
            return payment;
        });

        res.render('user/orderHistory', {
            title: 'Lịch sử thanh toán',
            payments: validPayments
        });
    } catch (error) {
        console.error('Error fetching payment history:', error.message);
        res.status(500).send('Đã xảy ra lỗi khi tải lịch sử thanh toán.');
    }
};

// Export các hàm xử lý
module.exports = {
    createPayment,
    getPaymentPreview,
    getPaymentById,
    deletePayment,
    getPaymentHistory
};