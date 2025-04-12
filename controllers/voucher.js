const Voucher = require('../schemas/voucher');

// Lấy danh sách tất cả các voucher
const getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find({ isDelete: false }); // Lấy các voucher chưa bị xóa
        res.status(200).json(vouchers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Thêm voucher
const addVoucher = async (req, res) => {
    try {
        const { name, code, discountPercentage, expirationDate } = req.body;
        const newVoucher = new Voucher({ name, code, discountPercentage, expirationDate });
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
        const deletedVoucher = await Voucher.findByIdAndUpdate(
            id,
            { isDelete: true },
            { new: true }
        );
        if (!deletedVoucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }
        res.status(200).json({ message: 'Voucher soft deleted successfully', voucher: deletedVoucher });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Sửa voucher
const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, discountPercentage, expirationDate, isActive } = req.body;
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

module.exports = { getAllVouchers, addVoucher, deleteVoucher, updateVoucher };