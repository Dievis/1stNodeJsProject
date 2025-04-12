const bcrypt = require('bcrypt');
const password = "@User123"; // Thay bằng mật khẩu gốc
const hash = "$2b$10$G3kSDrPIXvFYEFpsbLhYguYnZ1.CPhldPUZMfyBFy98XE.QBQ3qG2"; // Hash từ cơ sở dữ liệu

console.log(bcrypt.compareSync(password, hash)); // Kết quả: true hoặc false
