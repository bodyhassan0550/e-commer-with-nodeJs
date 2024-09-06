const express = require("express");
const path = require("path");
const fs = require('fs')
const adminroute = require("./Routes/admin");
const Shoproute = require("./Routes/shop");
const authroute = require("./Routes/auth");
const Notfound = require("./Routes/pagenotfound");
const bodyparser = require("body-parser");
const User = require("./models/user");
const multer = require("multer")


const session = require("express-session");
const csrf = require("csurf")
const flash = require("connect-flash")
// const mongoConnect = require("./util/database").mongoConnect
const Mohgodbstore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const app = express();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join("images");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const mongoUrl =
  "mongodb+srv://bodyhassan0550:body312002%40@cluster0.i6vca26.mongodb.net/shop";

const store = new Mohgodbstore({
  uri: mongoUrl,
  collection: "session",
});
app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
const csrfProtect=csrf();
app.use((req, res, next) => {
  if (!req.session.user) {
    return next(); // Add return to prevent further execution
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next(); // User not found, move to the next middleware
      }
      req.user = user; // Attach user object to the request
      next();
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});
app.use(csrfProtect)
app.use(flash())
app.use((req,res,next)=>{
  res.locals.isloggedin = req.session.isloggedin;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use(authroute);
app.use("/admin", adminroute);
app.use(Shoproute);

app.use(Notfound);

mongoose
  .connect(mongoUrl)
  .then(() => {
      app.listen(3000);
      console.log("connect");
    }
  )
  .catch((err) => {
    console.log(err);
  });
