const { Voucher, RedeemedVoucher } = require('../schemas/voucher');

// Lấy danh sách tất cả các voucher
const getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find();
        res.render('admin/vouchers', {
            title: 'Quản lý phiếu giảm giá',
            vouchers,
            user: req.user
        });
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

module.exports = {
    getAllVouchers,
    getVoucher, // Xuất thêm hàm này để lấy voucher theo ID
    addVoucher,
    deleteVoucher,
    updateVoucher,
    getAvailableVouchers,
    redeemVoucher,
    getRedeemedVouchers
};
