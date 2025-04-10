let roleSchema = require('../schemas/role');

module.exports = {
    GetAllRoles: async function () {
        return await roleSchema.find({});
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