const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const Post = require('./models/Post');
const User = require('./models/User');

mongoose.connect("mongodb://localhost:27017/miaryDB", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
});

const newPost = new Post({
        title: "Title Goes Here",
        date: new Date().toString().split(" ").splice(1, 3).join(" "),
        content: "On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.",
});
newPost.save();

const app = express();
app.use(bodyParser.urlencoded({
        extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function (req, res) {
        res.render("home", {
                loginStatus: "",
        });
});

app.get("/login", function (req, res) {
        res.render("home", {
                loginStatus: "You've successfully logged out",
        });
});

app.get("/signup", function (req, res) {
        res.render("signup", {
                signupStatus: "",
        });
});


app.post("/signup", function (req, res) {
        const fname = req.body.fname;
        const lname = req.body.lname;
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({
                username: username
        }, function (err, user) {
                if (err) console.log(err);
                else if (user) {
                        var signupStatus =
                                "User Already Exists.<br> <strong>Please Login to your account.</strong>";
                        res.render("signup", {
                                signupStatus: signupStatus,
                        });
                } else {
                        bcrypt.hash(password, saltRounds, function (err, hash) {
                                if (err) {
                                        console.log(err);
                                        res.redirect("/signup");
                                } else {
                                        const newUser = new User({
                                                fname: fname,
                                                lname: lname,
                                                username: username,
                                                password: hash,
                                                posts: [],
                                        });

                                        newUser.save();
                                        var signupStatus =
                                                "Successfully Registered New User<br> <strong><a href='/'>Login to your account</a></strong>";
                                        res.render("signup", {
                                                signupStatus: signupStatus,
                                        });
                                }
                        });
                }
        });
});

app.post("/", function (req, res) {
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({
                username: username
        }, function (err, user) {
                if(err) console.log(err1);
                else if (user) {
                        bcrypt.compare(password, user.password, function (err, result) {
                                if(err) console.log(err);
                                else if (result == true) {
                                        var postStatus = "";
                                        var today = new Date().toString().split(" ").splice(1, 3).join(" ");
                                        if (user.posts.length === 0) {
                                                var message = "Excited to submit your first entry? Click <a class='form' href='#'>here.</a>";
                                                res.render("dashboard", {
                                                        user: user,
                                                        postStatus: message,
                                                        day: today,
                                                        message: "",
                                                });
                                        }
                                        else{
                                                user.posts.forEach(function (post) {
                                                        var num_of_posts = user.posts.length;
                                                        if (user.posts[num_of_posts-1].date === today) {
                                                                postStatus = "You have already written for today! Make sure to visit us tomorrow. Click <a href='/login'>here</a> to logout";
                                                                res.render("dashboard", {
                                                                        user: user,
                                                                        postStatus: postStatus,
                                                                        day: today,
                                                                        message: "Here are your memories"
                                                                });
                                                        }else{
                                                                postStatus = "How is your day going? Click <a class = 'form' href='#'>here</a> to submit today's entry";
                                                                res.render("dashboard", {
                                                                        user: user,
                                                                        postStatus: postStatus,
                                                                        day: today,
                                                                        message: "Here are your memories",
                                                                });
                                                        }
                                                })
                                        }
                                        
                                } else {
                                        loginStatus = "The password that you've entered is incorrect.";
                                        res.render("home", {
                                                loginStatus: loginStatus
                                        });
                                }
                        });
                } else {
                        loginStatus =
                                "The email address that you've entered doesn't match any account. <a href='/signup'>Sign up for an account.</a>";
                        res.render("home", {
                                loginStatus: loginStatus,
                        });
                }
        });
});

app.post("/:userId", function (req, res) {
        const userId = req.params.userId;
        const title = req.body.title;
        const content = req.body.content;
        const date = new Date().toString().split(" ").splice(1, 3).join(" ");

        const newPost = new Post({
                title: title,
                content: content,
                date: date
        });
        newPost.save();
        User.findById(userId, function (err, user) {
                user.posts.forEach(function (post) {
                        if (post.date === date) {
                                res.render("dashboard", {
                                        user: user,
                                        postStatus: "",
                                        day: date,
                                        message: "Here are your memories",
                                });
                        }
                })
                user.posts.push(newPost);
                user.save();
                const postStatus = "Thanks for today's entry. Make sure to visit us tomorrow. Click <a href='/login'>here</a> to logout";
                res.render("dashboard", {
                        user: user,
                        postStatus: postStatus,
                        day: date,
                        message: "Here are your memories",
                });
        });

})

app.listen(3000, function () {
        console.log("Server started at Port 3000");
});