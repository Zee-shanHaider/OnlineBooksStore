const adminData=require('./admin.js')
const Product=require('../model/product')
const Cart= require('../model/Cart');
const fs= require('fs');
const User = require('../model/user.js');
const product = require('../model/product');
const path= require('path');
const stripe= require('stripe')('sk_test_51L4pW8K467PvuolLqsfC2GkveyHegPkZg4UVINMKETJWlnfwNFHSx5X3G6aQ7Y1bmwaYYXyATGCG0akDNGzjjEGr00BeGAeZ7U')
const pdfDocument= require('pdfkit')
const { validationResult }= require('express-validator/check'); 
const items_per_page= 3;

const Order= require('../model/order'); 


exports.getProducts = (req, res, next) => {
  const page= +req.query.page || 1;
  let totalItems= 0;
  Product.find().countDocuments()
  .then(numProducts=>{
    totalItems= numProducts;
    return  Product.find()
    .skip((page-1) * items_per_page )
    .limit(items_per_page)
  })
   .then((products) => {
    res.render('shop/product-list', {
      'pageTitle': "Shop here",
      prods: products,
        path :'/products',
        totalProducts: totalItems,
        hasNextPage: items_per_page* page < totalItems,
        nextPage: page+1,
        previousPage: page-1,
        hasPreviousPage: page>1,
        currentPage: page,
        lastPage: Math.ceil(totalItems/items_per_page),
        isAuthenticated: req.session.isLoggedIn,
    });
  })
.catch(err=>{
  const error= new Error(err);
  error.httpStatusCode= 500;
  return next(error);
})
 
}


exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then((product)=> {
    res.render('shop/product-detail' ,{product: product, 'pageTitle': product.title, path: '/products' , isAuthenticated: req.session.isLoggedIn});
  })
  .catch(err=>{
    const error= new Error(err);
    error.httpStatusCode= 500;
    return next(error);
  })  
  
};



exports.getIndex =  (req, res, next) => {
  const page= +req.query.page || 1;
  let totalItems= 0;
  Product.find().countDocuments()
  .then(numProducts=>{
    totalItems= numProducts;
    return  Product.find()
    .skip((page-1) * items_per_page )
    .limit(items_per_page)
  })
   .then((products) => {
    res.render('shop/index', {
      'pageTitle': "Shop here",
      prods: products,
        path :'/',
        totalProducts: totalItems,
        hasNextPage: items_per_page* page < totalItems,
        nextPage: page+1,
        previousPage: page-1,
        hasPreviousPage: page>1,
        currentPage: page,
        lastPage: Math.ceil(totalItems/items_per_page),
    });
  })
.catch(err=>{
  const error= new Error(err);
  error.httpStatusCode= 500;
  return next(error);
  console.log(err);
})
}


exports.getFindBook = (req, res, next)=>{
  console.log("this is getFindBook")
  res.render('shop/book',{
    path:'/search',

  }
  )
}


exports.postFindBook = (req, res, next)=>{
  console.log('called!');
  const title= req.body.book;
  Product.find({title: title})
  .then(books=>{
    res.render('shop/book',{
      'pageTitle': "Searched Book",
        prods: books,
        path :'/search',
    })
    
  })
  .catch(err=>{
    console.log(err);
  })
}


exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
   .then(user => {
    //  console.log(user)
    //  console.log(user.cart.items);
     const products= user.cart.items;
    //  console.log(products);
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
      });


  })
  .catch(err=>{
    // const error= new Error(err);
    // error.httpStatusCode= 500;
    // return next(error);
    console.log(err);
  })
};

  
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product=>{
     return req.user.addToCart(product)
    })
    .then(result=>{
      res.redirect('/cart');
    })
    .catch(err=>{
      const error= new Error(err);
      error.httpStatusCode= 500;
      return next(error);
    })

 
};


// exports.getCheckout= (req, res, next) => {
//   let products;
//   let total = 0;
//   req.user
//   .populate('cart.items.productId')
//  .then(user => {
//   // console.log(user)
//    console.log(user.cart.items);
//    products= user.cart.items;
//    products.forEach(p => {
//      total += p.quantity * p.productId.Price;
//    });

//   //  console.log(products);
//    return stripe.checkout.sessions.create({
//      payment_method_types: ['card'],
//      line_items: products.map(p=>{
//        return {
//         title: p.productId.title,
//         description: p.productId.description,
//         Price: p.productId.Price * 100,
//         currency: 'usd',
//         quantity: p.quantity,

//        }
       
//      }),
//      success_url: req.protocol + '://'+ req.get('host') +'/checkout/success', // => http:;//localhost:3000/checkout/success
//      cancel_url: req.protocol + '://'+ req.get('host') + '/checkout/cancel',
//    })
// })
// .then(session=>{
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Your Cart',
//     products: products,
//     totalPrice: total,
//     sessionId: session.id,
//   });
// })
// .catch(err=>{
//   const error= new Error(err);
//   error.httpStatusCode= 500;
//   return next(error);
// })
// }
exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      products = user.cart.items;
      total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.Price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(p => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.Price * 100,
            currency: 'usd',
            quantity: p.quantity
          };
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      });
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalPrice: total,
        sessionId: session.id
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



exports.postDeleteCartProd= (req,res,next)=>{
   const prodId= req.body.productId;
  
   req.user
   .deleteCartItem(prodId)
   .then(result=>{
     res.redirect('/cart');
   })
   .catch(err=>{
    const error= new Error(err);
    error.httpStatusCode= 500;
    return next(error);
   })
}


exports.getCheckoutSuccess=(req,res,next)=>{
  req.user.populate('cart.items.productId')
  .then(user=>{
    const products= user.cart.items.map(i=>{
      return {product: {...i.productId._doc} ,quantity: i.quantity  }
    })
    
    const order= new Order(
      {
        user: {
          email: req.user.email,
          userId: req.user,

        },
        products: products,

      }
    )
    return order.save()
    
  })

  .then(result=>{
   return  req.user
    .freeCart();
    
  })
  .then(result=>{
    console.log('Succssfully Order Created');
    res.redirect('/orders')
  })
  .catch(err=>{
    const error= new Error(err);
    error.httpStatusCode= 500;
    return next(error);
  })
}



exports.getOrders= (req,res, next)=>{

  Order.find({'user.userId': req.user._id})
  .then(orders=>{
    res.render('shop/order', {
      pageTitle: 'YourOrders',
      path: '/orders',
      orders: orders,
     
    })
    })
  
  .catch(err=>{
    const error= new Error(err);
    error.httpStatusCode= 500;
    return next(error);
  })
  
}
// exports.getOrders = (req, res, next) => {
//   Order.find({ 'user.userId': req.user._id })
//     .then(orders => {
//       res.render('shop/orders', {
//         path: '/orders',
//         pageTitle: 'Your Orders',
//         orders: orders
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.getInvoice= (req,res, next)=>{
  const orderId= req.params.orderId;
 
  Order.findById(orderId)
  .then(order=>{
    if(!order){
      return res.send('No order Found!');
      // return next(new Error('No order Found!'));
    }
    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error('Unauthorized!'))
    }
    const invoiceName= 'Invoice-'+ orderId +'.pdf';
    const invoicePath= path.join('data', 'invoices', invoiceName);
    res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename= "'+ invoiceName+ '"' );
      const pdfDoc= new pdfDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text('Invoice',{
        underline: true,
        
      });
      pdfDoc.text('--------------------------------------------');
      pdfDoc.text('                                              ');
      let totalPrice = 0.0;
      pdfDoc.fontSize(20).text('Book Title' +'                                         '+ 'Quantity' + '*' + 'Price');
      order.products.forEach(prod => {
        pdfDoc.text('                                              ');
        pdfDoc.fontSize(12).text(prod.product.title +'                                                                                                         '+ prod.quantity + '*' + prod.product.Price);
       
        totalPrice += prod.quantity* prod.product.Price;
       

      });
      pdfDoc.text('                         ');
      pdfDoc.text('--------------------------------------------------------------------------------------------------------');
      pdfDoc.text('Total Price' + '                                                                                                 $'+ totalPrice);

      pdfDoc.end();

    // fs.readFile(invoicePath, (err, data)=>{
    //   if(err){
    //     return next(err);
    //   }
    
    //   res.setHeader('Content-Type', 'application/pdf');
    //   res.setHeader('Content-Disposition', 'inline; filename= "'+ invoiceName+ '"' );
    //   res.send(data);
    // })
   
     
  })
  .catch(err=>{
    const error= new Error(err);
    error.httpStatusCode= 500;
    return next(error);
  })
}