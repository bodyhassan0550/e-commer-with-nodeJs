const express = require("express");
const adminControl = require("../controllers/admin");
const isAuth = require("../middleware/isAuth")

const router = express.Router();


router.get("/add-product",isAuth, adminControl.Getaddproduct);

router.get("/products", isAuth, adminControl.getproduct);
router.post("/product", isAuth, adminControl.Postaddproduct);

router.get("/edit-product/:productId",isAuth, adminControl.Geteditproduct);
router.post("/edit-product",isAuth, adminControl.Posteditproduct);
router.delete("/products/:productId", isAuth, adminControl.DeleteProduct);
module.exports = router;
