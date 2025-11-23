//controllers.js for routing requests
//imports
const express = require("express");
const router = express.Router();
const models = require("./models");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { error } = require("console");
const mongoose = require("mongoose");

//register route
router.post("/register", async (req, res) => {
    //console.log(req.body);
    const { username, name,  password, confirmpassword, manager, email, } = req.body;
    if (!username && !password && !confirmpassword && !name && !email && !manager) {
        return res.status(403).render("register", {error: "Missing information"});
    }
    else if (confirmpassword !== password) {
        return res.status(403).render("register",{error: "Password incorrect"});
    }
    try {
        //check if user in db
        const userExists = await models.User.findOne({ username });
        if (userExists) {
            return res.status(403).render("register", {error: "Username already in use"});
        }
        
        //hash password for safe keeping
        const salt = await bcrypt.genSalt(15);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create and add new user
        const newUser = new models.User({username,password: hashedPassword, name : name, email : email, manager: manager});
        await newUser.save();
        return res.redirect("/login");
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
});

//login route
router.post("/login", passport.authenticate("local", { session: false }),
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

//addItem
router.post("/addItem", async (req, res) => {
   //console.log(req.body);
    const { name,  quantity, current} = req.body;
    if (!name && !quantity) {
        return res.status(403).render("addItem", {error: "Missing information"});
    }
    try{
        //check if item in db
        const itemExists = await models.Item.findOne({ name });
        if (itemExists) {
            return res.status(403).render("addItem", {error: "Item already in database"});
        }
        //convert string to int
        const quantNum = parseInt(quantity,10);
        //convert string to bool
        const active = current? true : false;
        
        // create and add new item
        const newItem = new models.Item({name,quantity: quantNum, current: active});
        await newItem.save();
        
        res.redirect("/addItem");
        return;
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
    
});

router.post("/createOrder", async (req, res) => {
    const {username, itemName, quantity} = req.body;
    if (!username && !itemName && !quantity){
        return res.status(403).render("createOrder", {error: "Missing information"});
    }
    try{
        console.log(`${username}`);
        //find item
        const item = await models.Item.findOne({itemName});
        const founditem = item.name;
        //get date
        const currDate = new Date();
        const quant = parseInt(quantity,10);
        const newOrder = new models.Order({itemName: founditem, username:username, quantity:quant, date: currDate, approved: null})
        await newOrder.save();

        res.redirect("/");
        return;
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
});

router.post("/approveOrder", async (req, res) => {
    
    const orders = req.body;
    //console.log(orders);
    if(orders=== null || orders === undefined){
        return res.status(403).render("approveOrder", {error: "approval missing"});
    }
    try {
        //approvals is the array of orders sent back, its all strings so have to parse
        for (let order of orders.approvals) {
            // find the id example:  '692332760ccf732fb56cefcb,true' is a value sent back
            let comma_idx = order.indexOf(',');
            //console.log(`ID: ${order.slice(0,comma_idx)}`);
            const order_id = new mongoose.Types.ObjectId(order.slice(0,comma_idx));
            
            const foundOrder = await models.Order.findOne(order_id);
            const approval_status = order.slice(comma_idx + 1, order.length + 1);
            //console.log(approval_status);
            //convert string to bool
            if (approval_status === "true"){
                foundOrder.approved = true;
            } else if (approval_status === "false") {
                foundOrder.approved = false;
            }
            
            await foundOrder.save();

        }
        res.redirect("/viewOrders");
            return;
    } catch (err) {
        return res.status(500).json({message: err.message});
    }

});

module.exports = router;
