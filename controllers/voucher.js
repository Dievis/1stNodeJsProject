const { Voucher, RedeemedVoucher } = require('../schemas/voucher');

// Lấy danh sách tất cả các voucher
const getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find();

        // Kiểm tra vai trò của người dùng
        if (req.user.role === 'admin') {
            // Nếu là admin, render giao diện admin
            res.render('admin/vouchers', {
                title: 'Quản lý phiếu giảm giá',
                vouchers,
                user: req.user
            });
        } else if (req.user.role === 'user') {
            // Nếu là user, render giao diện user
            res.render('user/vouchers', {
                title: 'Danh sách Voucher',
                vouchers,
                user: req.user
            });
        } else {
            // Nếu không có quyền, trả về lỗi 403
            res.status(403).send({ success: false, message: 'Bạn không có quyền truy cập.' });
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách mã giảm giá:', error.message);
        res.status(500).send({ success: false, message: 'Không thể lấy mã giảm giá.' });
    }
};

// Lấy voucher theo ID (cho chức năng sửa voucher)
const getVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const voucher = await Voucher.findById(id);
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }
        res.status(200).json(voucher);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Thêm voucher
const addVoucher = async (req, res) => {
    try {
        const { name, code, discountPercentage, maximumDiscount, expirationDate } = req.body;
        const newVoucher = new Voucher({
            name,
            code,
            discountPercentage,
            maximumDiscount,
            expirationDate
        });
        await newVoucher.save();
        res.status(201).json({ message: 'Voucher created successfully', voucher: newVoucher });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Xóa voucher
const deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedVoucher = await Voucher.findByIdAndDelete(id);
        if (!deletedVoucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }
        res.status(200).json({ message: 'Voucher deleted successfully', voucher: deletedVoucher });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Cập nhật voucher
const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, discountPercentage, maximumDiscount, expirationDate, isActive } = req.body;
        const updatedVoucher = await Voucher.findByIdAndUpdate(
            id,
            {
                name,
                code,
                discountPercentage,
                maximumDiscount,
                expirationDate,
                isActive: isActive === 'true'
            },
            { new: true }
        );

        if (!updatedVoucher) {
            return res.status(404).json({ success: false, message: 'Voucher không tồn tại.' });
        }
        res.status(200).json({ success: true, data: updatedVoucher });
    } catch (error) {
        console.error('Error updating voucher:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật voucher.' });
    }
};

// Lấy danh sách voucher chưa sử dụng
const getAvailableVouchers = async (req, res) => {
    try {
        const { userId } = req.params;
        const redeemedVouchers = await RedeemedVoucher.find({ user: userId }).select('voucher');
        const redeemedVoucherIds = redeemedVouchers.map(rv => rv.voucher);
        const availableVouchers = await Voucher.find({
            _id: { $nin: redeemedVoucherIds },
            isActive: true
        });
        res.status(200).json(availableVouchers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Đánh dấu voucher là đã sử dụng
const redeemVoucher = async (req, res) => {
    try {
        const { userId, voucherId } = req.body;
        const voucher = await Voucher.findById(voucherId);
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }
        const alreadyRedeemed = await RedeemedVoucher.findOne({ user: userId, voucher: voucherId });
        if (alreadyRedeemed) {
            return res.status(400).json({ message: 'Voucher already redeemed' });
        }
        const redeemedVoucher = new RedeemedVoucher({
            user: userId,
            voucher: voucherId
        });
        await redeemedVoucher.save();
        res.status(200).json({ message: 'Voucher redeemed successfully', redeemedVoucher });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy danh sách voucher đã sử dụng
const getRedeemedVouchers = async (req, res) => {
    try {
        const { userId } = req.params;
        const redeemedVouchers = await RedeemedVoucher.find({ user: userId }).populate('voucher');
        res.status(200).json(redeemedVouchers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy danh sách voucher của người dùng
const getUserVouchers = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy ID người dùng từ thông tin đăng nhập
        const redeemedVouchers = await RedeemedVoucher.find({ user: userId }).select('voucher');
        const redeemedVoucherIds = redeemedVouchers.map(rv => rv.voucher);

        // Lấy danh sách voucher chưa sử dụng
        const availableVouchers = await Voucher.find({
            _id: { $nin: redeemedVoucherIds }, // Loại bỏ các voucher đã sử dụng
            isActive: true, // Chỉ lấy các voucher đang hoạt động
            expirationDate: { $gte: new Date() } // Chỉ lấy các voucher chưa hết hạn
        });

        res.render('user/vouchers', {
            title: 'Danh sách Voucher',
            vouchers: availableVouchers,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching user vouchers:', error.message);
        res.status(500).render('shared/error', {
            title: 'Lỗi',
            message: 'Không thể lấy danh sách voucher.',
            error: req.app.get('env') === 'development' ? error : {}
        });
    }
};

const useVoucher = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy ID người dùng từ thông tin đăng nhập
        const { voucherId } = req.body;

        // Kiểm tra voucher có tồn tại không
        const voucher = await Voucher.findById(voucherId);
        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher không tồn tại.' });
        }

        // Kiểm tra xem voucher đã được sử dụng chưa
        const alreadyRedeemed = await RedeemedVoucher.findOne({ user: userId, voucher: voucherId });
        if (alreadyRedeemed) {
            return res.status(400).json({ success: false, message: 'Voucher đã được sử dụng.' });
        }

        // Đánh dấu voucher là đã sử dụng
        const redeemedVoucher = new RedeemedVoucher({
            user: userId,
            voucher: voucherId
        });
        await redeemedVoucher.save();

        res.status(200).json({ success: true, message: 'Voucher đã được sử dụng thành công!' });
    } catch (error) {
        console.error('Error using voucher:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi khi sử dụng voucher.' });
    }
};

module.exports = {
    getAllVouchers,
    getVoucher, // Xuất thêm hàm này để lấy voucher theo ID
    addVoucher,
    deleteVoucher,
    updateVoucher,
    getAvailableVouchers,
    redeemVoucher,
    getRedeemedVouchers,
    getUserVouchers,
    useVoucher
};
