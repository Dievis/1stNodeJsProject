const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, deleteCategory, updateCategory } = require('../controllers/categories');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');

router.get('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), getAllCategories);

router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), createCategory);

router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), updateCategory);

router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), deleteCategory);

module.exports = router;
