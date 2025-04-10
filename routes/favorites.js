const express = require('express');
const router = express.Router();
const { check_authentication } = require('../utils/check_auth');
const { addFavorite, getFavoritesByUser, removeFavorite } = require('../controllers/favorites');
const FavoriteModel = require('../schemas/favorite'); // Import FavoriteModel

router.post('/', check_authentication, async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id; 
        const favorite = await addFavorite(userId, productId);
        res.status(200).json({ success: true, data: favorite });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/', check_authentication, async (req, res) => {
    try {
        const userId = req.user._id; 
        const favorites = await getFavoritesByUser(userId);
        res.status(200).json({ success: true, data: favorites });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/', check_authentication, async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id; 
        const result = await removeFavorite(userId, productId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/', check_authentication, async (req, res) => {
    try {
        const { productId, newProductId } = req.body; 
        const userId = req.user._id; 

        const updatedFavorite = await FavoriteModel.findOneAndUpdate(
            { user: userId, product: productId }, 
            { product: newProductId }, 
            { new: true } 
        );

        if (!updatedFavorite) {
            return res.status(404).json({ success: false, message: 'Sản phẩm yêu thích không tồn tại' });
        }

        res.status(200).json({ success: true, data: updatedFavorite });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;