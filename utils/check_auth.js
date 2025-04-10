var userController = require('../controllers/users');
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');
const RoleModel = require('../schemas/role'); // Đảm bảo đường dẫn đúng đến schema Role

module.exports = {
    check_authentication: async function (req, res, next) {
        try {
            let token;

            // Lấy token từ header hoặc cookie
            if (req.headers && req.headers.authorization) {
                let authorizedToken = req.headers.authorization;
                if (authorizedToken.startsWith("Bearer ")) {
                    token = authorizedToken.split(" ")[1]; // Lấy phần sau "Bearer "
                }
            } else if (req.signedCookies && req.signedCookies.token) {
                token = req.signedCookies.token; // Lấy token từ cookie
            }

            if (!token) {
                return res.redirect('/auth/login'); // Chuyển hướng đến trang login nếu chưa đăng nhập
            }

            // Giải mã token
            let result = jwt.verify(token, constants.SECRET_KEY);

            // Lấy thông tin người dùng từ cơ sở dữ liệu
            let user = await userController.GetUserByID(result.id);
            if (!user) {
                return res.redirect('/auth/login'); // Chuyển hướng nếu người dùng không tồn tại
            }

            req.user = user; // Gắn thông tin người dùng vào request
            next();
        } catch (error) {
            return res.redirect('/auth/login'); // Chuyển hướng nếu token không hợp lệ
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