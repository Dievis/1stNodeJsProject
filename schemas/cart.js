const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'product', 
        required: true
    },
    quantity: {
        type: Number,
        min: 1,
        required: true
    },
    price: {
        type: Number,
        required: true 
    },
    isChoosed: {
        type: Boolean,
        default: true 
    }
}, {
    timestamps: true 
});

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user', 
        required: true
    },
    items: [cartItemSchema], 
    totalPrice: {
        type: Number,
        default: 0 
    },
    isCheckedOut: {
        type: Boolean,
        default: false 
    }       
}, {
    timestamps: true 
});

module.exports = mongoose.model('cart', cartSchema);