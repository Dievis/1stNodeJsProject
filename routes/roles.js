var express = require('express');
var router = express.Router();
var roleController = require('../controllers/roles')
let constants = require('../utils/constants')
let {check_authentication,check_authorization} = require('../utils/check_auth')

let { CreateSuccessResponse, CreateErrorResponse } = require('../utils/responseHandler')

/* GET users listing. */
router.get('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let roles = await roleController.GetAllRoles();

    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return CreateSuccessResponse(res, 200, roles);
    } else {
      return res.render('admin/roles', {
        title: 'Quản lý Vai Trò',
        roles: roles,
        user: req.user
      });
    }
  } catch (error) {
    console.error('Error in GET /roles:', error.message); // Log lỗi chi tiết
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      // Trả về JSON nếu yêu cầu là API
      return CreateErrorResponse(res, 500, error.message);
    } else {
      return res.render('shared/error', {
        title: 'Error',
        message: 'Lỗi khi lấy danh sách vai trò: ' + error.message,
        error: req.app.get('env') === 'development' ? error : {}
      });
    }
  }
});
router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let body = req.body;
    let newRole = await roleController.CreateARole(body.name);

    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return CreateSuccessResponse(res, 200, newRole);
    } else {
      return res.render('admin/roles', {
        title: 'Quản lý Vai Trò',
        success: 'Thêm vai trò thành công!',
        roles: await roleController.GetAllRoles(),
        user: req.user
      });
    }
  } catch (error) {
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return CreateErrorResponse(res, 404, error.message);
    } else {
      return res.render('admin/roles', {
        title: 'Quản lý Vai Trò',
        error: 'Thêm vai trò thất bại: ' + error.message,
        roles: await roleController.GetAllRoles(),
        user: req.user
      });
    }
  }
});
router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let roleId = req.params.id;
    let body = req.body;
    let updatedRole = await roleController.UpdateRole(roleId, body.name);
    CreateSuccessResponse(res, 200, updatedRole);
  } catch (error) {
    CreateErrorResponse(res, 404, error.message);
  }
});
router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let roleId = req.params.id;
    await roleController.DeleteRole(roleId);
    CreateSuccessResponse(res, 200, { message: "Role deleted successfully" });
  } catch (error) {
    CreateErrorResponse(res, 404, error.message);
  }
});


module.exports = router;
