const express = require('express');
const router = express.Router();
const Cart = require('../schemas/cart');
const Product = require('../schemas/product');

// GET: Lấy giỏ hàng của người dùng
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error fetching cart:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST: Thêm sản phẩm vào giỏ hàng
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                discount: product.discount
            });
        }

        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity * (1 - item.discount / 100));
        }, 0);

        await cart.save();
        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error adding to cart:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// PUT: Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity } = req.body;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.product.toString() === productId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Product not found in cart' });
        }

        item.quantity = quantity;

        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity * (1 - item.discount / 100));
        }, 0);

        await cart.save();
        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error updating cart:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// DELETE: Xóa sản phẩm khỏi giỏ hàng
router.delete('/:userId/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity * (1 - item.discount / 100));
        }, 0);

        await cart.save();
        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error deleting from cart:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;