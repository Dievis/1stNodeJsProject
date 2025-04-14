//- filepath: d:\Github\TPD\1stNodeJsProject\routes\auth.pug

var userController = require('../controllers/users');
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');
const RoleModel = require('../schemas/role'); // Đảm bảo đường dẫn đúng đến schema Role

module.exports = {
    check_authentication: async function (req, res, next) {
        try {
            console.log('Authenticating...');
            const token = req.signedCookies.token;
            if (!token) {
                console.log('Token không tồn tại.');
                return res.redirect('/auth/login');
            }

            const decoded = jwt.verify(token, constants.SECRET_KEY);
            const user = await userController.GetUserById(decoded.id);
            if (!user) {
                console.log('Không tìm thấy người dùng.');
                return res.redirect('/auth/login');
            }

            req.user = user;
            res.locals.user = user;
            console.log('User authenticated:', req.user);
            next();
        } catch (error) {
            console.error('Authentication error:', error.message);
            return res.redirect('/auth/login');
        }
    },

    check_authorization: function (requiredRoles) {
        return async function (req, res, next) {
            try {
                let userRole = req.user.role;

                // Nếu role là ObjectId, truy vấn để lấy tên role
                if (typeof userRole === 'object' || typeof userRole === 'string') {
                    const role = await RoleModel.findById(userRole);
                    if (!role) {
                        console.log('Role không tồn tại.');
                        return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập.' });
                    }
                    userRole = role.name; // Gán tên role
                }

                console.log('User Role:', userRole); // Log vai trò người dùng
                console.log('Required Roles:', requiredRoles); // Log các vai trò được phép

                // Kiểm tra quyền
                if (!requiredRoles.includes(userRole)) {
                    console.log('Authorization failed for role:', userRole);
                    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập.' });
                }

                console.log('Authorization passed for role:', userRole);
                next(); // Chuyển tiếp đến middleware hoặc controller tiếp theo
            } catch (error) {
                console.error('Authorization error:', error.message);
                return res.status(403).json({ success: false, message: 'Lỗi xác thực quyền.' });
            }
        };
    }
};