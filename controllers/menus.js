const menuSchema = require('../schemas/menu');
const slugify = require('slugify');

module.exports = {
    GetAllMenus: async function () {
        try {
            let allmenu = await menuSchema.find({});
            let parents = allmenu.filter(m => !m.parent);
            let result = [];
            for (const parent of parents) {
                let children = allmenu.filter(m => String(m.parent) === String(parent._id));
                result.push({
                    text: parent.text,
                    url: parent.url,
                    children: children.map(child => ({
                        text: child.text,
                        url: child.url
                    }))
                });
            }
            return result;
        } catch (error) {
            console.error('Error fetching menus:', error.message);
            throw error;
        }
    },

    GetMenusForAdmin: async function (req, res) {
        try {
            const menus = await menuSchema.find({}).populate('parent', 'text');
            res.render('admin/menus', {
                title: 'Quản lý Menu',
                menus: menus,
                user: req.user 
            });
        } catch (error) {
            console.error('Error fetching menus for admin:', error.message);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Lỗi khi lấy danh sách menu.',
                error: req.app.get('env') === 'development' ? error : {}
            });
        }
    },

    CreateMenu: async function (body) {
        let objInput = {
            text: body.text,
            url: '/' + slugify(body.text, { lower: true })
        };
        if (body.parent) {
            let parent = await menuSchema.findOne({ text: body.parent });
            objInput.parent = parent._id;
        }
        let newMenu = new menuSchema(objInput);
        return await newMenu.save();
    },

    UpdateMenu: async function (id, body) {
        try {
            const updatedObj = {
                text: body.text,
                parent: body.parent || null 
            };

            return await menuSchema.findByIdAndUpdate(id, updatedObj, { new: true });
        } catch (error) {
            console.error('Error updating menu:', error.message);
            throw new Error('Lỗi khi cập nhật menu.');
        }
    },

    DeleteMenu: async function (id) {
        return await menuSchema.findByIdAndDelete(id);
    }
};