
const path = require('path');

const mongoose = require('mongoose');


// const nodemailer= require('nodemailer');


// const sendgrid= require('nodemailer-sendgrid-transport');

// const transport= nodemailer.createTransport(sendgrid({
//         auth: {
//                 api_key: '',
//         }
// }))


const express = require('express');

const bodyParser = require('body-parser');

const multer = require('multer');

const session = require('express-session');

const csrf = require('csurf');

const csrfProtection = csrf();

const flash = require('connect-flash');

const app = express();

const MongoDBStore = require('connect-mongodb-session')(session);

const MongoDBURI = '';

const store = new MongoDBStore({
        uri: MongoDBURI,
        collection: 'session',
})



// const mongoConnect = require('./util/database').mongoConnect;

const errorController = require('./controller/error');

const User = require('./model/user');


//Database Running Queries

// db.execute('SELECT * FROM products')
// .then(result=>{
//     console.log(result);
// })
// .catch(err=>{
//     console.log(err);
// });

//Pug specific Code
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const res = require('express/lib/response');

// const fileStorage= multer.diskStorage({
//         destination: (req, file, cb)=>{
//                 cb(null, 'images');
//         },
//         filename:(req, file, cb)=>{
//                 cb(null, new Date().toISOString() + '-' + file.originalname);
//         }
// });
const fileStorage = multer.diskStorage({

        destination: (req, file, cb) => {
                cb(null, 'images');
        },
        filename: (req, file, cb) => {

                cb(null, file.originalname);
        }
});

const fileFilter = (req, file, cb) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
                cb(null, true);
        }
        else {
                cb(null, false);
        }
}


app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({ secret: 'my_secret', resave: false, saveUninitialized: false, store: store }))

app.use(flash());
app.use(csrfProtection);

app.use((req, res, next) => {
        if (!req.session.user) {
                next();
        }
        else {
                User.findById(req.session.user._id)
                        .then(user => {
                                if (!user) {
                                        return next();
                                }
                                req.user = user;
                                next();
                        })
                        .catch(err => {
                                console.log(err);
                        })
        }

})

app.use((req, res, next) => {
        res.locals.isAuthenticated = req.session.isLoggedIn;
        res.locals.csrfToken = req.csrfToken();
        next();
})

// app.use((req,res, next)=>{
//         transporter.sendMail({
//                 to: 'zeeshan1610018@gamil.com',
//                 from: 'zeeshan9402529@gmail.com',
//                 subject: 'Creation of email',
//                 html: '<h1> Successfully Created! </h1>'
//         })
//         .then(()=>{
//                 console.log('Successfully sent email');
//                 next();
//         })
//         .catch(err=>{
//                 console.log(err);
//         })
// })

app.use('/admin', adminData.routes);

// app.get('/cart',(req,res,next)=>{
//         req.user
//         .populate('cart.items.productId')
//         .execPopulate()
//         .then(user => {
//           const products = user.cart.items;
//           res.render('shop/cart', {
//             path: '/cart',
//             pageTitle: 'Your Cart',
//             products: products
//           });
//         })
//         .catch(err => {
//           console.log(err)
//         });
    
// })
app.use(shopRoutes);


app.use(authRoutes);

app.get('/500', errorController.get500);

app.use((error, req, res, next) => {
        res.status(error.httpStatusCode).redirect('/500');
})

app.use(errorController.get404);




mongoose.connect(
        MongoDBURI
)
        .then(result => {
                app.listen(3000);
                console.log('Connected To Database!')
        })
        .catch(err => {
                console.log(err);
        })



