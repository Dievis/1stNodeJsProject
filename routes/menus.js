const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menus');
const { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');
const { CreateSuccessResponse, CreateErrorResponse } = require('../utils/responseHandler');

router.get('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), menuController.GetMenusForAdmin);

router.get('/edit/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async (req, res) => {
    try {
        const menu = await menuController.GetMenuById(req.params.id); 
        const menus = await menuController.GetMenusForAdmin(); 
        res.render('admin/editMenu', {
            title: 'Chỉnh sửa Menu',
            menu: menu,
            menus: menus,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching menu for edit:', error.message);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Lỗi khi lấy thông tin menu.',
            error: req.app.get('env') === 'development' ? error : {}
        });
    }
});

router.get('/', check_authentication, async function (req, res, next) {
    try {
        let result = await menuController.GetAllMenus();
        CreateSuccessResponse(res, 200, result);
    } catch (error) {
        CreateErrorResponse(res, 404, error.message);
    }
});

router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
    try {
        let newMenu = await menuController.CreateMenu(req.body);
        CreateSuccessResponse(res, 200, newMenu);
    } catch (error) {
        CreateErrorResponse(res, 404, error.message);
    }
});

router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
    try {
        const updatedMenu = await menuController.UpdateMenu(req.params.id, req.body);
        CreateSuccessResponse(res, 200, updatedMenu);
    } catch (error) {
        CreateErrorResponse(res, 404, error.message);
    }
});

router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
    try {
        await menuController.DeleteMenu(req.params.id);
        CreateSuccessResponse(res, 200, { message: "Menu deleted successfully" });
    } catch (error) {
        CreateErrorResponse(res, 404, error.message);
    }
});

module.exports = router;
