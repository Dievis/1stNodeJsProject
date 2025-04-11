var express = require('express');
var router = express.Router();
var menuController = require('../controllers/menus');
let productSchema = require('../schemas/product');

/* GET home page. */
router.get('/', async function (req, res, next) {
    try {
        let menus = await menuController.GetAllMenus();
        console.log('Menus:', menus); // Log danh sách menu

        let products = await productSchema.find({ isDeleted: false }).populate(
            { path: 'category', select: 'name' }
        );
        console.log('Products:', products); // Log danh sách sản phẩm

        res.render('index', {
            title: 'Home Consumer Products',
            menus: menus,
            products: products
        });
    } catch (error) {
        console.error('Error:', error.message); // Log lỗi
        res.status(500).send('Internal Server Error');
    }
});

router.get('/api/:category', async function (req, res, next) {
  let categorySlug = req.params.category;
  let category = await categorySchema.findOne({
    slug: categorySlug
  })
  let products = await productSchema.find({
    category:category._id
  })
  res.send(products)
});
router.get('/api/:category/:product', async function (req, res, next) {
  let categorySlug = req.params.category;
  let productSlug = req.params.product;
  let category = await categorySchema.findOne({
    slug: categorySlug
  })
  let products = await productSchema.find({
    category:category._id,
    slug:productSlug
  })
  res.send(products)
});

module.exports = router;
