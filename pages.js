// pages.js
const express = require("express");
const router = express.Router();
const models = require("./models");

//router.get("/[page]")

//home
router.get("/", async (req, res) => {
    if (req.session.name) {
        var username = req.session.name;
        const user = await models.User.findOne({username: username});
        
        return res.render("home", {name: user.name, manager: user.manager});
    }
    return res.render("home", { name: null});
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

router.get("/addItem", async (req, res) => {
    if (req.session.name) {
        var name = req.session.name;
        const items = await models.Item.find();
        if(items){
            return res.render("addItem", {name: name, items:items});
        } else{
            return res.render("addItem", {name: name});
        }
        
    }
    return res.render("home", { name: null, items: null});
});

router.get("/createOrder", async (req, res) => {
    if (req.session.name) {
        var username = req.session.name;
        const user = await models.User.findOne({username: username});
        const allItems = await models.Item.find();
        if (allItems){
            return res.render("createOrder", {name: user.name, items:allItems, manager: user.manager });
        } else {
            return res.render("createOrder", {name: user.name});
        }
    }
    return res.render("home", {name: null,items: null});
});

router.get("/viewOrders", async (req, res) => {
    if (req.session.name) {
        var username = req.session.name;
        const user = await models.User.findOne({username: username});
        const allOrders = await models.Order.find();
        if (allOrders){
            return res.render("viewOrders", {name: user.name, orders: allOrders});
        } else {
            return res.render("viewOrders", {name: user.name});
        }
    }
    return res.render("viewOrders", {name: null,items: null});
});

module.exports = router;