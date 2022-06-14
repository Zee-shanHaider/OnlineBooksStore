const Product=require('../model/product');

const mongoose = require('mongoose');

const fileHelper= require('../util/file');

const { validationResult }= require('express-validator/check'); 
// const getDB= require('../util/database').getDB;


exports.AddProduct=(req, res, next) => {
  // if(!req.session.isLoggedIn){
  //   return res.redirect('/login');
  // }
    res.status(200).render('admin/edit-products', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        message: null,
        validationErrors: []
    
      });

  }

  exports.postProducts = (req, res, next) => {
    const title = req.body.title;
    const author = req.body.author;
    const image = req.file;
    const Price = req.body.Price;
    const description = req.body.description;
    const errors = validationResult(req);
    console.log(image);
    if(!image){
      return res.status(422).render('admin/edit-products', {
        pageTitle: 'Add Product',
        path: '/admin/edit-products',
        editing: false,
        hasError: true,
        product: {
          title: title,
          imageURL: image.path,
          Price: Price,
          description: description
        },
        message: 'Attached file is not an Image!',
        validationErrors: errors.array()
      });
    }
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('admin/edit-products', {
        pageTitle: 'Add Product',
        path: '/admin/edit-products',
        editing: false,
        hasError: true,
        product: {
          title: title,
          imageURL: image.path,
          Price: Price,
          description: description
        },
        message: errors.array()[0].msg,
        validationErrors: errors.array()
      });
    }
  
    const product = new Product({
      title: title,
      author: author,
      imageURL: image.path,
      Price: Price,
      description: description,
      userId: req.user
    });
    product
      .save()
      .then(result => {
        // console.log(result);
        console.log('Created Product');
        res.redirect('/admin/products');
      })
      .catch(err => {
        const error= new Error(err);
        error.httpStatusCode= 500;
        return next(error);
      })
  };









  
  exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-products', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        message: null,
        validationErrors: [],
      });
    })
    .catch(err=>{
      const error= new Error(err);
        error.httpStatusCode= 500;
        return next(error);
    })
  }; 
  


  exports.postEditProduct = (req, res, next) => {
    const updatedTitle = req.body.title;
    const updatedAuthor = req.body.author;
    const updatedImage = req.file;
    const updatedPrice = req.body.Price;
    const updatedDesc = req.body.description;
    const id= req.body.productId;
    Product.findById(id)
   .then(product=>{
     if(product.userId.toString() !== req.user._id.toString()){
       return res.redirect('/');
     }
     if(updatedImage){
       fileHelper.deleteFile(product.imageURL);
     }
     product.updateOne({
       title: updatedTitle,
       author: updatedAuthor,
       imageURL: updatedImage,
       Price: updatedPrice,
       description: updatedDesc,
       userId: req.user._id,
     })
     .then(result=>{
       console.log('Updated Successfully!');
       res.redirect('/products')
     })

   })
    .catch(err=>{
      const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    })
    
  };
 
  exports.getProducts= (req,res)=>{
    Product.find({userId: req.user._id})
    .then((products)=>{
      
      res.render('admin/products', {
        'pageTitle': "Admin Products",
        prods: products,
          path :'/admin/products',
      });
    })
    .catch(err=>{
      const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    })
    
    
  };


  exports.postFindBook= (req, res, next)=>{
    const title= req.body.book;
    console.log(req.body.book);
    Product.find({title: title, userId: req.user._id})
    .then(books=>{
      res.render('admin/products',{
        'pageTitle': "Searched Book",
          prods: books,
          path :'/admin/search',
      })
      
    })
    .catch(err=>{
      console.log(err);
    })
  }
  exports.deleteProduct=(req,res,next)=>{

    const productId=req.params.productId;
    Product.findById(productId)
    .then(product=>{
      fileHelper.deleteFile(product.imageURL);
      return Product.deleteOne({_id: productId, userId: req.user._id})
    })

    // Product.deleteById(productId)
    .then(()=>{
      res.status(200).json({message: "Successfully Deleted!"});
    })
    .catch(err=>{
      res.status(500).json({message: "Deleting Product Failed!"});
    })
  }


