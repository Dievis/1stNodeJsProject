const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    secure: false, 
    auth: {
      user: "e90d74ac5af6de",
      pass: "87a02e3eb1bce9",
    },
  });
module.exports = {
    sendMailForgotPassword: async function(to,URL){
        return await transporter.sendMail({
            to:to,
            subject:"THU MOI DU LICH VIEC NHE VOLT CAO",
            html:`<a href=${URL}>CLICK VAO DAY DE DANG KI QUA CAM</a>`
        })
    }
}