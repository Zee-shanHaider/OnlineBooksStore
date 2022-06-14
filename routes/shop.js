const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const {check}= require('express-validator/check');

const isAuth = require('../middleWare/is-auth');

const router = express.Router();
const shopController = require('../controller/shopController.js');

router.get('/', shopController.getIndex);

// router.get('/search', shopController.getFindBook);

router.post('/search', check('book').trim(), shopController.postFindBook);

router.get('/products', shopController.getProducts);



router.get('/products/:productId', isAuth, shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', shopController.getCheckoutSuccess);

router.get('/checkout/cancel', shopController.getCheckout);

router.post('/cart', isAuth, shopController.postCart);

// router.get('/checkout', shopController.checkout);

router.post('/cart-delete-item', shopController.postDeleteCartProd)

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;