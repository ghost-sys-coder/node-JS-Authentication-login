//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const e = require('express');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}))

/**
 * ! Setting up Passport just we initialize or Create our User Database
 */
app.use(session({
    secret: "This is the database encryption where my head lies and my name is tamale plus i can not sleep.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

/**
 * ! BUILDING OUR USER DATABASE IN MONGODB AND MONGOOSE
 */

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
/**
 * ! Building a Mongoose Schema
 */
const userSchema = mongoose.Schema({
    email: String,
    password: String
})

/**
 * ! Running Passport-local-mongoose for our Schema
 */
userSchema.plugin(passportLocalMongoose);

/**
 * ! Creating an Encryption Key for the user Data
 */




/**
 * ! Creating a Mongoose Model
 */
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.get('/register', (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect('/login');
    }
})

/**
 * ! CAPTURING USER DATA FROM THEN REGISTER PAGE
 */
app.post("/register", (req, res) => {

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            })
        }
    })
});

app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) throw err;
        res.redirect("/");
    });
})

/**
 * ! CHECKING IF THE USER EXISTS AND THEN LOGGING THEM IN -- LOGIN PAGE
 */
app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            })
        }
    })
});


app.listen(port, () => {
    console.log(`Server is running on ${port}....`)
})
