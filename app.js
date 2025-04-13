var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
let constants = require("./utils/constants");
let { CreateErrorResponse } = require('./utils/responseHandler');
let cors = require('cors');
const jwt = require('jsonwebtoken');
const userController = require('./controllers/users');
let {createErrorResponse} = require('./utils/responseHandler');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

app.use(cors({
  origin: '*'
}));

mongoose.connect("mongodb://127.0.0.1:27017/S6"); //Change this to your mongodb connection string
mongoose.connection.on('connected', () => {
  console.log("connected");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(constants.SECRET_KEY_COOKIE));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware xử lý token
app.use(async (req, res, next) => {
    try {
        const token = req.signedCookies.token; // Lấy token từ cookie đã ký
        console.log('Token:', token); // Log token để kiểm tra
        if (token) {
            const decoded = jwt.verify(token, constants.SECRET_KEY); // Giải mã token
            console.log('Decoded Token:', decoded); // Log thông tin giải mã token
            const user = await userController.GetUserById(decoded.id); // Lấy thông tin người dùng từ DB
            console.log('User:', user); // Log thông tin người dùng
            if (user) {
                res.locals.user = user; // Truyền thông tin user vào res.locals
            } else {
                res.locals.user = null; // Nếu không tìm thấy user, đặt null
            }
        } else {
            res.locals.user = null; // Nếu không có token, user là null
        }
    } catch (error) {
        console.error('Error verifying token:', error.message);
        res.locals.user = null; // Nếu lỗi, user là null
    }
    next();
});

app.use((req, res, next) => {
  res.locals.activeRoute = req.path; // Truyền route hiện tại vào biến cục bộ
  next();
});

app.use('/admin', adminRouter); 
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', require('./routes/auth'));
app.use('/menus', require('./routes/menus'));
app.use('/roles', require('./routes/roles'));
app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/categories'));
app.use('/favorites', require('./routes/favorites'));
app.use('/reviews', require('./routes/reviews'));
app.use('/vouchers', require('./routes/vouchers'));
app.use('/carts', require('./routes/carts'));
app.use('/payments', require('./routes/payments'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { error: err });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500);
    res.render('shared/error', {
        message: err.message,
        error: req.app.get('env') === 'development' ? err : {}
    });
});

module.exports = app;
