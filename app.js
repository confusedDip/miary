const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const e = require("express");
const saltRounds = 10;

// var loginStatus = "";
// var signupStatus = "";

mongoose.connect("mongodb://localhost:27017/miaryDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const postSchema = new mongoose.Schema({
  title: String,
  date: String,
  content: String,
});
const Post = new mongoose.model("Post", postSchema);
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  posts: [postSchema],
});
const User = new mongoose.model("User", userSchema);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("home", {
    loginStatus: ""
  });
});

app.get("/login", function(req, res){
        res.redirect("/");
})

app.get("/signup", function (req, res) {
  res.render("signup", {
    signupStatus: "",
  });
});

app.post("/signup", function (req, res) {
  const name = req.body.name;
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username }, function (err, user) {
    if (err) console.log(err);
    else if (user) {
            var signupStatus ="User Already Exists.<br> <strong>Please Login to your account.</strong>" 
      res.render("signup", {
        signupStatus: signupStatus});
    } else {
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
          console.log(err);
          res.redirect("/signup");
        } else {
          const newUser = new User({
            name: name,
            username: username,
            password: hash,
            posts: [],
          });

          newUser.save();
          var signupStatus ="Successfully Registered New User<br> <strong><a href='/login'>Login to your account</a></strong>"; 
          res.render("signup", {
                  signupStatus: signupStatus
          });
        }
      });
    }
  });
});

app.post("/", function(req, res){
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({username: username}, function(err, user){
                if(user){
                        bcrypt.compare(password, user.password, function (err, result) {
                                if(result == true){
                                        res.send(user);
                                }
                                else{
                                        loginStatus =
                                          "The password that you've entered is incorrect.";
                                        res.render("home", {loginStatus: loginStatus});
                                }
                        });
                }else{
                        loginStatus =
                          "The email address that you've entered doesn't match any account. <a href='/signup'>Sign up for an account.</a>";
                        res.render("home", {
                                loginStatus: loginStatus
                        });
                }
        })
        
})

app.listen(3000, function () {
  console.log("Server started at Port 3000");
});
