//- filepath: d:\Github\TPD\1stNodeJsProject\routes\categories.js

const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, deleteCategory, updateCategory  } = require('../controllers/categories');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');

// Hiển thị danh sách danh mục
router.get('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), getAllCategories);

// Xử lý thêm danh mục
router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), createCategory);

router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), updateCategory);

// Xóa danh mục
router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), deleteCategory);

module.exports = router;
