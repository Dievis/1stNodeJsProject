var userController = require('../controllers/users');
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');
const RoleModel = require('../schemas/role'); 

module.exports = {
    check_authentication: async function (req, res, next) {
        try {
            const token = req.signedCookies.token;
            if (!token) {
                return res.redirect('/auth/login');
            }

            const decoded = jwt.verify(token, constants.SECRET_KEY);
            const user = await userController.GetUserById(decoded.id);
            if (!user) {
                return res.redirect('/auth/login');
            }

            req.user = user;
            res.locals.user = user;
            console.log('Authenticated User:', req.user);
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
                console.log('User Role:', req.user.role);

                if (typeof userRole === 'object' && userRole.name) {
                    userRole = userRole.name; 
                } else if (typeof userRole === 'string') {
                    userRole = userRole;
                } else {
                    return res.status(403).json({ success: false, message: "Role không hợp lệ" });
                }
                if (!requiredRoles.includes(userRole)) {
                    return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập." });
                }
                next();
            } catch (error) {
                console.error("Error in check_authorization:", error);
                return res.status(403).json({ success: false, message: "Lỗi xác thực quyền" });
            }
        };
    }
};