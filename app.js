var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
let { CreateSuccessResponse, CreateErrorResponse } = require('./utils/responseHandler')
let constants = require("./utils/constants")
let cors = require('cors')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var wishlistRoutes = require('./routes/wishlistRoutes');
const Wishlist = require('./schemas/wishlist');
const Product = require('./schemas/product');

var app = express();

app.use(cors({
  origin:'*'
}))

mongoose.connect("mongodb://127.0.0.1:27017/S6"); //Change this to your mongodb connection string
mongoose.connection.on('connected',()=>{
  console.log("connected");
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(constants.SECRET_KEY_COOKIE));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', require('./routes/auth'));
app.use('/menus', require('./routes/menus'));
app.use('/roles', require('./routes/roles'));
app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/categories'));
app.use('/favorites', require('./routes/favorites'));
app.use('/reviews', require('./routes/reviews'));
app.use('/carts', require('./routes/carts'));

// Lấy wishlist của người dùng
app.get('/wishlist', async (req, res) => {
    try {
        const { userId } = req.query; // Lấy userId từ query string
        const wishlist = await Wishlist.findOne({ user: userId }).populate('products');
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Thêm sản phẩm vào wishlist
app.post('/wishlist/add', async (req, res) => {
    try {
        const { userId, productId } = req.body;

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            // Tạo wishlist mới nếu chưa tồn tại
            wishlist = new Wishlist({ user: userId, products: [productId] });
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
});

// Xóa sản phẩm khỏi wishlist
app.post('/wishlist/remove', async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
        await wishlist.save();

        res.status(200).json({ message: 'Product removed from wishlist', wishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  CreateErrorResponse(res, err.status||500, err.message)
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = app;
