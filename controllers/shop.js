const Product = require('../models/product');

////////////////////////////////////////////////////////////////

const getIndex = (req, res) => {
    Product.findAll()
        .then((products) => {
            res.status(200)
            return res.json({message: '連接成功',data: products})
            //用json是因為json檔案小，又有key and value，方便

                // .render('index', {
                //     path: '/',
                //     pageTitle: 'Book Your Books online',
                //     products
                // });
        })
        .catch((err) => {
            console.log('Product.findAll() error: ', err);
        })
};

const getCart = (req, res) => {
    req.user
        .getCart()
        //取得DB的物件
        .then((cart) => {
            //把物件取名為cart
            return cart.getProducts()
                .then((products) => {
                    // res.render('shop/cart', {
                    //     pageTitle: 'Cart',
                    //     products,
                    //     amount: cart.amount
                    // });
                    return res.json({products,amount: cart.amount,message: '新增成功'})
                })
                .catch((err) => {
                    console.log('getCart - cart.getProducts error: ', err);
                })
        })
        .catch((err) => {
            console.log('getCart - user.getCart error', err);
        })
}

const postCartAddItem = (req, res) => {
    console.log('postCartAddItem',req.user);
    const { productId } = req.body;
    // {productId: 12}
    //{}解構
    let userCart; //在外層宣告，之後.then()內都可以使用
    let newQuantity = 1;
    req.user
    //(app.js)先從 session 拿 user.id，然後從 User 資料表裡面抓這個 user.id 的資料，最後用 req.user = user 綁起來
        .getCart()
        //取得DB中cart的物件
        .then((cart) => {
            console.log('cart',cart)
            userCart = cart; //取得cart資料，賦值給外層取用

            // NOTE: 檢查 product 是否已在 cart
            return cart.getProducts({ where: { id: productId } });
            //get到那個被加進購物車的products {productId:12}
        })
        .then((products) => {
            let product;
            if (products.length > 0) {
                // NOTE: 本來購物車就有的商品，所以數量必定大於 1
                product = products[0];
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(productId);
        })
        .then((product) => {
            return userCart.addProduct(product, {
                through: { quantity: newQuantity }
            });
        })
        // NOTE: 下面這段在處理 amount 總額
        .then(() => {
            return userCart.getProducts();
        })
        .then((products) => {
            const productsSums = products.map((product) => product.price * product.cartItem.quantity);
            const amount = productsSums.reduce((accumulator, currentValue) => accumulator + currentValue);
            userCart.amount = amount;
            return userCart.save();
        })
        // .then(() => {
        //     res.redirect('/cart');
        // })
        .catch((err) => {
            console.log('postCartAddItem error: ', err);
        })
};
const postCartDeleteItem = (req, res, next) => {
    const { productId } = req.body;
    let userCart;
    req.user
        .getCart()
        //取得DB中cart的物件，丟到下面.then()中做參數
        .then((cart) => {
            userCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then((products) => {
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then(() => {
            return userCart
                .getProducts()
                .then((products) => {
                    if (products.length>0) {
                        const productSums = products.map((product) => product.price * product.cartItem.quantity);
                        const amount = productSums.reduce((accumulator, currentValue) => accumulator + currentValue);
                        userCart.amount = amount;
                        return userCart.save();
                     }else{
                        const amount = 0;
                        userCart.amount = amount;
                        return userCart.save();
                    }
                });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch((err) => console.log(err));
};

const plusOne = (req, res) => {
    let newQuantity = 1;
    const { productId } = req.body;
    let userCart;
    req.user
    .getCart()
    .then((cart) => {
        userCart = cart;
        return cart.getProducts({ where: { id: productId } });

    })
    .then((products) => {
        let product;
        if (products.length > 0) {
            // NOTE: 本來購物車就有的商品，所以數量必定大於 1
            product = products[0];
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1;
            return product.cartItem.update();
        }
        return Product.findByPk(productId);
    })
    .then((product) => {
        return userCart.addProduct(product, {
            through: { quantity: newQuantity }
        });
    })
    .then(() => {
        res.redirect('/cart');
    })
    .catch((err) => console.log(err));

    

    
    
}



module.exports = {
    getCart,
    getIndex,
    postCartAddItem,
    postCartDeleteItem,
    plusOne
}