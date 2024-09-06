const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const transport = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "api",
    pass: "6778ded7d3371569d4350afdc52bb762",
  },
});

exports.getlogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    title: "Login",
    path: "/login",
    errorMassage: message,
    oldemail: '',
    validError: '',
  });
};
exports.postlogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     console.log(errors);
     console.log(errors.array()[0].path);

     return res.status(422).render("auth/login", {
       title: "login",
       path: "/login",
       errorMassage: errors.array()[0].msg,
       oldemail: email,
       validError: errors.array()[0].path,
     });
   }

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.status(422).render("auth/login", {
       title: "login",
       path: "/login",
       errorMassage: "This E-mail is not exist",
       oldemail: email,
       validError: 'email',
    })
}
    bcrypt
      .compare(password, user.password)
      .then((match) => {
        if (!match) {
              return res.status(422).render("auth/login", {
                title: "login",
                path: "/login",
                errorMassage: "worng password",
                oldemail: email,
                validError: "password",
              });
        }
        req.session.Isloggedin = true;
        req.session.user = user;
        return req.session.save((err) => {
          console.log(err);
          res.redirect("/");
        });
      })
      .catch((err) => {
        return res.redirect("/login");
      });
  });
};
exports.getsignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    title: "signup",
    path: "/signup",
    errorMassage: message,
    oldemail: "",
    validError: [],
  });
};
exports.postsignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmpassword = req.body.confirmpassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    console.log(errors.array()[0].path);

    return res.status(422).render("auth/signup", {
      title: "signup",
      path: "/signup",
      errorMassage: errors.array()[0].msg,
      oldemail: email,
      validError: errors.array()[0].path
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      user = new User({
        email: email,
        password: hashPassword,
        cart: { item: [] },
      });
      user.save();
    })
    .then(() => {
      res.redirect("/login");
      return transport.sendMail({
        from: "body@demomailtrap.com", // sender address
        to: email, // list of receivers
        subject: "Signup succeeded!", // Subject line
        html: "<h1>You successfully signed up!</h1>",
      });
    })
    .catch((err) => {
      console.log(err);
      console.log("error");
    });
};
exports.postlogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getresetPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/resetPassword", {
    title: "reset Password",
    path: "/reset-password",
    errorMassage: message,
  });
};
exports.postresetPassword = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log("here");
      return res.redirect("/login");
    }
    const Token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No acount with that email");
          console.log("worng usser");
          return res.redirect("/reset-password");
        }
        user.Token = Token;
        user.TokenDate = Date.now() + 3600000;
        user.save();
      })
      .then((result) => {
        res.redirect("/");
        transport.sendMail({
          from: "body@demomailtrap.com", // sender address
          to: email, // list of receivers
          subject: "Reset Password", // Subject line
          html: `<p>to Reset you Password click 
          <a href= "http://localhost:3000/reset-password/${Token}" > Here </a> </p>`,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
exports.getnewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ Token: token, TokenDate: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        console.log("heree");
      }
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/newpassword", {
        title: "update Password",
        path: "/new-password",
        errorMassage: message,
        userId: user._id.toString(),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postnewPassword = (req, res, next) => {
  const userId = req.body.id;
  const password = req.body.password;
  let newuser;
  User.findOne({ _id: userId })

    .then((user) => {
      newuser = user;
      return bcrypt.hash(password, 12);
    })
    .then((passhash) => {
      newuser.password = passhash;
      newuser.Token = undefined;
      newuser.TokenDate = undefined;
      return newuser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
