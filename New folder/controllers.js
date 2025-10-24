//controllers.js for routing requests
//imports
const express = require("express");
const router = express.Router();
const User = require("./models");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { error } = require("console");

//route regi
router.post("/register", async (req, res) => {
    console.log(req.body);
    const { username,  password, confirmpassword} = req.body;
    if (!username && !password && !confirmpassword) {
        return res.status(403).render("register", {error: "Missing information"});
    }
    else if (confirmpassword !== password) {
        return res.status(403).render("register",{error: "Password incorrect"});
    }
    try {
        //check if user in db
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(403).render("register", {error: "Username already in use"});
        }
        
        //hash password for safe keeping
        const salt = await bcrypt.genSalt(15);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create and add new user
        const newUser = new User({username,password: hashedPassword});
        await newUser.save();
        return res.redirect("/login");
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
});

//login route
router.post(
    "/login",
    passport.authenticate("local", { session: false }),
    (req, res) => {
        req.session.name = req.body.username;
        req.session.save();

        return res.redirect("/");
    }
);

//logout

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

module.exports = router;
