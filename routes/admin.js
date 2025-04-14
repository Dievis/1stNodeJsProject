const express = require('express');
const router = express.Router();
const { check_authentication, check_authorization } = require('../utils/check_auth');

router.use(check_authentication, check_authorization(['admin']));

router.get('/dashboard', check_authentication, check_authorization(['admin']), async (req, res, next) => {
    try {
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: res.locals.user 
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;