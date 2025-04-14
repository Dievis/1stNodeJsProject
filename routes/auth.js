var express = require('express');
var router = express.Router();
var userController = require('../controllers/users');
var menuController = require('../controllers/menus');
let userSchema = require('../schemas/user'); 
let bcrypt = require('bcrypt');
let { CreateSuccessResponse, CreateCookieResponse, CreateErrorResponse } = require('../utils/responseHandler')
let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')
let { check_authentication } = require('../utils/check_auth')
let crypto = require('crypto')
let mailer = require('../utils/mailer')
let { SignUpValidator, LoginValidator, ForgotPasswordValidator, validate } = require('../utils/validator')
let multer = require('multer')
let path = require('path')
let FormData = require('form-data')
let axios = require('axios')
let fs = require('fs')


router.get('/login', async function (req, res) {
    let menus = await menuController.GetAllMenus();
    console.log('Menus:', menus); 
    
    res.render('shared/login', {
        title: 'Login',
        menus: menus,
    });

});
router.get('/signup', async function (req, res) {
    let menus = await menuController.GetAllMenus();
    console.log('Menus:', menus); 
    
    res.render('shared/signup', {
        title: 'Signup',
        menus: menus,
    });
});
router.get('/changepassword', async function (req, res) {
    let menus = await menuController.GetAllMenus();
    console.log('Menus:', menus); 
    
    res.render('user/changepassword', {
        title: 'Change Password',
        menus: menus,
    });
});
router.get('/forgotpassword', async function (req, res) {
    let menus = await menuController.GetAllMenus();
    console.log('Menus:', menus); 
    
    res.render('shared/forgotpassword', {
        title: 'Forgot Password',
        menus: menus,
    });
});
router.get('/resetpassword/:token', async function (req, res) {
    res.render('shared/resetPassword', { token: req.params.token });
});

router.post('/signup', SignUpValidator, validate, async function (req, res, next) {
    try {
        let newUser = await userController.CreateAnUser(
            req.body.username,
            req.body.password, 
            req.body.email,
            'user'
        );

        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            return res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email
                }
            });
        } else {
            return res.redirect('/auth/login');
        }
    } catch (error) {
        console.error('Signup error:', error.message);

        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            return res.status(400).json({
                success: false,
                message: 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
            });
        } else {
            return res.render('shared/signup', {
                title: 'Signup',
                error: 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
            });
        }
    }
});
router.post('/login',  LoginValidator, validate, async function (req, res, next) {
    try {
        const user_id = await userController.CheckLogin(req.body.username, req.body.password);
        const exp = (new Date(Date.now() + 60 * 60 * 1000)).getTime(); // Token hết hạn sau 1 giờ
        const token = jwt.sign({ id: user_id, exp: exp }, constants.SECRET_KEY);

        res.cookie('token', token, {
            httpOnly: true,
            signed: true, 
            maxAge: 60 * 60 * 1000 
        });

        const user = await userSchema.findById(user_id).populate('role');
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
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
            if (user.role && user.role.name === 'admin') {
                console.log('Admin login successful:', user);
                return res.redirect('/admin/dashboard');
            } else {
                return res.redirect('/');
            }
        }
    } catch (error) {
        console.error('Login error:', error.message);

        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            return res.status(401).json({
                success: false,
                message: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
            });
        } else {
            return res.render('shared/login', {
                title: 'Login',
                error: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
            });
        }
    }
});
router.post('/logout', function (req, res, next) {
    CreateCookieResponse(res, 'token', "", Date.now()); 
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

router.post('/forgotpassword', ForgotPasswordValidator, validate, async function (req, res, next) {
    try {
        let email = req.body.email;
        let user = await userController.GetUserByEmail(email);

        if (!user) {
            return CreateErrorResponse(res, 404, "Email không tồn tại trong hệ thống");
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExp = new Date(Date.now() + 10 * 60 * 1000); 
        await user.save();

        const resetUrl = `http://localhost:3000/auth/resetpassword/${user.resetPasswordToken}`;        
        
        await mailer.sendMailForgotPassword(user.email, resetUrl);
        
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            return CreateSuccessResponse(res, 200, { message: "Email đặt lại mật khẩu đã được gửi.", resetUrl });
        } else {
            return res.render('shared/forgotPassword', {
                title: 'Forgot Password',
                success: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error.message);
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            return CreateErrorResponse(res, 500, "Đã xảy ra lỗi khi gửi email đặt lại mật khẩu.");
        } else {
            return res.render('shared/forgotPassword', {
                title: 'Forgot Password',
                error: 'Đã xảy ra lỗi khi gửi email đặt lại mật khẩu.'
            });
        }
    }
});

router.post('/resetpassword/:token', async function (req, res, next) {
    try {
        let token = req.params.token;
        let password = req.body.newpassword;

        if (!password) {
            if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
                return CreateErrorResponse(res, 400, "Mật khẩu mới không được để trống");
            } else {
                return res.render('shared/resetPassword', {
                    token: token,
                    error: "Mật khẩu mới không được để trống"
                });
            }
        }

        let user = await userSchema.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExp: { $gt: Date.now() } 
        });

        if (!user) {
            if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
                return CreateErrorResponse(res, 400, "Token không hợp lệ hoặc đã hết hạn");
            } else {
                return res.render('shared/resetPassword', {
                    token: token,
                    error: "Token không hợp lệ hoặc đã hết hạn"
                });
            }
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordTokenExp = null;
        await user.save();

        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            return CreateSuccessResponse(res, 200, { message: "Đặt lại mật khẩu thành công" });
        } else {
            return res.render('user/resetPassword', {
                token: token,
                success: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."
            });
        }
    } catch (error) {
        console.error('Reset password error:', error.message);
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            return CreateErrorResponse(res, 500, "Đã xảy ra lỗi khi đặt lại mật khẩu.");
        } else {
            return res.render('user/resetPassword', {
                token: token,
                error: "Đã xảy ra lỗi khi đặt lại mật khẩu."
            });
        }
    }
});

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
