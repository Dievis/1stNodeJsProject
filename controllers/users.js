//- filepath: d:\Github\TPD\1stNodeJsProject\controllers\users.js

let userSchema = require('../schemas/user');
let roleSchema = require('../schemas/role');
const jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt');

module.exports = {
  // Lấy tất cả người dùng
  GetAllUser: async function () {
    return await userSchema.find({})
      .populate('role', 'name') // Chỉ lấy trường 'name' từ role
      .select('username email role'); // Chỉ lấy các trường cần thiết
  },

  // Lấy người dùng theo ID
  GetUserById: async function (id) {
    try {
      const user = await userSchema.findById(id).populate('role', 'name'); // Chỉ lấy trường 'name' từ role
      return user;
    } catch (error) {
      console.error('Error in GetUserByID:', error.message);
      throw error;
    }
  },

  // Lấy người dùng theo email
  GetUserByEmail: async function (email) {
    return await userSchema.findOne({ email: email }).populate('role', 'name');
  },

  // Lấy người dùng theo token
  GetUserByToken: async function (token) {
    return await userSchema.findOne({ resetPasswordToken: token }).populate('role', 'name');
  },

  // Tạo người dùng mới
  CreateAnUser: async function (username, password, email, role) {
    try {
        let roleObj = await roleSchema.findOne({ name: role }); // Tìm role theo tên
        if (roleObj) {
            // Hash mật khẩu
            let hashedPassword = await bcrypt.hash(password, 10); // 10 là số vòng lặp để mã hóa
            let newUser = new userSchema({
                username: username,
                password: hashedPassword, // Lưu mật khẩu đã mã hóa
                email: email,
                role: roleObj._id
            });
            return await newUser.save();
        } else {
            throw new Error('Role không tồn tại');
        }
    } catch (error) {
        console.error('Error in CreateAnUser:', error.message);
        throw new Error(error.message);
    }
  },

  // Cập nhật người dùng
  UpdateAnUser: async function (id, body, currentUser) {
    try {
        const getUser = await userSchema.findById(id);
        if (!getUser) {
            throw new Error('Người dùng không tồn tại');
        }

        // Nếu là admin, chỉ được phép cập nhật quyền (role)
        if (currentUser.role.name === 'admin') {
            if (!body.role) {
                throw new Error('Trường role là bắt buộc.');
            }

            const roleObj = await roleSchema.findOne({ name: body.role });
            if (!roleObj) {
                throw new Error('Role không tồn tại.');
            }

            getUser.role = roleObj._id; // Cập nhật quyền
        } 
        // Nếu là user, chỉ được phép cập nhật email, mật khẩu, hoặc ảnh
        else if (currentUser._id.toString() === id) {
            const allowFields = ['email', 'password', 'imgURL'];
            for (const key of Object.keys(body)) {
                if (allowFields.includes(key)) {
                    if (key === 'password') {
                        getUser.password = bcrypt.hashSync(body[key], 10); // Hash mật khẩu
                    } else {
                        getUser[key] = body[key];
                    }
                }
            }
        } else {
            throw new Error('Bạn không có quyền cập nhật thông tin người dùng này.');
        }

        return await getUser.save();
    } catch (error) {
        console.error('Error updating user:', error.message);
        throw new Error(error.message);
    }
  },

  // Xóa người dùng (xóa mềm)
  DeleteAnUser: async function (id) {
    return await userSchema.findByIdAndUpdate(
      id,
      { status: false }, // Xóa mềm bằng cách đặt status thành false
      { new: true } // Trả về tài liệu đã cập nhật
    );
  },

  // Kích hoạt người dùng
  ActivateUser: async function (id) {
    return await userSchema.findByIdAndUpdate(
      id,
      { status: true }, // Kích hoạt tài khoản
      { new: true } // Trả về tài liệu đã cập nhật
    );
  },

  // Kiểm tra đăng nhập
  CheckLogin: async function (username, password) {
    console.log("Checking login for:", username);
    let user = await userSchema.findOne({ username: username });
    if (!user) {
        console.log("User not found:", username);
        throw new Error("Tài khoản không tồn tại hoặc đã bị vô hiệu hóa");
    }

    // So sánh mật khẩu
    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log("Password mismatch for user:", username);
        throw new Error("Username hoặc password không đúng");
    }

    console.log("Password match for user:", username);
    return user._id; // Trả về ID người dùng nếu đăng nhập thành công
  },

  // Đổi mật khẩu
  Change_Password: async function (user, oldpassword, newpassword) {
    if (bcrypt.compareSync(oldpassword, user.password)) {
      user.password = await bcrypt.hash(newpassword, 10); // Hash mật khẩu mới
      await user.save();
    } else {
      throw new Error("Mật khẩu cũ không đúng");
    }
  }
};