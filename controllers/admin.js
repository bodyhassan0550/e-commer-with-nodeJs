const Product = require("../models/product");
const path = require("path");
const fs = require("fs");
exports.Getaddproduct = (req, res, next) => {
  res.render("admin/add-product", {
    title: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isloggedin: req.session.Isloggedin,
  });
};

exports.Postaddproduct = (req, res, next) => {
  const image = req.file;
  const title = req.body.title;
  const imgurl = image.path;
  const price = req.body.price;
  const description = req.body.desc;
  console.log(imgurl);
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imgurl: imgurl,
    userId: req.user._id,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.Geteditproduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    // Product.findById(prodId)

    .then((product) => {
      if (!product) {
        console.log(prodId);

        return res.redirect("/");
      }
      res.render("admin/add-product", {
        title: "Edit Product",
        path: "/admin/add-product",
        editing: editMode,
        prod: product,
        isloggedin: req.session.Isloggedin,
      });
    })
    .catch((err) => console.log(err));
};

exports.Posteditproduct = (req, res, next) => {
  const image = req.file;
  const prodId = req.body.id;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.desc;

  Product.findById(prodId)
    .then((product) => {
      console.log(prodId);
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (image) {
        fs.unlink(product.imgurl, (err) => {
          if (err) {
            throw err;
          }
        });
        product.imgurl = image.path;
      }
      return product.save();
    })
    .then((result) => {
      console.log("UPDATED PRODUCT!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getproduct = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("admin/products", {
        prod: products,
        title: "Admin Products",
        path: "/admin/products",
        isloggedin: req.session.Isloggedin,
      });
    })
    .catch((err) => console.log(err));
};

exports.DeleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  console.log("Product ID to delete:", prodId); // Debugging: log the product ID
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found."));
      }
      const path = product.imgurl;
      fs.unlink(path, (err) => {
        if (err) {
          throw err;
        }
      });

      return Product.findByIdAndDelete(prodId);
    })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.status(200).json({massage : "success Deleting"});
    })
    .catch((err) => console.log(err));
};
