var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/product');
let categorySchema = require('../schemas/category');
let slugify = require('slugify');
let constants = require('../utils/constants');
let { check_authentication, check_authorization } = require('../utils/check_auth');

/* GET products listing. */
router.get('/', async function (req, res, next) {
    let query = req.query;
    console.log(query);
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

    let products = await productSchema.find(objQuery).populate(
        { path: 'category', select: 'name' }
    );
    res.send(products);
});

router.get('/:id', async function (req, res, next) {
    try {
        let product = await productSchema.findById(req.params.id);
        res.send({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(404).send({
            success: false,
            message: error.message
        });
    }
});

// Only admin can create a product
router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
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
});

// Only admin can update a product
router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
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
});

// Only admin can delete a product
router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
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
});

module.exports = router;
