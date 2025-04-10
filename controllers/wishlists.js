const Wishlist = require('../schemas/wishlists');

// Thêm sản phẩm vào wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.params.userId;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      // Tạo wishlist mới nếu chưa tồn tại
      wishlist = new Wishlist({
        user: userId,
        products: [productId],
      });
      await wishlist.save();
      return res.status(201).json({ message: 'Wishlist created', wishlist });
    }

    // Thêm sản phẩm vào wishlist hiện tại
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.status(200).json({ message: 'Product added to wishlist', wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Lấy danh sách sản phẩm yêu thích
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.params.userId;
    const wishlist = await Wishlist.findOne({ user: userId }).populate('products');

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Xóa sản phẩm khỏi wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.params.userId;
    const productId = req.params.productId;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );
    await wishlist.save();

    res.status(200).json({ message: 'Product removed from wishlist', wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};