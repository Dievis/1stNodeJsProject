const Wishlist = require('../schemas/wishlist');
const Product = require('../schemas/product');

// Lấy danh sách wishlist của người dùng
exports.getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm sản phẩm vào wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            // Tạo wishlist mới nếu chưa tồn tại
            wishlist = new Wishlist({ user: req.user._id, products: [productId] });
        } else {
            // Kiểm tra sản phẩm đã có trong wishlist chưa
            if (wishlist.products.includes(productId)) {
                return res.status(400).json({ message: 'Product already in wishlist' });
            }
            wishlist.products.push(productId);
        }

        await wishlist.save();
        res.status(200).json({ message: 'Product added to wishlist', wishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa sản phẩm khỏi wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
        await wishlist.save();

        res.status(200).json({ message: 'Product removed from wishlist', wishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};