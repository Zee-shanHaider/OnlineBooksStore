const express= require('express');

const router= express.Router();

const {check}= require('express-validator/check');

const User= require('../model/user');

const authController= require('../controller/auth');

const bcrypt= require('bcryptjs');

router.get('/login', authController.getLogin);

router.post('/login', check('email')
                     .isEmail()
                     .withMessage('Please Enter the Valid Email')
                     .trim()
                     .custom((value, req)=>{
                        return User.findOne({email: value})
                        .then(user=>{
                            if(!user){
                                return Promise.reject('Account with Provided E-Mail does not Exist!')
                            }
                        })
                    }),
                     check('password', 'Password has to be valid!')
                     .isLength({min: 4})
                     .isAlphanumeric()
                     .trim()
                     .custom((value, request)=>{
                         return User.findOne({email: req.body.email})
                         .then(userdoc=>{
                              bcrypt.compare(value, userdoc.password )
                             .then(doMatch=>{
                                 if(!doMatch){
                                     return Promise.reject('Password Incorrect!')
                                 }
                             })
                             .catch(err=>{
                                 console.log(err);
                             })
                             
                         })
                     })
                     
,authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup',
            check('email')
            .isEmail()
            .withMessage('Please Enter the Valid Email')
            .normalizeEmail()
            .trim()
            .custom((value, {req})=>{
               return User.findOne({email: value})
                .then(userDoc=>{
                if(userDoc){
                    return Promise.reject('E-Mail Address is already been taken. Try Another One!')
                   
                } 
            })
        }),
            check('password', 'Please enter a valid Password with only numbers, text and at least 4 characters')
            .isLength({min: 4})
            .trim()
            .isAlphanumeric(),
            check('confirmPassword' , 'Passwords must be matched!')
            .trim()
            .custom((value, {req})=>{
                if(value !== req.body.password){
                    return;
                }
                return true;
            }),
 authController.postSignup);

router.get('/reset', authController.getReset); 

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword); 

router.post('/reset/:token', authController.postNewPassword); 






module.exports= router;