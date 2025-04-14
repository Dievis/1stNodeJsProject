const FavoriteModel = require('../schemas/favorite');
const ProductModel = require('../schemas/product');

async function addFavorite(userId, productId) {
  try {
    // Kiểm tra sản phẩm đã có trong danh sách yêu thích chưa
    const existingFavorite = await FavoriteModel.findOne({ user: userId, product: productId });
    if (existingFavorite) {
      return { success: false, message: 'Sản phẩm đã có trong danh sách yêu thích' };
    }

    // Thêm sản phẩm vào danh sách yêu thích
    const favorite = new FavoriteModel({
      user: userId,
      product: productId
    });
    await favorite.save();
    return { success: true, data: favorite };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function getFavoritesByUser(userId) {
  try {
    // Lấy danh sách yêu thích của người dùng
    const favorites = await FavoriteModel.find({ user: userId }).populate('product');
    return { success: true, data: favorites };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function removeFavorite(userId, productId) {
  try {
    // Xóa sản phẩm khỏi danh sách yêu thích
    const result = await FavoriteModel.findOneAndDelete({
      user: userId,
      product: productId
    });
    if (!result) {
      throw new Error('Sản phẩm không tồn tại trong danh sách yêu thích');
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error.message };
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