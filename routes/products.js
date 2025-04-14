const express = require('express');
const router = express.Router();
const upload = require('../utils/upload'); 
const { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/products');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');
const Cart = require('../schemas/cart'); 
const Product = require('../schemas/product'); 

router.get('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), getAllProducts);

router.get('/:id', check_authentication, getProductById);

router.post('/', 
    check_authentication, 
    check_authorization(constants.ADMIN_PERMISSION), 
    upload.single('image'),
    createProduct
);

router.put('/:id', 
    check_authentication, 
    check_authorization(constants.ADMIN_PERMISSION), 
    upload.single('image'), 
    updateProduct
);

router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), deleteProduct);

module.exports = router;
