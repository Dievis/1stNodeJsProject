const productSchema = require('../schemas/product');
const categorySchema = require('../schemas/category');
const slugify = require('slugify');

// Lấy danh sách sản phẩm
exports.getAllProducts = async (req, res) => {
    const { name = "", price = {} } = req.query;

    const objQuery = {
        name: new RegExp(name, 'i'),
        price: {
            $gte: Number(price.$gte) || 0,
            $lte: Number(price.$lte) || 10000
        },
        isDeleted: false
    };

    try {
        const categories = await categorySchema.find({});
        const products = await productSchema.find(objQuery).populate('category');
        res.render('admin/products', {
            title: 'Quản lý sản phẩm',
            products,
            categories,
            user: req.user
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error.message);
        res.status(500).send({ success: false, message: 'Không thể lấy sản phẩm.' });
    }
};

// Lấy chi tiết sản phẩm
exports.getProductById = async (req, res) => {
    try {
        const product = await productSchema.findById(req.params.id);
        if (!product) throw new Error("Sản phẩm không tồn tại.");
        res.send({ success: true, data: product });
    } catch (error) {
        res.status(404).send({ success: false, message: error.message });
    }
};

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
    const { name, price = 1000, quantity = 10, category } = req.body;

    try {
        const categoryFound = await categorySchema.findById(category);
        if (!categoryFound) {
            return res.status(404).send({ success: false, message: "Không tìm thấy danh mục." });
        }

        const newProduct = new productSchema({
            name,
            price,
            quantity,
            category,
            slug: slugify(name, { lower: true })
        });

        await newProduct.save();
        res.status(200).send({ success: true, data: newProduct });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
    const { name, price, quantity, category } = req.body;

    try {
        const updatedObj = {};

        if (name) updatedObj.name = name;
        if (price) updatedObj.price = price;
        if (quantity) updatedObj.quantity = quantity;

        if (category) {
            const categoryFound = await categorySchema.findById(category);
            if (!categoryFound) {
                return res.status(404).send({ success: false, message: "Không tìm thấy danh mục." });
            }
            updatedObj.category = category;
        }

        const updatedProduct = await productSchema.findByIdAndUpdate(
            req.params.id,
            updatedObj,
            { new: true }
        );

        res.status(200).send({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// Xóa sản phẩm (xóa mềm)
exports.deleteProduct = async (req, res) => {
    try {
        const updatedProduct = await productSchema.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );
        res.status(200).send({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};
