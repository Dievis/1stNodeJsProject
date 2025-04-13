//- filepath: d:\Github\TPD\1stNodeJsProject\controllers\categories.js

const categorySchema = require('../schemas/category');
const { CreateSuccessResponse, CreateErrorResponse } = require('../utils/responseHandler');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categorySchema.find({ isDeleted: false });
        res.render('admin/categories', {
            title: 'Quản lý danh mục',
            categories: categories,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        CreateErrorResponse(res, 500, 'Lỗi khi lấy danh sách danh mục.');
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
            { new: true } // Trả về danh mục đã cập nhật
        );

        if (!updatedCategory) {
            return CreateErrorResponse(res, 404, 'Không tìm thấy danh mục để cập nhật.');
        }

        CreateSuccessResponse(res, 200, {
            message: 'Cập nhật danh mục thành công.',
            data: updatedCategory
        });
    } catch (error) {
        console.error('Error updating category:', error.message);
        CreateErrorResponse(res, 500, 'Lỗi khi cập nhật danh mục.');
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
            return CreateErrorResponse(res, 404, 'Không tìm thấy danh mục để xóa.');
        }

        CreateSuccessResponse(res, 200, {
            message: 'Xóa danh mục thành công.',
            data: deletedCategory
        });
    } catch (error) {
        console.error('Error deleting category:', error.message);
        CreateErrorResponse(res, 500, 'Lỗi khi xóa danh mục.');
    }
};