var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
let { CreateSuccessResponse, CreateErrorResponse } = require('../utils/responseHandler')
let{check_authentication,check_authorization} = require('../utils/check_auth');
const constants = require('../utils/constants');

/* GET users listing. */

router.get('/',check_authentication,check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  console.log(req.headers.authorization);
  let users = await userController.GetAllUser();
  CreateSuccessResponse(res, 200, users)
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
router.put('/:id', async function (req, res, next) {
  try {
    let body = req.body;
    let updatedResult = await userController.UpdateAnUser(req.params.id, body);
    CreateSuccessResponse(res, 200, updatedResult)
  } catch (error) {
    next(error)
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
