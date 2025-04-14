const productSchema = require('../schemas/product');
const categorySchema = require('../schemas/category');
const slugify = require('slugify');
const getReviewsByProduct = require('./reviews').getReviewsByProduct;

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

exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id; 
        const product = await productSchema.findById(productId).populate('category');

        if (!product) {
            return res.status(404).send({ success: false, message: 'Sản phẩm không tồn tại.' });
        }

        const reviews = await getReviewsByProduct(productId); 

        res.render('user/productDetail', { 
            title: `Chi tiết sản phẩm - ${product.name}`, 
            product: product,
            user: req.user || null, 
            reviews,   
            userFavorites: req.user?.favorites || [] 
        });
    } catch (error) {
        console.error('Error fetching product:', error.message);
        res.status(500).send({ success: false, message: 'Lỗi khi lấy thông tin sản phẩm.' });
    }
};

exports.createProduct = async (req, res) => {
    const { name, price = 1000, quantity = 10, category, discount = 0 } = req.body;

    try {
        const categoryFound = await categorySchema.findById(category);
        if (!categoryFound) {
            return res.status(404).send({ success: false, message: "Không tìm thấy danh mục." });
        }

        const newProduct = new productSchema({
            name,
            price,
            quantity,
            discount,
            category,
            imgURL: req.file ? `/uploads/${req.file.filename}` : '', 
            slug: slugify(name, { lower: true })
        });

        await newProduct.save();
        res.status(200).send({ success: true, data: newProduct });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    const { name, price, quantity, category, discount } = req.body;

    try {
        const product = await productSchema.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ success: false, message: "Sản phẩm không tồn tại." });
        }

        const updatedObj = {};
        if (name) updatedObj.name = name;
        if (price) updatedObj.price = price;
        if (quantity) updatedObj.quantity = quantity;
        if (discount) updatedObj.discount = discount;
        if (category) {
            const categoryFound = await categorySchema.findById(category);
            if (!categoryFound) {
                return res.status(404).send({ success: false, message: "Không tìm thấy danh mục." });
            }
            updatedObj.category = category;
        }
        if (req.file) {
            updatedObj.imgURL = `/uploads/${req.file.filename}`; 
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

exports.deleteProduct = async (req, res) => {
    try {
        const product = await productSchema.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ success: false, message: "Sản phẩm không tồn tại." });
        }

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
