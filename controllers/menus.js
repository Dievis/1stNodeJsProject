const menuSchema = require('../schemas/menu');
const slugify = require('slugify');

module.exports = {
    GetAllMenus: async function () {
        let allmenu = await menuSchema.find({});
        let parents = allmenu.filter(m => !m.parent);
        let result = [];
        for (const parent of parents) {
            let QueryChildren = await menuSchema.find({ parent: parent._id });
            let children = [];
            for (const child of QueryChildren) {
                children.push({
                    text: child.text,
                    url: child.url
                });
            }
            result.push({
                text: parent.text,
                url: parent.url,
                children: children
            });
        }
        return result;
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
        let updatedObj = {};
        if (body.text) {
            updatedObj.text = body.text;
            updatedObj.url = '/' + slugify(body.text, { lower: true });
        }
        if (body.parent) {
            let parent = await menuSchema.findOne({ text: body.parent });
            if (parent) {
                updatedObj.parent = parent._id;
            }
        }
        return await menuSchema.findByIdAndUpdate(id, updatedObj, { new: true });
    },
    DeleteMenu: async function (id) {
        return await menuSchema.findByIdAndDelete(id);
    }
};