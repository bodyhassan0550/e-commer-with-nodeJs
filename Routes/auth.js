const express = require("express");

const authController = require("../controllers/auth");
const router = express.Router();
const { check } = require("express-validator");
const User = require("../models/user");
const { ReturnDocument } = require("mongodb");
router.get("/login", authController.getlogin);
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Please Enter a valid E-mail"),
    check("password", "Password has to be valid.")
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postlogin
);
router.get("/signup", authController.getsignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter a valid E-mail")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userdoc) => {
          if (userdoc) {
            return Promise.reject("This E-mail is already Exist");
          }
        });
      }),
    check(
      "password",
      "please Enter password more than 5 and witout special character"
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    check("confirmpassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("PASSWORDS DO NOT MATCH!");
      }
      return true;
    }),
  ],
  authController.postsignup
);
router.post("/logout", authController.postlogout);
router.get("/reset-password", authController.getresetPassword);
router.post("/reset-password", authController.postresetPassword);
router.get("/reset-password/:token", authController.getnewPassword);
router.post("/new-password/", authController.postnewPassword);

module.exports = router;
