const express = require("express");
const productControl = require("../controllers/shop");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/", productControl.gethome);
router.get("/products", productControl.getprouducts);
router.get("/cart", isAuth, productControl.getcart);
router.post("/cart", isAuth, productControl.postcart);
router.get("/products/:productId", productControl.getproductdet);
router.get("/order", isAuth, productControl.getorder);
router.post("/remove-cart", isAuth, productControl.postremovecard);
router.post("/creat-order",isAuth, productControl.postcreatorder);
router.get("/orders/:orderid", isAuth, productControl.getinvoice);
// router.get("/checkout", isAuth, productControl.getCheckout);
// router.post("/checkout/success", isAuth, productControl.getCheckoutSuccess);
// router.get("/checkout/cancel", isAuth, productControl.getCheckout);

// router.get("/sample", (req, res) => {
//   res.send("This route is properly set up.");
// });
module.exports = router;
