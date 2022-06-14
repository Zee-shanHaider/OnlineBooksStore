const mongoose= require('mongoose');
const { update } = require('./product');
const Product = require('./product');

const Schema= mongoose.Schema;

const userSchema= new Schema({
  
  email:{
    type: String,
    required: true,
  },
  password:{
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items:[
            {
              productId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
              },
              quantity: {
                type: Number,
                required: true,
              }
          },
    ]
  }
});

userSchema.methods.addToCart= function(product){
  const cartProductIndex = this.cart.items.findIndex(cp => {
              return cp.productId.toString() ===  product._id.toString();
            });
            let newQuantity = 1;
            const updatedCartItems = [...this.cart.items];
        
            if (cartProductIndex >= 0) {
              newQuantity = this.cart.items[cartProductIndex].quantity + 1;
              updatedCartItems[cartProductIndex].quantity = newQuantity;
            } else {
              updatedCartItems.push({
                productId: product._id,
                quantity: newQuantity
              });
            }
            const updatedCart = {
              items: updatedCartItems
            };
           this.cart= updatedCart;
           return this.save();
              
}

userSchema.methods.deleteCartItem= function(productId){
  const updatedCartItems= this.cart.items.filter(cp=>{
                return cp.productId.toString() !== productId.toString()
            })  
            this.cart.items= updatedCartItems;
            return this.save();
}


userSchema.methods.addOrder=function() {
          
          return this
          .populate('cart.items.productId')
            .then(products => {
              console.log(products);
              const order = {
                items: products,
                user: {
                  _id: this._id,
                  name: this.name
                }
              };
              return this.save();
            })
            .then(result => {
              this.cart = { items: [] };
              return this
                .updateOne(
                  { _id: this._id },
                  { $set: { cart: { items: [] } } }
                );
            });
        }

        userSchema.methods.freeCart=function(){
          this.cart= {items: []};
          return this.save();

        }

module.exports= mongoose.model('User', userSchema);


// // const getDB =require('../util/database').getDB;

// const mongodb= require('mongodb');

// const ObjectId= mongodb.ObjectId;
// module.exports= class User{

//     constructor(username, email , cart, id){
//         this.username= username;
//         this.email= email;
//         this.cart = cart;
//         this._id=id;
//     }


//     save(){
//         const db = getDB();
//         return db.collection('users')
//         .insertOne(this)
        
//     }
   
//     addToCart(product) {
//        
//       }
    

//     // addToCart(product){
//     //     const cartProductIndex= this.cart.items.findIndex(cp=>{
//     //         return cp.productId.toString() === product._id.toString();
//     //     })
//     //    let newQunatity=1;
//     //    const updatedCartItems = [...this.cart.items];
//     //     if(cartProductIndex >= 0 ){
//     //         newQuantity= this.cart.items[cartProductIndex].quantity +1;
//     //         updatedCartItmes[cartProductIndex].quantity= newQunatity;

//     //     }
//     //     else{
//     //         updatedCartItems.push(
//     //             {
//     //                 id: new ObjectId(product._id),
//     //                  quantity: 1,
//     //             }
//     //         )
//     //     }
//     //     const updatedCart = {
//     //         items: updatedCartItems,
//     //       };

//     //       const db = getDB();
//     //       return db
//     //         .collection('users')
//     //         .updateOne(
//     //           { productId: new ObjectId(this._id) },
//     //           { $set: { cart: updatedCart } }
//     //         );
      
//     //     // const updatedCart= {items: [{id: new ObjectId(product._id), quantity: newQuantity}]};
//     //     // return db
//     //     //     .collection('users')
//     //     //     .updateOne(
//     //     //         { _id: new ObjectId(this._id)},
//     //     //         { $set: {cart: updatedCart} }

//     //     //     )
//     // }

//      


//       deleteCartItem(productId){
//         const updatedCartItems= this.cart.items.filter(cp=>{
//             return cp.productId.toString() !== productId.toString()
//         }) 
//         const db=getDB();
//         return db.collection('users')
//         .updateOne(
//                  {  _id: new ObjectId(this._id)},
//                  {$set: {cart: {items: updatedCartItems}}}
            
//         )
        
//       }

//       getOrders(){
//        const db= getDB();
//        return db.collection('orders')
//        .find({'user._id': this._id})
//        .toArray()
//       }

//       addOrder() {
//         const db = getDB();
//         return this.getCart()
//           .then(products => {
//             const order = {
//               items: products,
//               user: {
//                 _id: new ObjectId(this._id),
//                 name: this.name
//               }
//             };
//             return db.collection('orders').insertOne(order);
//           })
//           .then(result => {
//             this.cart = { items: [] };
//             return db
//               .collection('users')
//               .updateOne(
//                 { _id: new ObjectId(this._id) },
//                 { $set: { cart: { items: [] } } }
//               );
//           });
//       }
//       // addOrder(){
//       //   const db= getDB();
//       //   return this.getCart(products=>{
//       //     console.log(products);
//       //     const order= {
//       //       items: products,
//       //       user: {
//       //         _id: new ObjectId(this._id),
//       //         name: this.username,
  
//       //       }
//       //     }
//       //     return db.collection('orders')
//       //   .insertOne(order)
//       //   })
//       //   .then(result=>{
//       //     return db
//       //     .collection('users')
//       //     .updateOne(
//       //       {_id: new ObjectId(this._id) },
//       //       {$set: {cart: {items: [] } } }
//       //     )
//       //   });

//       // }


//     static findById(userId){
//         const db = getDB();
//         return db.collection('users')
//         .findOne({_id: new ObjectId(userId)})
//         .then(user=>{
//             return user;
//         })
//         .catch(err=>{
//             console.log(err);
//         })

//     }
// }


