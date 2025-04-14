//- filepath: d:\Github\TPD\1stNodeJsProject\controllers\roles.js

let roleSchema = require('../schemas/role');

module.exports = {
    GetAllRoles: async function () {
        try {
            return await roleSchema.find({});
        } catch (error) {
            console.error('Error fetching roles:', error.message);
            throw new Error('Lỗi khi lấy danh sách vai trò.');
        }
    },
    CreateARole: async function (name) {
        let newRole = new roleSchema({
            name: name
        });
        return await newRole.save();
    },
    UpdateRole: async function (id, name) {
        return await roleSchema.findByIdAndUpdate(
            id,
            { name: name },
            { new: true } // Return the updated document
        );
    },
    DeleteRole: async function (id) {
        return await roleSchema.findByIdAndDelete(id);
    }
};