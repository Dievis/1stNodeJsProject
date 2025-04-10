let userSchema = require('../schemas/user');
let roleSchema = require('../schemas/role');
let bcrypt = require('bcrypt');

module.exports = {
  GetAllUser: async function () {
    return await userSchema.find({}).populate('role');
  },
  GetUserByID: async function (id) {
    return await userSchema.findById(id).populate('role');
  },
  GetUserByEmail: async function (email) {
    return await userSchema.findOne({ email: email }).populate('role');
  },
  GetUserByToken: async function (token) {
    return await userSchema.findOne({ resetPasswordToken: token }).populate('role');
  },
  CreateAnUser: async function (username, password, email, role) {
    try {
      let roleObj = await roleSchema.findOne({
        name: role
      })
      if (roleObj) {
        let newUser = new userSchema({
          username: username,
          password: password,
          email: email,
          role: roleObj._id
        })
        return await newUser.save();
      } else {
        throw new Error('role khong ton tai')
      }
    } catch (error) {
      throw new Error(error.message)
    }
  },
  UpdateAnUser: async function (id, body) {
    let allowField = ["password", "email", "imgURL"];
    let getUser = await userSchema.findById(id);
    for (const key of Object.keys(body)) {
      if (allowField.includes(key)) {
        if (key === "password") {
          getUser[key] = bcrypt.hashSync(body[key], 10); // Hash password if updated
        } else {
          getUser[key] = body[key];
        }
      }
    }
    return await getUser.save();
  },
  DeleteAnUser: async function (id) {
    return await userSchema.findByIdAndUpdate(
      id,
      { status: false }, // Soft delete by setting status to false
      { new: true } // Return the updated document
    );
  },
  ActivateUser: async function (id) {
    return await userSchema.findByIdAndUpdate(
        id,
        { status: true }, // Activate the account
        { new: true } // Return the updated document
    );
  },
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
  Change_Password: async function (user, oldpassword, newpassword) {
    if (bcrypt.compareSync(oldpassword, user.password)) {
      user.password = bcrypt.hashSync(newpassword, 10); // Hash the new password
      await user.save();
    } else {
      throw new Error("Old password không đúng");
    }
  }
};