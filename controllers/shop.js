const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFdoc = require("pdfkit");
const stripe = require("stripe")(
  "sk_test_51PojA9KbccDyqiztJwdKiEpMre9FTJTdqmQ4JouPaWj8pkXLvffkVZGzki53wmrXQLaXj1TP5McrUBa1Bxl0hpup009Hf0rNZR"
);
const PROD_PER_PAGE = 1;

exports.getprouducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prod: products,
        title: "All Products",
        path: "/products",
        isloggedin: req.session.Isloggedin,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getproductdet = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findAll({ where: { id: prodId } })
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       title: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detils", {
        prod: product,
        title: product.title,
        path: "/products",
        isloggedin: req.session.Isloggedin,
      });
    })
    .catch((err) => console.log(err));
};

exports.gethome = (req, res, next) => {
  const page = +req.query.page || 1;
  let totleItems;
  Product.find()
    .countDocuments()
    .then((numproduct) => {
      totleItems = numproduct;

      return Product.find()
        .skip((page - 1) * PROD_PER_PAGE)
        .limit(PROD_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/home", {
        prod: products,
        title: "Shop",
        path: "/",
        isloggedin: req.session.Isloggedin,
        currentpage: page,
        hasnext: PROD_PER_PAGE * page < totleItems,
        haspravs: page > 1,
        nextpage: page + 1,
        pravpage: page - 1,
        lastpage: Math.ceil(totleItems / PROD_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getcart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user);
      const products = user.cart.items;
      console.log(products);

      res.render("shop/cart", {
        path: "/cart",
        title: "Your Cart",
        prod: products,
        isloggedin: req.session.Isloggedin,
      });
    })
    .catch((err) => console.log(err));
};

exports.postcart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
  // let fetchedCart;
  // let newQuantity = 1;
  // req.user
  //   .getCart()
  //   .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then(products => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }

  //     if (product) {
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }
  //     return Product.findById(prodId);
  //   })
  //   .then(product => {
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity }
  //     });
  //   })
  //   .then(() => {
  //     res.redirect('/cart');
  //   })
  //   .catch(err => console.log(err));
};
exports.getcheckout = (req, res, next) => {
  let products;
  let totalprice = 0;

  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      totalprice = 0;

      products.forEach((p) => {
        totalprice += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => {
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: p.productId.title,
                description: p.productId.description,
              },
              unit_amount: Math.round(p.productId.price * 100), // Amount in cents
            },
            quantity: p.quantity,
          };
        }),
        mode: "payment",
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        title: "Check out",
        prod: products,
        total: totalprice,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};


exports.postremovecard = (req, res, next) => {
  const prodId = req.body.id;
  req.user
    .deleteFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.getchekoutsuccess = (req, res, next) => {
 req.user
   .populate("cart.items.productId")
   .then((user) => {
     const products = user.cart.items.map((i) => {
       return { quantity: i.quantity, product: { ...i.productId._doc } };
     });
     const order = new Order({
       user: {
         email: req.user.email,
         userId: req.user,
       },
       product: products,
     });
     order.save();
   })
   .then((result) => {
     return req.user.clearCart();
   })
   .then((result) => {
     res.redirect("/order");
   })
   .catch((err) => console.log(err));
};
exports.postcreatorder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        product: products,
      });
      order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect("/order");
    })
    .catch((err) => console.log(err));
};

exports.getorder = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        title: "Your Orders",
        orders: orders,
        isloggedin: req.session.Isloggedin,
      });
    })
    .catch((err) => console.log(err));
};

exports.getinvoice = (req, res, next) => {
  const invoiceid = req.params.orderid;

  Order.findById(invoiceid)
    .then((order) => {
      if (!order) {
        return next(new Error("Order not found"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized access"));
      }

      const invoiceName = "invoice-" + invoiceid + ".pdf";
      const invoicePath = path.join("data", "invoice", invoiceName); // Ensure correct path
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      const pdfdoc = new PDFdoc();
      pdfdoc.pipe(fs.createWriteStream(invoicePath));
      pdfdoc.pipe(res);
      pdfdoc.fontSize(26).text("invoice", {
        underline: true,
      });
      pdfdoc.text("------------------");
      let totelprice = 0;
      order.product.forEach((prod) => {
        totelprice = totelprice + prod.product.price * prod.quantity;
        pdfdoc.text(
          prod.product.title + "-" + prod.product.price + "-" + prod.quantity
        );
      });
      pdfdoc.text("totel =" + totelprice);
      pdfdoc.end();
      // fs.access(invoicePath, fs.constants.F_OK, (err) => {
      //   if (err) {
      //     console.error("File does not exist:", invoicePath);
      //     return next(new Error("Invoice not found"));
      //   }

      //   const file = fs.createReadStream(invoicePath); // Use invoicePath here

      //   file.pipe(res);
      // });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
