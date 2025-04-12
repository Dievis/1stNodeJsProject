let mongoose = require('mongoose');
let Product = require('./product'); // Import product schema
let User = require('./user'); // Import user schema

let cartSchema = mongoose.Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        ref: 'product',
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    nameProduct: { // Tên sản phẩm từ product.js
        type: String,
        required: true
    },
    priceProduct: { // Giá sản phẩm từ product.js
        type: Number,
        required: true,
        min: 0
    },
    quantity: { // Số lượng sản phẩm trong giỏ hàng
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    totalPrice: { // Tổng giá tiền (priceProduct * quantity)
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

// Middleware to populate nameProduct and priceProduct
cartSchema.pre('save', async function (next) {
    try {
        // Lấy thông tin sản phẩm từ productId
        const product = await Product.findById(this.productId);
        if (!product) {
            throw new Error('Product not found');
        }
        this.nameProduct = product.name;
        this.priceProduct = product.price;

        // Tính tổng giá tiền
        this.totalPrice = this.priceProduct * this.quantity;

        // Kiểm tra userId có tồn tại không
        const user = await User.findById(this.userId);
        if (!user) {
            throw new Error('User not found');
        }

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('cart', cartSchema);