var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
let constants = require("./utils/constants");
let cors = require('cors');
const jwt = require('jsonwebtoken');
const userController = require('./controllers/users');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

app.use(cors({
  origin: '*'
}));

mongoose.connect("mongodb://127.0.0.1:27017/S6");
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
    const token = req.signedCookies.token;
    console.log('Token:', token);
    if (token) {
      const decoded = jwt.verify(token, constants.SECRET_KEY);
      console.log('Decoded Token:', decoded);
      const user = await userController.GetUserById(decoded.id);
      console.log('User:', user);
      if (user) {
        res.locals.user = user;
      } else {
        res.locals.user = null;
      }
    } else {
      res.locals.user = null;
    }
  } catch (error) {
    console.error('Error verifying token:', error.message);
    res.locals.user = null;
  }
  next();
});

app.use((req, res, next) => {
  res.locals.activeRoute = req.path;
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

// ✅ Sửa lỗi ở đây: error handler chuẩn
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
