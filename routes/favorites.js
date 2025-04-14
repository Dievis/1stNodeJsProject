const express = require('express');
const router = express.Router();
const { check_authentication } = require('../utils/check_auth');
const favoritesController = require('../controllers/favorites');

router.get('/', check_authentication, favoritesController.getFavoritesByUser);

router.post('/', check_authentication, async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;
    const result = await favoritesController.addFavorite(userId, productId);
    res.status(result.success ? 200 : 400).json(result);
});

router.put('/', check_authentication, favoritesController.updateFavorite);

router.delete('/:productId', check_authentication, async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;
    const result = await favoritesController.removeFavorite(userId, productId);
    res.status(result.success ? 200 : 400).json(result);
});

module.exports = router;