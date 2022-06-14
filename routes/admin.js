const path = require('path');

const express = require('express');

const isAuth= require('../middleWare/is-auth')

const rootDir = require('../util/path');

const router = express.Router();

const {check} = require('express-validator/check')

const controller= require('../controller/admin.js')

// /admin/add-product => GET
router.get('/add-product', isAuth,  controller.AddProduct );

// /admin/add-product => POST
router.post('/add-product', 
                            [
                                check('title').trim().isString().isLength({min : 4}),
                                // check('imageURL').isURL().trim(),
                                check('Price').isFloat(),
                                check('description').isLength({min: 4, max: 400}).trim(),
                                
                            ]

,isAuth, controller.postProducts);

router.get('/products', isAuth, controller.getProducts);

router.post('/adminSearch', check('book').trim() , isAuth, controller.postFindBook);

// //edit with query params
router.get('/edit-product/:productId', isAuth, controller.getEditProduct);

router.post('/edit-product', 
[
    check('title').isAlphanumeric().isLength({min : 4}).trim(),
    check('imageURL').isURL(),
    check('Price').isFloat(),
    check('description').isLength({min: 4, max: 400}).trim(),
    
]
, isAuth, controller.postEditProduct );

router.delete('/product/:productId',isAuth,  controller.deleteProduct);

exports.routes = router;



