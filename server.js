const express = require("express");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require('express-session');
const MongoStore = require("connect-mongo");
require("dotenv").config();
require("./config/database");
const addUserToViews = require("./middleware/addUserToViews");
const isSignedIn = require("./middleware/isSignedIn");


const app = express();

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";

// Middleware

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Morgan for logging HTTP requests
app.use(morgan('dev'));

// Controllers
const authCtrl = require('./controllers/auth');

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);


app.use(addUserToViews);

// Public Routes
// GET /
app.get("/", async (req, res) => {
    res.render("index.ejs");
});

app.use('/auth', authCtrl);


// Private Routes

app.use(isSignedIn);
// anything below this will require the user to be signed in
app.get("/vip-lounge", isSignedIn, (req, res) => {
  if (req.session.user) {
    res.send(`Welcome to the party ${req.session.user.username}.`);
  } else {
    res.sendStatus(404);
  }
});


app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});