const FavoriteModel = require('../schemas/favorite');

async function addFavorite(userId, productId) {
    try {
        const existingFavorite = await FavoriteModel.findOne({ user: userId, product: productId });
        if (existingFavorite) {
            throw new Error('Sản phẩm đã có trong danh sách yêu thích');
        }

        const favorite = new FavoriteModel({
            user: userId,
            product: productId
        });
        await favorite.save();
        return favorite;
    } catch (error) {
        throw error;
    }
}

async function getFavoritesByUser(userId) {
    try {
        const favorites = await FavoriteModel.find({ user: userId })
            .populate('product') 
            .populate('user'); 
        return favorites;
    } catch (error) {
        throw error;
    }
}

async function removeFavorite(userId, productId) {
    try {
        const result = await FavoriteModel.findOneAndDelete({
            user: userId,
            product: productId
        });
        if (!result) {
            throw new Error('Sản phẩm không tồn tại trong danh sách yêu thích');
        }
        return result;
    } catch (error) {
        throw error;
    }
}

async function updateFavorite(userId, productId, newProductId) {
    try {
        const existingFavorite = await FavoriteModel.findOne({ user: userId, product: productId });
        if (!existingFavorite) {
            throw new Error('Sản phẩm không tồn tại trong danh sách yêu thích');
        }
        
        existingFavorite.product = newProductId;
        await existingFavorite.save();
        return existingFavorite;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    addFavorite,
    getFavoritesByUser,
    removeFavorite,
    updateFavorite
};