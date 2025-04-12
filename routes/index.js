//- filepath: d:\Github\TPD\1stNodeJsProject\routes\index.js

var express = require('express');
var router = express.Router();
var menuController = require('../controllers/menus');
let productSchema = require('../schemas/product');
let categorySchema = require('../schemas/category');
let { check_authentication } = require('../utils/check_auth');

/* GET home page. */
router.get('/', check_authentication, async function (req, res, next) {
    try {
        let menus = await menuController.GetAllMenus();
        let products = await productSchema.find({ isDeleted: false }).populate(
            { path: 'category', select: 'name' }
        );

        res.render('user/index', {
            title: 'Home Consumer Products',
            menus: menus,
            products: products,
            user: res.locals.user // Truyền thông tin user vào giao diện
        });
    } catch (error) {
        console.error('Error:', error.message); // Log lỗi
        res.status(500).send('Internal Server Error');
    }
});

/* API: Lấy sản phẩm theo danh mục */
router.get('/api/:category', async function (req, res, next) {
    try {
        let categorySlug = req.params.category;
        let category = await categorySchema.findOne({ slug: categorySlug });
        if (!category) {
            return res.status(404).send({ success: false, message: 'Danh mục không tồn tại.' });
        }

        let products = await productSchema.find({ category: category._id });
        res.send(products);
    } catch (error) {
        console.error('Error fetching products by category:', error.message);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
});

/* API: Lấy sản phẩm theo danh mục và slug sản phẩm */
router.get('/api/:category/:product', async function (req, res, next) {
    try {
        let categorySlug = req.params.category;
        let productSlug = req.params.product;

        let category = await categorySchema.findOne({ slug: categorySlug });
        if (!category) {
            return res.status(404).send({ success: false, message: 'Danh mục không tồn tại.' });
        }

        let product = await productSchema.findOne({
            category: category._id,
            slug: productSlug
        });

        if (!product) {
            return res.status(404).send({ success: false, message: 'Sản phẩm không tồn tại.' });
        }

        res.send(product);
    } catch (error) {
        console.error('Error fetching product by category and slug:', error.message);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
