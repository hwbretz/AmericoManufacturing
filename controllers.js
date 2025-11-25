//controllers.js for routing requests
//imports
const express = require("express");
const router = express.Router();
const models = require("./models");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { error } = require("console");
const mongoose = require("mongoose");
let userNameStr = "";

//register route
router.post("/register", async (req, res) => {
    //console.log(req.body);
    const { username, name,  password, confirmpassword, manager, email, } = req.body;
    if (!username && !password && !confirmpassword && !name && !email && !manager) {
        return res.status(403).render("register", {error: "Missing information"});
    }
    else if (confirmpassword !== password) {
        return res.status(403).render("register",{error: "Passwords don't match"});
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
        userNameStr = `${req.session.name}`;
        let time = new Date();
        console.log(`${req.session.name} logged in at ${time}.`)
        req.session.save();

        return res.redirect("/");
    }
);

//logout
router.get("/logout", (req, res) => {
    
    let time = new Date();
    console.log(`${userNameStr} Logged out at ${time}.`)
    req.session.destroy();
    res.redirect("/");
});

//addItem
router.post("/addItem", async (req, res) => {
   //console.log(req.body);
    const { name,  quantity, supplierName, current, } = req.body;
    
    if (!name && !quantity) {
        var username = req.session.name;
        const items = await models.Item.find();
        const suppliers = await models.Supplier.find();
        return res.status(403).render("addItem", {name: username, items:items, suppliers: suppliers,error: "Missing information"});
    }
    try{
        
        //check if item in db
        const itemExists = await models.Item.findOne({ name: name });
        if (itemExists) {
            var username = req.session.name;
            const items = await models.Item.find();
            const suppliers = await models.Supplier.find();
            return res.status(403).render("addItem", {name: username, items:items, suppliers: suppliers,error: "Item already in database"});
        }
        //convert string to int
        const quantNum = parseInt(quantity,10);
        //convert string to bool
        let active = false;
        if (current === "true") {
            active = true;
        }
        console.log(`New ${name} from ${supplierName} (${quantity} in stock) added to item database by ${userNameStr}`);
        // create and add new item
        const newItem = new models.Item({name,supplierID:supplierName,quantity: quantNum, current: active});
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
        
        //find item
        const item = await models.Item.findOne({name: itemName});
        console.log(`found: ${item.name}`)
        console.log(`${userNameStr} Creating new order: ${item.name}, Count: ${quantity}`);
        //get date
        const currDate = new Date();
        const quant = parseInt(quantity,10);
        const newOrder = new models.Order({itemName: item.name,supplierID: item.supplierID ,username:username, quantity:quant, date: currDate, approved: null})
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
        //console.log(orders);
        //single order dont iterate
        if  (typeof orders.approvals === "string"){
            let comma_idx = orders.approvals.indexOf(',');
            const order_id = new mongoose.Types.ObjectId(orders.approvals.slice(0,comma_idx));
            const foundOrder = await models.Order.findOne(order_id);
            const approval_status = orders.approvals.slice(comma_idx + 1, orders.approvals.length + 1);
            //convert string to bool
            if (approval_status === "true"){
                foundOrder.approved = true;
                console.log(`${userNameStr}: Order: ${orders.approvals.slice(0,comma_idx)} for ${foundOrder.quantity}  ${foundOrder.itemName} Status: Approved.`);
            } else if (approval_status === "false") {
                foundOrder.approved = false;
                console.log(`${userNameStr}: Order: ${orders.approvals.slice(0,comma_idx)} for ${foundOrder.quantity}  ${foundOrder.itemName} Status: Denied.`);
            }
            
            await foundOrder.save();

        }
        //multiple orders
        else {
            //approvals is the array of orders sent back, its all strings so have to parse
            for (let order of orders.approvals) {
                // find the id example:  '692332760ccf732fb56cefcb,true' is a value sent back
                let comma_idx = order.indexOf(',');
                
                const order_id = new mongoose.Types.ObjectId(order.slice(0,comma_idx));
                
                const foundOrder = await models.Order.findOne(order_id);
            
                const approval_status = order.slice(comma_idx + 1, order.length + 1);
                
                //console.log(approval_status);
                //convert string to bool
                if (approval_status === "true"){
                    foundOrder.approved = true;
                    console.log(`${userNameStr}: Order: ${order.slice(0,comma_idx)} for ${foundOrder.quantity}  ${foundOrder.itemName} Status: Approved.`);
                } else if (approval_status === "false") {
                    foundOrder.approved = false;
                    console.log(`${userNameStr}: Order: ${order.slice(0,comma_idx)} for ${foundOrder.quantity}  ${foundOrder.itemName} Status: Denied.`);
                }
                
                await foundOrder.save();

            }
        }
        
        res.redirect("/viewOrders");
            return;
    } catch (err) {
        return res.status(500).json({message: err.message});
    }

});

//addSupplier
router.post("/addSupplier", async (req, res) => {
   //console.log(req.body);
    const { name,  webAddress, email} = req.body;
    if (!email && !name) {
        return res.status(403).render("addSupplier", {name: name, suppliers:suppliers,error: "Missing information"});
    }
    try{
        //check if supplier in db
        const supplierExists = await models.Supplier.findOne({ supplierName:name });
        
        if (supplierExists) {
            return res.status(403).render("addSupplier", {error: "Supplier already in database"});
        }
        
        // create and add new item
        const newSupplier = new models.Supplier({supplierName: name, website: webAddress, email:email});
        await newSupplier.save();
        console.log(`${userNameStr} added New Supplier: ${name} to the database.`)
        
        res.redirect("/addSupplier");
        return;
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
    
});

//useItem
router.post("/useItem", async (req, res) => {
    const {username, itemName, useQuantity} = req.body;

    if (!itemName) {
        const items = await models.Item.find();
        return res.status(403).render("useItem", {name: username, items:items,error: "Missing information"});
    }
    try{
        //find item
        const item = await models.Item.findOne({name: itemName});
         if (!item) {
            const items = await models.Item.find();
            return res.status(403).render("useItem", {name: username, items:items, error: "Item not found"});
        }
        //convert string to int
        const toUse = parseInt(useQuantity,10);
        if(toUse > item.quantity) {
            
            const items = await models.Item.find();
            
            return res.status(403).render("useItem",{name: username, items:items,error: "Quantity Exceeeds Inventory"});
        } else {
            item.quantity = item.quantity - toUse;
            if (toUse < 0) {
                console.log(`${userNameStr} added ${toUse * -1} ${itemName}  to the inventory.`);
            }
            else {
                console.log(`${userNameStr} removed ${toUse} ${itemName} from the inventory.`);
            }
            await item.save();
            res.redirect("/useItem");
            return;
        }

    } catch (err) {
        return res.status(500).json({message: err.message});
    }
});

module.exports = router;
