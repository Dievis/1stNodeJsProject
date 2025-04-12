//- filepath: d:\Github\TPD\1stNodeJsProject\controllers\categories.js

const categorySchema = require('../schemas/category');

// Hiển thị danh sách danh mục
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categorySchema.find();
        res.render('admin/categories', {
            title: 'Quản lý danh mục',
            categories: categories,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        res.status(500).send({ success: false, message: 'Lỗi khi lấy danh sách danh mục.' });
    }
};


exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = new categorySchema({
            name,
            description
        });
        await newCategory.save();
        res.status(200).json({ success: true, message: 'Thêm danh mục thành công.' });
    } catch (error) {
        console.error('Error creating category:', error.message);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm danh mục.' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, description } = req.body;

        const updatedCategory = await categorySchema.findByIdAndUpdate(
            categoryId,
            { name, description },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).send({
                success: false,
                message: 'Không tìm thấy danh mục để cập nhật.'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Cập nhật danh mục thành công.',
            data: updatedCategory
        });
    } catch (error) {
        console.error('Error updating category:', error.message);
        res.status(500).send({
            success: false,
            message: 'Lỗi khi cập nhật danh mục.'
        });
    }
};

// Xóa danh mục
exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id; // Lấy ID từ URL
        const deletedCategory = await categorySchema.findByIdAndDelete(categoryId); // Tìm và xóa danh mục

        if (!deletedCategory) {
            return res.status(404).send({
                success: false,
                message: 'Không tìm thấy danh mục để xóa.'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Xóa danh mục thành công.',
            data: deletedCategory
        });
    } catch (error) {
        console.error('Error deleting category:', error.message);
        res.status(500).send({
            success: false,
            message: 'Lỗi khi xóa danh mục.'
        });
    }
};