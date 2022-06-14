const mongoose= require('mongoose');

const Schema =  mongoose.Schema;

const productSchema = new Schema({

  title : {
    type: String,
    required: true,
  },
  author : {
    type: String,
    required: true,
  },

  imageURL: {
    type: String,
    required: true,
  },

  Price: {
    type: Number,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
})

module.exports= mongoose.model('Product', productSchema );

// const req = require('express/lib/request');

// const Cart= require('./Cart');

// // const getDB= require('../util/database').getDB;

// const mongodb= require('mongodb');

// const ObjectId= mongodb.ObjectId;


// module.exports = class Product {
//   constructor(title, imageURL,Price, description, id, userId ) {
//     this.title = title;
//     this.imageURL = imageURL;
//     this.Price = Price;
//     this.description = description;
//     this._id =id ? new ObjectId(id) : null;
//     this.userId =userId;
//   }

  
//   save() {
//     const db = getDB();
//     let dbOp;
//     if (this._id) {
//       // Update the product
//       dbOp = db
//         .collection('products')
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }
//     return dbOp
//       .then(result => {
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }


//   static deleteById(id) {
//     const db= getDB();
//     return db.collection('products')
//     .deleteOne({_id: new mongodb.ObjectId(id)})
//     .then((product)=>{
//       console.log('DELETED Successfully!');
//       return product;
//     })
//     .catch(err=>{
//       console.log(err);
//     })
//   }


//   static fetchAll() {
//     const db = getDB();
//     return db.collection('products').find()
//     .toArray()
//     .then(products=>{
//       return products;
//     })
//     .catch(err=>{
//       console.log(err);
//     })
//   }

//   static findById(id) {
//     const db= getDB();
//    return db.collection('products')
//    .find({_id: mongodb.ObjectId(id)})
//    .next()
//    .then(product=>{
//      return product;
//    })
  
//    .catch(err=>{
//      console.log(err);
//    })
//   }
// };
