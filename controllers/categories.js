//- filepath: d:\Github\TPD\1stNodeJsProject\controllers\categories.js

const categorySchema = require('../schemas/category');
const { CreateSuccessResponse, CreateErrorResponse } = require('../utils/responseHandler');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categorySchema.find({ isDeleted: false }); // Lấy danh mục chưa bị xóa
        res.render('admin/categories', {
            title: 'Quản lý danh mục',
            categories: categories,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching categories:', error.message); // Log lỗi chi tiết
        res.status(500).render('shared/error', {
            title: 'Error',
            message: 'Lỗi khi lấy danh sách danh mục.',
            error: req.app.get('env') === 'development' ? error : {}
        });
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
        CreateSuccessResponse(res, 201, 'Thêm danh mục thành công.');
    } catch (error) {
        console.error('Error creating category:', error.message);
        CreateErrorResponse(res, 500, 'Lỗi khi thêm danh mục.');
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
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục để cập nhật.'
            });
        }

        CreateSuccessResponse(res, 200, {
            success: true,
            message: 'Cập nhật danh mục thành công.',
            data: updatedCategory
        });
    } catch (error) {
        console.error('Error updating category:', error.message);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật danh mục.'
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id; // Lấy ID từ URL
        const deletedCategory = await categorySchema.findByIdAndUpdate(
            categoryId,
            { isDeleted: true }, // Đánh dấu là đã xóa
            { new: true }
        );

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục để xóa.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Xóa danh mục thành công.',
            data: deletedCategory
        });
    } catch (error) {
        console.error('Error deleting category:', error.message);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa danh mục.'
        });
    }
};