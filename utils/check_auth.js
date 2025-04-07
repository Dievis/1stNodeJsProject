var userController = require('../controllers/users')
let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')
module.exports = {
    check_authentication: async function (req, res, next) {
        let token;
        if (!req.headers || !req.headers.authorization) {
            token = req.signedCookies.token;
        } else {
            let authorizedtoken = req.headers.authorization;
            if (authorizedtoken.startsWith("Bearer ")) {
                token = authorizedtoken.split(" ")[1];
            }
        }

        if (!token) {
            return res.status(401).send({ success: false, message: "ban chua dang nhap" });
        }

        try {
            let result = jwt.verify(token, constants.SECRET_KEY);
            if (result.exp * 1000 < Date.now()) { // `exp` là giây, cần nhân với 1000 để so sánh với `Date.now()`
                return res.status(401).send({ success: false, message: "Token het han" });
            }

            let user = await userController.GetUserByID(result.id);
            if (!user) {
                return res.status(401).send({ success: false, message: "Nguoi dung khong ton tai" });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error("Authentication Error:", error.message);
            return res.status(403).send({ success: false, message: "Token khong hop le" });
        }
    },
    check_authorization: function (requiredRole) {
        return function (req, res, next) {
            let userRole = req.user.role.name;
            if (!requiredRole.includes(userRole)) {
                next(new Error("ban khong co quyen"));
            } else {
                next()
            }
        }
    }
}