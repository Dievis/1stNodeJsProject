const express = require('express');
const router = express.Router();
const productSchema = require('../schemas/product');
const categorySchema = require('../schemas/category');
const userController = require('../controllers/users'); // Đảm bảo đường dẫn đúng
const userSchema = require('../schemas/user'); // Đảm bảo đường dẫn đúng
const { check_authentication, check_authorization } = require('../utils/check_auth');

// Middleware: Chỉ cho phép admin truy cập
router.use(check_authentication, check_authorization(['admin']));

// Route: Admin Dashboard
router.get('/dashboard', check_authentication, check_authorization(['admin']), async (req, res, next) => {
    try {
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: res.locals.user // Truyền thông tin người dùng vào giao diện
        });
    } catch (error) {
        next(error);
    }
});

// Route: Quản lý sản phẩm
router.get('/products', check_authentication, check_authorization(['admin']), async (req, res, next) => {
    try {
        const products = await productSchema.find().populate('category', 'name');
        res.render('admin/products', {
            title: 'Quản lý sản phẩm',
            products: products,
            user: res.locals.user
        });
    } catch (error) {
        next(error);
    }
});

// Route: Quản lý danh mục
router.get('/categories', check_authentication, check_authorization(['admin']), async (req, res, next) => {
    try {
        const categories = await categorySchema.find();
        res.render('admin/categories', {
            title: 'Quản lý danh mục',
            categories: categories,
            user: res.locals.user
        });
    } catch (error) {
        next(error);
    }
});

// Route: Quản lý người dùng
router.get('/users', check_authentication, check_authorization(['admin']), async (req, res, next) => {
    try {
        const users = await userController.GetAllUser();
        res.render('admin/users', {
            title: 'Quản lý người dùng',
            users: users,
            user: res.locals.user
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;