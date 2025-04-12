const FavoriteModel = require('../schemas/favorite');
const jwt = require('jsonwebtoken');
const User = require('../schemas/user'); 
const userController = require('../controllers/users');
var menuController = require('../controllers/menus');


exports.check_authentication = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        const user = await User.findById(decoded.id); 
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
        }

        req.user = user; 
        next();
    } catch (error) {
        console.error('Error verifying token:', error.message);
        res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};


async function addFavorite(userId, productId) {
    try {
        const existingFavorite = await FavoriteModel.findOne({ user: userId, product: productId });
        if (existingFavorite) {
            return { success: false, message: 'Sản phẩm đã có trong danh sách yêu thích' };
        }

        const favorite = new FavoriteModel({
            user: userId,
            product: productId
        });
        await favorite.save();
        return { success: true, data: favorite, message: 'Sản phẩm đã được thêm vào danh sách yêu thích' };
    } catch (error) {
        console.error('Error adding to favorites:', error.message);
        return { success: false, message: 'Internal Server Error', error: error.message };
    }
}
async function getFavoritesByUser(req, res) {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not logged in' });
        }
        let menus = await menuController.GetAllMenus();
        const userId = req.user._id; 
        const favorites = await FavoriteModel.find({ user: userId })
            .populate('product') 
            .populate('user');   
            res.render('user/favorites', {
                title: 'Danh sách yêu thích',
                menus: menus,
                favorites: favorites,
                user: req.user
            });
    } catch (error) {
        console.error('Error fetching favorites:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

async function removeFavorite(userId, productId) {
    try {
        const result = await FavoriteModel.findOneAndDelete({
            user: userId,
            product: productId
        });
        if (!result) {
            return { success: false, message: 'Sản phẩm không tồn tại trong danh sách yêu thích' };
        }
        return { success: true, data: result, message: 'Sản phẩm đã được xóa khỏi danh sách yêu thích' };
    } catch (error) {
        console.error('Error removing from favorites:', error.message);
        return { success: false, message: 'Internal Server Error', error: error.message };
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