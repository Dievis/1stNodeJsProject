var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
let { CreateSuccessResponse, CreateErrorResponse } = require('../utils/responseHandler')
let{check_authentication,check_authorization} = require('../utils/check_auth');
const constants = require('../utils/constants');


router.get('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  try {
    let users = await userController.GetAllUser(); 
    res.render('admin/users', {
      title: 'Quản lý người dùng',
      users: users, 
      user: res.locals.user 
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).send({ success: false, message: 'Lỗi khi lấy danh sách người dùng.' });
  }
});

router.post('/', async function (req, res, next) {
  try {
    let body = req.body;
    let newUser = await userController.CreateAnUser(body.username, body.password, body.email, body.role);
    CreateSuccessResponse(res, 200, newUser)
    
  } catch (error) {
    CreateErrorResponse(res, 404, error.message)
  }
});
router.put('/:id', check_authentication, async function (req, res, next) {
  try {
    const currentUser = req.user; 
    const updatedUser = await userController.UpdateAnUser(req.params.id, req.body, currentUser);
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});
router.delete('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  try {
    let userId = req.params.id;
    await userController.DeleteAnUser(userId);
    CreateSuccessResponse(res, 200, { message: "User deleted successfully" });
  } catch (error) {
    CreateErrorResponse(res, 404, error.message);
  }
});

router.post('/activate/:id', async function (req, res, next) {
    try {
        let userId = req.params.id;
        let updatedUser = await userController.ActivateUser(userId);
        CreateSuccessResponse(res, 200, { message: "Account activated successfully", user: updatedUser });
    } catch (error) {
        CreateErrorResponse(res, 404, error.message);
    }
});

module.exports = router;
