module.exports = (req, res, next) => {
    if (!req.session.isLogin) {
        return res.redirect('/login');
    }
    next();
}

//middleWare:沒有登入就不可以進到購物車，直接導到登入頁