//import
const express = require("express");
const passport = require("passport");
const models = require("./models.js");
const localStrategy = require("./passp.js");
const controllers = require("./controllers.js");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const routes = require("./pages.js");
const session = require("express-session");

//server, expressJS instance
const app = express();
connectDB();
app.use(
    session({
        secret: "GFGLogin346",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine","ejs");

// for (de)serializing users 
passport.serializeUser((user,done) => done(null, user.id));
/*
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
});
*/
passport.deserializeUser((id, done) => {
    try {
        const user = models.User.findById(id);
        done(null, user);
    } catch (err) {
        done(err,null);
    }
});

//routing
// path to auth routes files
app.use("/api/", controllers);
app.use("/",routes);

//const app = express();

// Start the server
//whatever port
const port = 3000;
app.listen(port, () => {
    console.log(`Serving on prt ${port}`);
}) 
