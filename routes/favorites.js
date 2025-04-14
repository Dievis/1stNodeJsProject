const express = require('express');
const router = express.Router();
const { check_authentication } = require('../utils/check_auth');
const favoritesController = require('../controllers/favorites');

// Render danh sách yêu thích
router.get('/', check_authentication, async (req, res) => {
    try {
        const result = await favoritesController.getFavoritesByUser(req.user._id);
        if (result.success) {
            res.render('user/favorites', { favorites: result.data });
        } else {
            res.render('user/favorites', { favorites: [], error: result.message });
        }
    } catch (error) {
        console.error('Error rendering favorites:', error);
        res.render('user/favorites', { favorites: [], error: 'Đã xảy ra lỗi khi tải danh sách yêu thích.' });
    }
});

// Thêm sản phẩm vào danh sách yêu thích
router.post('/', check_authentication, async (req, res) => {
    const { productId } = req.body;
    const result = await favoritesController.addFavorite(req.user._id, productId);
    res.status(result.success ? 200 : 400).json(result);
});

// Xóa sản phẩm khỏi danh sách yêu thích
router.delete('/:productId', check_authentication, async (req, res) => {
    const { productId } = req.params;

    try {
        const result = await favoritesController.removeFavorite(req.user._id, productId);
        if (result.success) {
            return res.status(200).json({ success: true, message: 'Sản phẩm đã được xóa khỏi danh sách yêu thích.' });
        } else {
            return res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error removing favorite:', error);
        return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi xóa sản phẩm khỏi danh sách yêu thích.' });
    }
});

router.put('/:productId', check_authentication, async (req, res) => {
  const { productId } = req.params;
  const { newProductId } = req.body;

  try {
    const result = await favoritesController.updateFavorite(req.user._id, productId, newProductId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;