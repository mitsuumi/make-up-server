// 第一個區塊 內建模組
const path = require('path');

// 第二個區塊 第三方模組(套件)
const express = require('express');
const session = require('express-session');
const connectFlash = require('connect-flash');
const csrfProtection = require('csurf');
const bodyParser = require('body-parser');


// 第三個區塊 自建模組
const database = require('./utils/database');
//引用資料庫
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const errorRoutes = require('./routes/404');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cartItem');
const products = require('./products');
const { log } = require('console');



////////////////////////////////////////////////////////////////

const app = express();
const port = 3000;
const oneDay = 1000 * 60 * 60 * 24;

// middleware
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ 
	secret: 'sessionToken',  // 加密用的字串
	resave: false,   // 沒變更內容是否強制回存
	saveUninitialized: false ,  // 新 session 未變更內容是否儲存
	cookie: {
		maxAge: oneDay // session 狀態儲存多久？單位為毫秒
	}
})); 
app.use(connectFlash());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.locals.pageTitle = 'Book Your Books online';
    res.locals.path = req.url;
    res.locals.isLogin = req.session.isLogin || false;
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findByPk(req.session.user.id)
        .then((user) => {
            console.log('postCartAddItem',user)
            req.user = user;
            next();
        })
        .catch((err) => {
            console.log('custom middleware - findUserBySession error: ', err);
        })
});


User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

app.use(authRoutes);
app.use(shopRoutes);
app.use(errorRoutes);


database
    .sync()
	// .sync({force: true}) 
	.then((result) => {
        // Product.bulkCreate(products);
		app.listen(port, () => {
			console.log(`Web Server is running on port ${port}`);
		});
	})
	.catch((err) => {
		console.log('create web server error: ', err);
	});

