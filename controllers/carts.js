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
        const userId = req.user._id; // Lấy ID người dùng từ `req.user`
        const { productId, quantity } = req.body; // Lấy ID sản phẩm và số lượng từ body request

        // Kiểm tra sản phẩm có tồn tại hay không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Tìm giỏ hàng của người dùng
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            // Nếu giỏ hàng chưa tồn tại, tạo mới
            cart = new Cart({ user: userId, items: [] });
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItem = cart.items.find(item => item.product.toString() === productId);

        if (existingItem) {
            // Nếu sản phẩm đã có, tăng số lượng
            existingItem.quantity += quantity;
        } else {
            // Nếu sản phẩm chưa có, thêm mới
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                discount: product.discount || 0 // Đảm bảo discount có giá trị mặc định là 0 nếu không tồn tại
            });
        }

        // Tính tổng giá trị giỏ hàng
        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity * (1 - item.discount / 100));
        }, 0);

        // Lưu giỏ hàng
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
            return total + (item.price * item.quantity * (1 - item.discount / 100));
        }, 0);

        await cart.save();
        res.redirect('/carts'); 
    } catch (error) {
        console.error('Error deleting from cart:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};