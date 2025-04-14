const express = require('express');
const router = express.Router();
const { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/products');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');
const Cart = require('../schemas/cart'); // Import cart schema
const Product = require('../schemas/product'); // Import product schema

// Lấy danh sách sản phẩm
router.get('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), getAllProducts);

// Lấy thông tin chi tiết sản phẩm
router.get('/:id', check_authentication, getProductById);

// Tạo sản phẩm mới
router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), createProduct);

// Cập nhật sản phẩm
router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), updateProduct);

// Xóa sản phẩm
router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), deleteProduct);


module.exports = router;
