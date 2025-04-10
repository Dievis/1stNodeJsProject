const bcrypt = require('bcrypt');
const password = "@Bi12345"; // Thay bằng mật khẩu gốc
const hash = "$2b$10$6g0WWSr5xYTxcPS6YTq4BuV9xRKHKQaMsHVV3sGQ8/NcHf1EZbxq6"; // Hash từ cơ sở dữ liệu

console.log(bcrypt.compareSync(password, hash)); // Kết quả: true hoặc false
