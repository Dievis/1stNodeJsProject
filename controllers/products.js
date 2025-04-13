const productSchema = require('../schemas/product');
const categorySchema = require('../schemas/category');
const slugify = require('slugify');
const { getReviewsByProduct } = require('./reviews'); // import nếu cần


// Lấy danh sách sản phẩm
exports.getAllProducts = async (req, res) => {
    let query = req.query;
    let objQuery = {};
    if (query.name) {
        objQuery.name = new RegExp(query.name, 'i');
    } else {
        objQuery.name = new RegExp("", 'i');
    }
    objQuery.price = {};
    if (query.price) {
        if (query.price.$gte) {
            objQuery.price.$gte = Number(query.price.$gte);
        } else {
            objQuery.price.$gte = 0;
        }
        if (query.price.$lte) {
            objQuery.price.$lte = Number(query.price.$lte);
        } else {
            objQuery.price.$lte = 10000;
        }
    } else {
        objQuery.price.$lte = 10000;
        objQuery.price.$gte = 0;
    }

    try {
        const products = await productSchema.find(objQuery).populate('category');
        res.render('admin/products', {
            title: 'Quản lý sản phẩm',
            products: products,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).send({ success: false, message: 'Lỗi khi lấy danh sách sản phẩm.' });
    }
};

// Lấy thông tin chi tiết sản phẩm
exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id; // Lấy productId từ URL
        // Tìm sản phẩm trong cơ sở dữ liệu
        const product = await productSchema.findById(productId).populate('category');

        // Nếu không tìm thấy sản phẩm
        if (!product) {
            return res.status(404).send({ success: false, message: 'Sản phẩm không tồn tại.' });
        }

        // Trả về thông tin chi tiết sản phẩm
        res.render('user/productDetail', { // Tạo view 'productDetail' và truyền product vào
            title: `Chi tiết sản phẩm - ${product.name}`,
            product: product,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching product:', error.message);
        res.status(500).send({ success: false, message: 'Lỗi khi lấy thông tin sản phẩm.' });
    }
};

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
    try {
        let body = req.body;

        // Tìm danh mục dựa trên tên
        let category = await categorySchema.findOne({ name: body.category });
        if (category) {
            let newProduct = productSchema({
                name: body.name,
                price: body.price ? body.price : 1000,
                quantity: body.quantity ? body.quantity : 10,
                category: category._id, // Gán ObjectId của danh mục
                slug: slugify(body.name, {
                    lower: true
                })
            });
            await newProduct.save();
            res.status(200).send({
                success: true,
                data: newProduct
            });
        } else {
            res.status(404).send({
                success: false,
                message: "Không tìm thấy danh mục"
            });
        }
    } catch (error) {
        res.status(404).send({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
    try {
        let body = req.body;
        let updatedObj = {};

        if (body.name) {
            updatedObj.name = body.name;
        }
        if (body.quantity) {
            updatedObj.quantity = body.quantity;
        }
        if (body.price) {
            updatedObj.price = body.price;
        }
        if (body.category) {
            // Tìm danh mục dựa trên tên
            let category = await categorySchema.findOne({ name: body.category });
            if (category) {
                updatedObj.category = category._id; // Gán ObjectId của danh mục
            } else {
                return res.status(404).send({
                    success: false,
                    message: "Không tìm thấy danh mục"
                });
            }
        }

        let updatedProduct = await productSchema.findByIdAndUpdate(req.params.id, updatedObj, { new: true });
        res.status(200).send({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        res.status(404).send({
            success: false,
            message: error.message
        });
    }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        let updatedProduct = await productSchema.findByIdAndUpdate(req.params.id, {
            isDeleted: true
        }, { new: true });
        res.status(200).send({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        res.status(404).send({
            success: false,
            message: error.message
        });
    }
};