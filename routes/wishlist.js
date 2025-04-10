const express = require('express');
const Wishlist = require('../schemas/wishlist');
const router = express.Router();

// Thêm sản phẩm vào wishlist
router.post('/:userId', async (req, res) => {
  try {
    const { productId } = req.body;
    const wishlist = await Wishlist.findOne({ user: req.params.userId });

    if (!wishlist) {
      // Tạo wishlist mới nếu chưa tồn tại
      const newWishlist = new Wishlist({
        user: req.params.userId,
        products: [productId],
      });
      await newWishlist.save();
      return res.status(201).json({ message: 'Wishlist created', wishlist: newWishlist });
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
});

// Lấy danh sách sản phẩm yêu thích của người dùng
router.get('/:userId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.params.userId }).populate('products');

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Xóa sản phẩm khỏi wishlist
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.params.userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      (productId) => productId.toString() !== req.params.productId
    );
    await wishlist.save();

    res.status(200).json({ message: 'Product removed from wishlist', wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;