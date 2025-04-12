//- filepath: d:\Github\TPD\1stNodeJsProject\routes\auth.pug

var userController = require('../controllers/users');
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');
const RoleModel = require('../schemas/role'); // Đảm bảo đường dẫn đúng đến schema Role

module.exports = {
    check_authentication: async function (req, res, next) {
        try {
            const token = req.signedCookies.token;
            if (!token) {
                return res.redirect('/auth/login');
            }

            const decoded = jwt.verify(token, constants.SECRET_KEY);
            const user = await userController.GetUserByID(decoded.id);
            if (!user) {
                return res.redirect('/auth/login');
            }

            req.user = user;
            res.locals.user = user;
            next();
        } catch (error) {
            console.error('Authentication error:', error.message);
            return res.redirect('/auth/login');
        }
    },

    check_authorization: function (requiredRoles) {
        return async function (req, res, next) {
            try {
                let userRole = req.user.role; // Lấy role từ req.user

                // Nếu role là ObjectId, truy vấn để lấy tên role
                if (typeof userRole === 'object' && userRole._id) {
                    const role = await RoleModel.findById(userRole._id);
                    if (!role) {
                        return res.status(403).json({ success: false, message: "Role khong ton tai" });
                    }
                    userRole = role.name; // Gán tên role
                } else if (typeof userRole === 'string') {
                    // Nếu role đã là chuỗi, không cần truy vấn
                    userRole = userRole;
                } else {
                    return res.status(403).json({ success: false, message: "Role khong hop le" });
                }

                // Kiểm tra quyền
                if (!requiredRoles.includes(userRole)) {
                    return res.status(403).json({ success: false, message: "ban khong co quyen" });
                }
                next();
            } catch (error) {
                console.error("Error in check_authorization:", error);
                return res.status(403).json({ success: false, message: "Loi xac thuc quyen" });
            }
        };
    }
};