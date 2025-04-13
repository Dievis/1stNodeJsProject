//- filepath: d:\Github\TPD\1stNodeJsProject\routes\auth.js
var express = require('express');
var router = express.Router();
var userController = require('../controllers/users');
var menuController = require('../controllers/menus');
let userSchema = require('../schemas/user'); 

let { CreateSuccessResponse, CreateCookieResponse } = require('../utils/responseHandler')
let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')
let { check_authentication } = require('../utils/check_auth')
let crypto = require('crypto')
let mailer = require('../utils/mailer')
let { SignUpValidator, LoginValidator, validate } = require('../utils/validator')
let multer = require('multer')
let path = require('path')
let FormData = require('form-data')
let axios = require('axios')
let fs = require('fs')


// ======== Thêm các route render giao diện PUG ========
router.get('/login', async function (req, res) {
    let menus = await menuController.GetAllMenus();
    console.log('Menus:', menus); // Log danh sách menu
    
    res.render('shared/login', {
        title: 'Login',
        menus: menus,
    });

});
router.get('/signup', async function (req, res) {
    let menus = await menuController.GetAllMenus();
    console.log('Menus:', menus); // Log danh sách menu
    
    res.render('shared/signup', {
        title: 'Signup',
        menus: menus,
    });
});
router.get('/changepassword', async function (req, res) {
    let menus = await menuController.GetAllMenus();
    console.log('Menus:', menus); // Log danh sách menu
    
    res.render('user/changepassword', {
        title: 'Change Password',
        menus: menus,
    });
});
router.get('/forgotpassword', async function (req, res) {
    let menus = await menuController.GetAllMenus();
    console.log('Menus:', menus); // Log danh sách menu
    
    res.render('shared/forgotpassword', {
        title: 'Forgot Password',
        menus: menus,
    });
});
router.get('/resetpassword/:token', async function (req, res) {
    res.render('resetPassword', { token: req.params.token });
});

// ======== API ========
router.post('/signup', SignUpValidator, validate, async function (req, res, next) {
    try {
        let newUser = await userController.CreateAnUser(
            req.body.username, req.body.password, req.body.email, 'user'
        )
        CreateSuccessResponse(res, 200, newUser); // Gửi response thành công
        return res.redirect('/auth/login'); 
    } catch (error) {
        next(error);
    }
});
router.post('/login',  LoginValidator, validate, async function (req, res, next) {
    try {
        const user_id = await userController.CheckLogin(req.body.username, req.body.password);
        const exp = (new Date(Date.now() + 60 * 60 * 1000)).getTime(); // Token hết hạn sau 1 giờ
        const token = jwt.sign({ id: user_id, exp: exp }, constants.SECRET_KEY);

        // Lưu token vào cookie
        res.cookie('token', token, {
            httpOnly: true,
            signed: true, // Cookie phải được ký
            maxAge: 60 * 60 * 1000 // 1 giờ
        });

        // Lấy thông tin người dùng để kiểm tra vai trò
        const user = await userSchema.findById(user_id).populate('role');
        // Kiểm tra kiểu yêu cầu (JSON hoặc giao diện web)
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            // Trả về JSON nếu yêu cầu là API
            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                token: token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role.name
                }
            });
        } else {
            // Xử lý giao diện web
            if (user.role && user.role.name === 'admin') {
                console.log('Admin login successful:', user);
                return res.redirect('/admin/dashboard');
            }
            else if (user.role && user.role.name === 'user') {
                console.log('User login successful:', user);
                return res.redirect('/');
            } 
            else {
                return res.redirect('/');
            }
        }
    } catch (error) {
        console.error('Login error:', error.message);

        // Kiểm tra kiểu yêu cầu (JSON hoặc giao diện web)
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            // Trả về JSON nếu yêu cầu là API
            return res.status(401).json({
                success: false,
                message: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
            });
        } else {
            // Xử lý giao diện web
            return res.render('shared/login', {
                title: 'Login',
                error: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
            });
        }
    }
});
router.post('/logout', function (req, res, next) {
    CreateCookieResponse(res, 'token', "", Date.now()); // Xóa token
    return res.redirect('/auth/login');
});
router.get('/logout', function (req, res, next) {
    CreateCookieResponse(res, 'token', "", Date.now());
    CreateSuccessResponse(res, 200, { message: "Logged out successfully" });
});
router.get('/me', check_authentication, function (req, res, next) {
    CreateSuccessResponse(res, 200, req.user)
})
router.post('/change_password', check_authentication,
    function (req, res, next) {
        try {
            let oldpassword = req.body.oldpassword;
            let newpassword = req.body.newpassword;
            let result = userController.Change_Password(req.user, oldpassword, newpassword)
            CreateSuccessResponse(res, 200, result)
        } catch (error) {
            next(error)
        }
    })

router.post('/forgotpassword', async function (req, res, next) {
    try {
        let email = req.body.email;
        let user = await userController.GetUserByEmail(email);
        user.resetPasswordToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordTokenExp = (new Date(Date.now() + 10 * 60 * 1000));
        await user.save();
        let url = 'http://localhost:3000/auth/resetpassword/' + user.resetPasswordToken;
        await mailer.sendMailForgotPassword(user.email, url);
        CreateSuccessResponse(res, 200, url)
    } catch (error) {
        next(error)
    }
})
router.post('/resetpassword/:token', async function (req, res, next) {
    try {
        let token = req.params.token;
        let password = req.body.password;
        let user = await userController.GetUserByToken(token);
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordTokenExp = null;
        await user.save();
        CreateSuccessResponse(res, 200, user)
    } catch (error) {
        next(error)
    }
})
//storage
let avatarDir = path.join(__dirname, "../avatars");
let authURL = "http://localhost:3000/auth/avatars/";
let serverCDN = 'http://localhost:4000/upload';
let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarDir),
    filename: (req, file, cb) => cb(null,
        file.originalname
    )
})
let upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.match('image')) {
            cb(new Error("tao nhan anh? thoi"));
        } else {
            cb(null, true);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

//upload
router.post("/change_avatar", check_authentication, upload.single('avatar'), async function (req, res, next) {
    let imgPath = path.join(avatarDir, req.file.filename);
    let newform = new FormData();
    newform.append('avatar', fs.createReadStream(imgPath))
    let result = await axios.post(serverCDN, newform, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    fs.unlinkSync(imgPath)
    // let avatarURL = authURL + req.file.filename;
    req.user.avatarUrl = result.data.data;
    await req.user.save()
    CreateSuccessResponse(res, 200,req.user )
})

router.get("/avatars/:filename", function (req, res, next) {
    let pathAvatar = path.join(avatarDir, req.params.filename)
    res.sendFile(pathAvatar)
})

module.exports = router;
