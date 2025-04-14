//- filepath: d:\Github\TPD\1stNodeJsProject\controllers\carts.js

const Cart = require('../schemas/cart');
const Product = require('../schemas/product');
var menuController = require('../controllers/menus');

exports.getCartByUser = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not logged in' });
        }
        const userId = req.user._id; 
        const cart = await Cart.findOne({ user: userId }).populate('items.product'); 

        if (!cart || cart.items.length === 0) {
            return res.render('user/carts', {
                title: 'Giỏ hàng',
                cartItems: [],
                totalPrice: 0,
                user: req.user
            });
        }

        let menus = await menuController.GetAllMenus();
        const totalPrice = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity * (1 - item.discount / 100));
        }, 0);

        res.render('user/carts', {
            title: 'Giỏ hàng',
            menus: menus,
            cartItems: cart.items,
            totalPrice: totalPrice, 
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching cart:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getCartByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!req.user || req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
        }

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error fetching cart:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user._id; 
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
                discount: product.discount || 0 
            });
        }

        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        await cart.save();

        res.status(200).json({ success: true, message: 'Sản phẩm đã được thêm vào giỏ hàng', cart });
    } catch (error) {
        console.error('Error adding to cart:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity, isChoosed, vouchers } = req.body; // Nhận danh sách voucher từ request body

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        // Cập nhật sản phẩm trong giỏ hàng
        const item = cart.items.find(item => item.product.toString() === productId);
        if (item) {
            if (quantity !== undefined) {
                item.quantity = quantity;
            }
            if (isChoosed !== undefined) {
                item.isChoosed = isChoosed;
            }
        }

        // Cập nhật danh sách voucher được chọn
        if (vouchers !== undefined) {
            cart.vouchers = vouchers; // Ghi đè danh sách voucher
        }

        // Cập nhật tổng giá tiền
        cart.totalPrice = cart.items.reduce((total, item) => {
            if (item.isChoosed) {
                return total + (item.price * item.quantity);
            }
            return total;
        }, 0);

        await cart.save();
        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error updating cart:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deleteCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        await cart.save();

        res.status(200).json({ success: true, cart, message: 'Sản phẩm đã được xóa khỏi giỏ hàng' });
    } catch (error) {
        console.error('Error deleting from cart:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
