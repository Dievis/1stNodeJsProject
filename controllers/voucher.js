const { Voucher, RedeemedVoucher } = require('../schemas/voucher');
const mongoose = require('mongoose');

const getAllVouchers = async (req, res) => {
    try {
        console.log('Fetching vouchers...');
        const vouchers = await Voucher.find();
        console.log('Vouchers fetched:', vouchers);

        res.render('admin/vouchers', {
            title: 'Quản lý phiếu giảm giá',
            vouchers,
            user: req.user
        });
        console.log('Response sent.');
    } catch (error) {
        console.error('Error fetching vouchers:', error.message);
        res.status(500).send({ success: false, message: 'Không thể lấy mã giảm giá.' });
    }
};


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

const redeemVoucher = async (req, res) => {
    try {
        const { userId, voucherId } = req.body;

        console.log('Received userId:', userId);
        console.log('Received voucherId:', voucherId);

        if (!voucherId) {
            console.log('Voucher ID is missing.');
            return res.status(400).json({ message: 'Voucher ID is required.' });
        }

        if (!userId) {
            console.log('User ID is missing.');
            return res.status(400).json({ message: 'User ID is required.' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Invalid User ID.');
            return res.status(400).json({ message: 'Invalid User ID.' });
        }

        const voucher = await Voucher.findById(voucherId);
        if (!voucher) {
            console.log('Voucher not found.');
            return res.status(404).json({ message: 'Voucher not found.' });
        }

        if (!voucher.isActive || voucher.expirationDate < new Date()) {
            console.log('Voucher is not valid or has expired.');
            return res.status(400).json({ message: 'Voucher is not valid or has expired.' });
        }

        const alreadyRedeemed = await RedeemedVoucher.findOne({ user: userId, voucher: voucherId });
        if (alreadyRedeemed) {
            console.log('Voucher already redeemed.');
            return res.status(400).json({ message: 'Voucher already redeemed.' });
        }

        const redeemedVoucher = new RedeemedVoucher({
            user: userId,
            voucher: voucherId
        });
        await redeemedVoucher.save();

        console.log('Voucher redeemed successfully.');
        res.status(200).json({ message: 'Voucher redeemed successfully.', redeemedVoucher });
    } catch (error) {
        console.error('Error redeeming voucher:', error.message);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

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
    getVoucher, 
    addVoucher,
    deleteVoucher,
    updateVoucher,
    getAvailableVouchers,
    redeemVoucher,
    getRedeemedVouchers
};
