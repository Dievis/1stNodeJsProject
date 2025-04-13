const { Voucher, RedeemedVoucher } = require('../schemas/voucher');

// Lấy danh sách tất cả các voucher
const getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find(); // Lấy tất cả các voucher
        res.status(200).json(vouchers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Thêm voucher
const addVoucher = async (req, res) => {
    try {
        const { name, code, discountPercentage, expirationDate } = req.body;

        // Tạo một voucher mới
        const newVoucher = new Voucher({
            name,
            code,
            discountPercentage,
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

        // Xóa voucher khỏi database
        const deletedVoucher = await Voucher.findByIdAndDelete(id);
        if (!deletedVoucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        res.status(200).json({ message: 'Voucher deleted successfully', voucher: deletedVoucher });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Sửa voucher
const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, discountPercentage, expirationDate, isActive } = req.body;

        // Cập nhật voucher
        const updatedVoucher = await Voucher.findByIdAndUpdate(
            id,
            { name, code, discountPercentage, expirationDate, isActive },
            { new: true, runValidators: true }
        );

        if (!updatedVoucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        res.status(200).json({ message: 'Voucher updated successfully', voucher: updatedVoucher });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAvailableVouchers = async (req, res) => {
    try {
        const { userId } = req.params;

        // Lấy danh sách voucher đã sử dụng của người dùng
        const redeemedVouchers = await RedeemedVoucher.find({ user: userId }).select('voucher');
        const redeemedVoucherIds = redeemedVouchers.map(rv => rv.voucher);

        // Lấy danh sách voucher chưa sử dụng
        const availableVouchers = await Voucher.find({
            _id: { $nin: redeemedVoucherIds }, // Loại bỏ các voucher đã sử dụng
            isActive: true // Chỉ lấy các voucher đang hoạt động
        });

        res.status(200).json(availableVouchers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const redeemVoucher = async (req, res) => {
    try {
        const { userId, voucherId } = req.body;

        // Kiểm tra xem voucher có tồn tại không
        const voucher = await Voucher.findById(voucherId);
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        // Kiểm tra xem voucher đã được sử dụng bởi người dùng chưa
        const alreadyRedeemed = await RedeemedVoucher.findOne({ user: userId, voucher: voucherId });
        if (alreadyRedeemed) {
            return res.status(400).json({ message: 'Voucher already redeemed' });
        }

        // Kiểm tra xem người dùng đã có danh sách voucher đã sử dụng chưa
        let redeemedVouchers = await RedeemedVoucher.find({ user: userId });
        if (redeemedVouchers.length === 0) {
            // Tạo danh sách voucher đã sử dụng (trống) cho người dùng
            redeemedVouchers = [];
        }

        // Tạo bản ghi voucher đã sử dụng
        const redeemedVoucher = new RedeemedVoucher({
            user: userId,
            voucher: voucherId
        });

        // Lưu bản ghi voucher đã sử dụng
        await redeemedVoucher.save();

        res.status(200).json({ message: 'Voucher redeemed successfully', redeemedVoucher });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRedeemedVouchers = async (req, res) => {
    try {
        const { userId } = req.params;

        // Kiểm tra xem người dùng đã có danh sách voucher đã sử dụng chưa
        let redeemedVouchers = await RedeemedVoucher.find({ user: userId }).populate('voucher');

        // Trả về danh sách voucher đã sử dụng
        res.status(200).json(redeemedVouchers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllVouchers,
    addVoucher,
    deleteVoucher,
    updateVoucher,
    getAvailableVouchers,
    redeemVoucher,
    getRedeemedVouchers
};