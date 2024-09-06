const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userShcema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  Token : String,
  TokenDate :Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userShcema.methods.addToCart= function(product){
  const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId:product._id,
        quantity: newQuantity
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };
    this.cart = updatedCart;
    return this.save();
}
userShcema.methods.deleteFromCart = function (prodId) {
   const updatedCart = this.cart.items.filter((item) => {
     return item.productId.toString() !== prodId.toString();
   });
  this.cart = updatedCart;
  return this.save();
};
userShcema.methods.clearCart = function (prodId) {
   
  this.cart = {items: [] };
  return this.save();
};

module.exports=mongoose.model("users",userShcema)
// const mongodb = require("mongodb");
// const getDb = require("../util/database").getDb;

// const ObjectId = mongodb.ObjectId;

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection("users").insertOne(this);
//   }

//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() === product._id.toString();
//     });
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }
//     const updatedCart = {
//       items: updatedCartItems,
//     };
//     const db = getDb();
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   getCart() {
//     const db = getDb();
//     if (this.cart) {
//       const productIds = this.cart.items.map((i) => {
//         return i.productId;
//       });
//       return db
//         .collection("products")
//         .find({ _id: { $in: productIds } })
//         .toArray()
//         .then((products) => {
//           return products.map((p) => {
//             return {
//               ...p,
//               quantity: this.cart.items.find((i) => {
//                 return i.productId.toString() === p._id.toString();
//               }).quantity,
//             };
//           });
//         });
//     } else {
//       this.cart = {
//         items: [],
//       };
//     }
//   }
//   deleteFromCart(prodId) {
//     const updateCart = this.cart.items.filter((item) => {
//       return item.productId.toString() !== prodId.toString();
//     });
//     const db = getDb();
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: { items: updateCart } } }
//       );
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection("users")
//       .findOne({ _id: new ObjectId(userId) })
//       .then((user) => {
//         console.log(user);
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
//   getOrders() {
//     const db = getDb();
//     return db
//       .collection("orders")
//       .find({ "user.userId": new ObjectId(this._id) })
//       .toArray();
//     // console.log
//   }
//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then((product) => {
//         const order = {
//           item: product,
//           user: {
//             userId: new ObjectId(this._id),
//             username: this.name,
//           },
//         };
//         return db.collection("orders").insertOne(order);
//       })
//       .then((res) => {
//         return db
//           .collection("users")
//           .updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       });
//   }
// }

// module.exports = User;
