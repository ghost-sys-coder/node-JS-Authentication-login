//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}))

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
 * ! Creating an Encryption Key for the user Data
 */

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });


/**
 * ! Creating a Mongoose Model
 */
const User = new mongoose.model("User", userSchema);

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.get('/register', (req, res) => {
    res.render("register");
});

/**
 * ! CAPTURING USER DATA FROM THEN REGISTER PAGE
 */
app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    });

});

/**
 * ! CHECKING IF THE USER EXISTS AND THEN LOGGING THEM IN -- LOGIN PAGE
 */
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
        }
    });
});


app.listen(port, (res, req) => {
    console.log(`Server is running on ${port}....`)
})
