// pages.js
const express = require("express");
const router = express.Router();
const models = require("./models");

router.get("/", async (req, res) => {
    if (req.session.name) {
        var name = req.session.name;
        const items = await models.Item.find();
        if(items){
            return res.render("home", {name: name, items:items});
        } else{
            return res.render("home", {name});
        }
        
    }
    return res.render("home", { name: null, items: null});
});

router.get("/login", (req, res) => {
    if (req.session.name) {
        return res.redirect("/");
    }
    return res.render("login", {error: null});
});

router.get("/register", (req, res) => {
    if (req.session.name) {
        return res.redirect("/");
    }
    return res.render("register", {error: null});
});

module.exports = router;