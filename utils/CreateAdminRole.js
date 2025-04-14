const mongoose = require('mongoose');
const RoleModel = require('../schemas/role'); 

mongoose.connect("mongodb://127.0.0.1:27017/S6", { useNewUrlParser: true, useUnifiedTopology: true });

async function CreateAdminRole() {
  try {
    const existingRole = await RoleModel.findOne({ name: "admin" });
    if (existingRole) {
      console.log("Role 'admin' đã tồn tại.");
    } else {
      const adminRole = new RoleModel({
        name: "admin",
        description: "Administrator role with full permissions" // Mô tả cho role admin
      });
      await adminRole.save();
      console.log("Role 'admin' đã được tạo thành công!");
    }
  } catch (error) {
    console.error("Lỗi khi tạo role admin:", error);
  } finally {
    mongoose.disconnect();
  }
}

CreateAdminRole();