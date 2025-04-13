//- filepath: d:\Github\TPD\1stNodeJsProject\controllers\products.js

const productSchema = require('../schemas/product');
const categorySchema = require('../schemas/category');
const slugify = require('slugify');
const getReviewsByProduct = require('./reviews').getReviewsByProduct;

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
        const productId = req.params.id; // Lấy productId từ URL
        // Tìm sản phẩm trong cơ sở dữ liệu
        const product = await productSchema.findById(productId).populate('category');

        // Nếu không tìm thấy sản phẩm
        if (!product) {
            return res.status(404).send({ success: false, message: 'Sản phẩm không tồn tại.' });
        }

        const reviews = await getReviewsByProduct(productId); // Lấy danh sách review của sản phẩm

        // Trả về thông tin chi tiết sản phẩm
        res.render('user/productDetail', { // Tạo view 'productDetail' và truyền product vào
            title: `Chi tiết sản phẩm - ${product.name}`, // Sửa lỗi template string
            product: product,
            user: req.user || null, // Đảm bảo req.user không bị undefined
            reviews,   // Truyền danh sách review vào view
            userFavorites: req.user?.favorites || [] // Sử dụng optional chaining để tránh lỗi
        });
    } catch (error) {
        console.error('Error fetching product:', error.message);
        res.status(500).send({ success: false, message: 'Lỗi khi lấy thông tin sản phẩm.' });
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
        // Kiểm tra sản phẩm có tồn tại
        const product = await productSchema.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ success: false, message: "Sản phẩm không tồn tại." });
        }

        // Kiểm tra trùng tên (trừ chính sản phẩm đang cập nhật)
        if (name && name !== product.name) {
            const existingProduct = await productSchema.findOne({ name });
            if (existingProduct) {
                return res.status(400).send({ success: false, message: "Tên sản phẩm đã tồn tại." });
            }
        }

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
        console.error('Error updating product:', error.message);
        res.status(500).send({ success: false, message: error.message });
    }
};

// Xóa sản phẩm (xóa mềm)
exports.deleteProduct = async (req, res) => {
    try {
        // Kiểm tra sản phẩm có tồn tại
        const product = await productSchema.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ success: false, message: "Sản phẩm không tồn tại." });
        }

        // Xóa mềm sản phẩm
        const updatedProduct = await productSchema.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );
        res.status(200).send({ success: true, data: updatedProduct });
    } catch (error) {
        console.error('Error deleting product:', error.message);
        res.status(500).send({ success: false, message: error.message });
    }
};
