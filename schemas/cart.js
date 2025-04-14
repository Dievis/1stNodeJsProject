const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Tham chiếu đến model "Product"
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    isChoosed: { type: Boolean, default: true }
});

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Tham chiếu đến model "User"
    items: [cartItemSchema],
    totalPrice: { type: Number, default: 0 }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;