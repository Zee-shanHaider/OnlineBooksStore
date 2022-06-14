const User = require("../model/user");

const bcrypt= require('bcryptjs');

const crypto= require('crypto');

const nodemailer= require('nodemailer');

const sendGridTransport= require('nodemailer-sendgrid-transport');

const { validationResult }= require('express-validator/check')

const transporter= nodemailer.createTransport(sendGridTransport({
 
  auth: {
    api_key:
    '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',
  }

  
}));

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req
    //   .get('Cookie')
    //   .split('=')[1];
    let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      message: message,
      oldInput: {email: '', password: ''},
      validationErrors: [],
    });
  };
  
  exports.postLogin = (req, res, next) => {
    const email= req.body.email;
    const password= req.body.password;
    const errors= validationResult(req);

    User.findOne({email: email})
    .then(user=>{
      if(!user){
        
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          message: errors.array()[0].msg,
          oldInput:  {email: email, password: password},
          validationErrors: errors.array(), 
          
        });

      }
      bcrypt.compare(password, user.password)
      .then(doMatch=>{
        if(doMatch){
          req.session.isLoggedIn=true;
          req.session.user= user;
          return req.session.save(err=>{
            res.redirect('/');
          })

          
        }
        else{
          req.flash('error', 'Invalid email or password!');
        }        

        res.redirect('/login');
      })
      .catch(err=>{
        res.redirect('/login');
      })
      
    })
   
  };
  
  exports.postLogout= (req,res,next)=>{
    res.redirect('/');
    req.session.destroy(err=>{
      console.log("Sesssion logout");
    })
  };

  exports.getSignup= (req,res,next)=>{
    let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    message: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  });

  }
  exports.postSignup= (req,res,next)=>{
    const email= req.body.email;
    const password= req.body.password;
    const confirmPassword= req.body.confirmPassword;
    const errors= validationResult(req);
    // console.log(errors);
    if(!errors.isEmpty()){
    //  console.log(errors.array());
      return res.status(422).render('auth/signup.ejs', {
        path: '/signup',
        pageTitle: 'Signup',
        // isAuthenticated: false,
        message: errors.array()[0].msg,
        oldInput: {email: email, password: password, consfirmPassword: confirmPassword},
        validationErrors: errors.array(),
      })
    }
    
      return bcrypt
      .hash(password, 12) 
      .then(hashedPassword=>{
        const user= new User({
          email: email,
          password: hashedPassword,
          cart: {items: []},
        });
        return user.save();
      })
      .then(result => {
        res.redirect('/login');
        return transporter.sendMail({
          to: email,
          from: 'zeeshan9402529@hotmail.com',
          subject: 'Signup succeeded!',
          html: '<h1>You successfully signed up!</h1>'
        });
      })
      .catch(err => {
        const error= new Error(err);
        error.httpStatusCode= 500;
        return next(error);
      });


   
  }

  exports.getReset= (req, res, next)=>{
    let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
    
    res.render('auth/reset.ejs', {
      path: '/reset',
      pageTitle: 'Reset Password',
      // isAuthenticated: false,
      message: message,
    })
  }

  exports.postReset= (req, res, next)=>{
    const email= req.body.email;
    crypto.randomBytes(32, (err, buffer)=>{
      if(err){
        const error= new Error(err);
        error.httpStatusCode= 500;
        return next(error);
        
      }
      const token= buffer.toString('hex');
      User.findOne({email: email})
      .then(user=>{
        if(!user){
          req.flash('error' , 'User with Provided E-Mail does not Exist!');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 360000;
        return user.save()
      })
      .then(result=>{ 
        res.redirect('/login');
          transporter.sendMail({
          to: email,
          from: 'zeeshan9402529@hotmail.com',
          subject: 'Reset password',
          html: `
                <p> You requested for <b>password reset</b>. </p>
                <p> Click this <a href="http://localhost:3000/reset/${token}"> link </a> to set a new password. </p>
          `
        })

      })
      .catch(err=>{
        const error= new Error(err);
        error.httpStatusCode= 500;
        return next(error);
      })
      

    })
  }

  exports.getNewPassword= (req, res, next)=>{
    const token= req.params.token
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now() } })
    .then(user=>{
      // console.log(user);
      const userId= user._id.toString();
      res.render('auth/new-password',{
        path: '/new-password',
        pageTitle: 'New Password',
        userId: userId,
        resetToken: token,
      })
    })
    
  }

  exports.postNewPassword= (req, res, next)=>{
    
    const password= req.body.password;
    const userId = req.body.userId;
    const resetToken = req.body.token;
    User.findOne({resetToken: resetToken, _id: userId, resetTokenExpiration: {$gt: Date.now()}})
    .then(user=>{
      bcrypt.hash(password, 12)
      .then(hashedPassword=>{
        user.password= hashedPassword;
        user.resetToken= undefined;
        user.resetTokenExpiration= undefined;
        return user.save()
      })
    })
    .then(()=>{
      res.redirect('/login');
      console.log('Successfully Password Changed!');
    })
    .catch(err=>{
      const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    })

    // console.log("Password Successfully Changed!")
  }