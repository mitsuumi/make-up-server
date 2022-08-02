const bcryptjs = require('bcryptjs');
const { redirect } = require('express/lib/response');

const User = require('../models/user');

////////////////////////////////////////////////////////////////


const getLogin = (req, res) => {
    const errorMessage = req.flash('errorMessage')[0];
    res.status(200)
        .render('auth/login', {
            pageTitle: 'Login',
            errorMessage
        });
};

const getSignup = (req, res) => {
    const errorMessage = req.flash('errorMessage')[0];
    res.status(200)
        .render('auth/signup', {
            pageTitle: 'Signup',
            errorMessage
        });
}

const postLogin = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ where: { email }})
        .then((user) => {
            console.log('user', user);
            if (!user) {
                return res.json({message: '錯誤的 Email 或 Password'})
            }
            bcryptjs
                .compare(password, user.password)
                .then((isMatch) => {
                    console.log('isMatch', isMatch);
                    if (isMatch) {
                        req.session.user = user;
                        req.session.isLogin = true;
                        req.session.save((err) => {
                            console.log('postLogin - save session error: ', err);
                            // res.redirect('/');
                        });
                        return res.json({ msgCode: 200,message: '登入成功'})
                    } 
                    return res.json( { msgCode: 500,message: '錯誤的 Email 或 Password。'})
                    // req.flash('errorMessage', '錯誤的 Email 或 Password。')
                    // res.redirect('/login');
                })
                .catch((err) => {
                    // return res.redirect('/login');
                })
        })
        .catch((err) => {
            console.log('login error:', err);
        });
};

const postSignup = (req, res) => {
    const { displayName, email, password } = req.body;
    User.findOne({ where: { email } })
        .then((user) => {
            if (user) {
                // req.flash('errorMessage', '此帳號已存在！請使用其他 Email。')
                // return res.redirect('/signup');
                return res.json({message: '此帳號已存在！請使用其他 Email。'})
                
            } else {
                return bcryptjs.hash(password, 12)
                    .then((hashedPassword) => { 
                        return User.create({ displayName, email, password: hashedPassword })
                        .then((newUser) => {
                            return newUser.createCart();
                        })
                    }).then(()=> {
                        return res.json({message: '新增成功'})
                    })
                    .catch((err) => {
                        return res.json({message: '新增失敗'})
                        // console.log('create new user error: ', err);
                    })
            }
        })
        .then((result) => {
            // res.redirect('/login');
        })
        .catch((err) => {
            // console.log('signup_error', err);
        });
}

const postLogout = (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/login')
    });
}

const getUser = (req,res) =>{
    User.findOne({
        where:{
            id:req.session.user.id
        }
    }
    )
    .then((User) => {
        res.status(200)
        return res.json({message: '連接成功',data: User})
        //用json是因為json檔案小，又有key and value，方便
    })
    .catch((err) => {
        console.log('User.findAll() error: ', err);
    })
}

const loginStatus = (req,res) =>{
    if(res.locals.isLogin){
        return res.send({loginStatus:1})
    }else{
        return res.send({loginStatus:0})
    }
}


module.exports = {
    getLogin,
    getSignup,
    postLogin,
    postLogout,
    postSignup,
    getUser,
    loginStatus
};