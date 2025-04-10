var express = require('express');
var router = express.Router();
var menuController = require('../controllers/menus');
let { CreateSuccessResponse, CreateErrorResponse } = require('../utils/responseHandler');
let { check_authentication, check_authorization } = require('../utils/check_auth');
let constants = require('../utils/constants');

/* GET menus listing. */
router.get('/', async function (req, res, next) {
    try {
        let result = await menuController.GetAllMenus();
        CreateSuccessResponse(res, 200, result);
    } catch (error) {
        CreateErrorResponse(res, 404, error.message);
    }
});

/* POST a new menu (Admin only) */
router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
    try {
        let newMenu = await menuController.CreateMenu(req.body);
        CreateSuccessResponse(res, 200, newMenu);
    } catch (error) {
        CreateErrorResponse(res, 404, error.message);
    }
});

/* PUT (update) a menu (Admin only) */
router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
    try {
        let updatedMenu = await menuController.UpdateMenu(req.params.id, req.body);
        CreateSuccessResponse(res, 200, updatedMenu);
    } catch (error) {
        CreateErrorResponse(res, 404, error.message);
    }
});

/* DELETE a menu (Admin only) */
router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
    try {
        await menuController.DeleteMenu(req.params.id);
        CreateSuccessResponse(res, 200, { message: "Menu deleted successfully" });
    } catch (error) {
        CreateErrorResponse(res, 404, error.message);
    }
});

module.exports = router;
