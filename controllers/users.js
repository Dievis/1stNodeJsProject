let userSchema = require('../schemas/user');
let roleSchema = require('../schemas/role');
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
        let hashedPassword = bcrypt.hashSync(password, 10); // Hash mật khẩu
        let newUser = new userSchema({
          username: username,
          password: hashedPassword,
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
  UpdateAnUser: async function (id, body) {
    let allowField = ["password", "email", "imgURL"];
    let getUser = await userSchema.findById(id);
    if (!getUser) {
      throw new Error('Người dùng không tồn tại');
    }
    for (const key of Object.keys(body)) {
      if (allowField.includes(key)) {
        if (key === "password") {
          getUser[key] = bcrypt.hashSync(body[key], 10); // Hash password nếu được cập nhật
        } else {
          getUser[key] = body[key];
        }
      }
    }
    return await getUser.save();
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
    } else {
      console.log("User found:", user);
      if (bcrypt.compareSync(password, user.password)) {
        console.log("Password match for user:", username);
        return user._id;
      } else {
        console.log("Password mismatch for user:", username);
        throw new Error("Username hoặc password không đúng");
      }
    }
  },

  // Đổi mật khẩu
  Change_Password: async function (user, oldpassword, newpassword) {
    if (bcrypt.compareSync(oldpassword, user.password)) {
      user.password = bcrypt.hashSync(newpassword, 10); // Hash mật khẩu mới
      await user.save();
    } else {
      throw new Error("Mật khẩu cũ không đúng");
    }
  }
};