let userSchema = require('../schemas/user');
let roleSchema = require('../schemas/role');
const jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt');

module.exports = {
  GetAllUser: async function () {
    return await userSchema.find({})
      .populate('role', 'name') 
      .select('username email role'); 
  },

  GetUserById: async function (id) {
    try {
      const user = await userSchema.findById(id).populate('role', 'name'); 
      return user;
    } catch (error) {
      console.error('Error in GetUserByID:', error.message);
      throw error;
    }
  },

  GetUserByEmail: async function (email) {
    return await userSchema.findOne({ email: email }).populate('role', 'name');
  },

  GetUserByToken: async function (token) {
    return await userSchema.findOne({ resetPasswordToken: token }).populate('role', 'name');
  },

  CreateAnUser: async function (username, password, email, role) {
    try {
        let roleObj = await roleSchema.findOne({ name: role }); 
        if (roleObj) {
            let hashedPassword = await bcrypt.hash(password, 10); 
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

  UpdateAnUser: async function (id, body, currentUser) {
    try {
        const getUser = await userSchema.findById(id);
        if (!getUser) {
            throw new Error('Người dùng không tồn tại');
        }

        if (currentUser.role.name === 'admin') {
            if (!body.role) {
                throw new Error('Trường role là bắt buộc.');
            }

            const roleObj = await roleSchema.findOne({ name: body.role });
            if (!roleObj) {
                throw new Error('Role không tồn tại.');
            }

            getUser.role = roleObj._id; 
        } 
        else if (currentUser._id.toString() === id) {
            const allowFields = ['email', 'password', 'imgURL'];
            for (const key of Object.keys(body)) {
                if (allowFields.includes(key)) {
                    if (key === 'password') {
                        getUser.password = bcrypt.hashSync(body[key], 10); 
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

  DeleteAnUser: async function (id) {
    return await userSchema.findByIdAndUpdate(
      id,
      { status: false }, 
      { new: true } 
    );
  },

  ActivateUser: async function (id) {
    return await userSchema.findByIdAndUpdate(
      id,
      { status: true }, 
      { new: true } 
    );
  },

  CheckLogin: async function (username, password) {
    console.log("Checking login for:", username);
    let user = await userSchema.findOne({ username: username });
    if (!user) {
        console.log("User not found:", username);
        throw new Error("Tài khoản không tồn tại hoặc đã bị vô hiệu hóa");
    }

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log("Password mismatch for user:", username);
        throw new Error("Username hoặc password không đúng");
    }

    console.log("Password match for user:", username);
    return user._id; 
  },

  // Đổi mật khẩu
  Change_Password: async function (user, oldpassword, newpassword) {
    if (bcrypt.compareSync(oldpassword, user.password)) {
      user.password = await bcrypt.hash(newpassword, 10); 
      await user.save();
    } else {
      throw new Error("Mật khẩu cũ không đúng");
    }
  }
};