const express = require('express');
const router = express.Router();
const { check_authentication } = require('../utils/check_auth');
const cartsController = require('../controllers/carts');

router.get('/:userId', check_authentication, cartsController.getCartByUserId);

router.post('/:userId', check_authentication, cartsController.addToCart);

router.put('/:userId', check_authentication, cartsController.updateCartItem);

router.delete('/:userId/:productId', check_authentication, cartsController.deleteCartItem);

router.get('/', check_authentication, cartsController.getCartByUser);

module.exports = router;