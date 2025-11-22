// models.js
const mongoose = require("mongoose");
const ObjectId = require('mongodb');

// Creating User Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true},
    email: { type: String },
    manager: { type: Boolean},
});

const User = mongoose.model("User", userSchema);

const itemSchema = new mongoose.Schema({
    ItemID: {type: mongoose.Schema.Types.ObjectId},
    name: { type: String, required: true, unique: true},
    supplierID: {},
    quantity: { type: Number, required: true},
    current: { type: Boolean, required: true},

});

const Item = mongoose.model("Item",itemSchema);

const orderSchema = new mongoose.Schema({
    orderID: {type: mongoose.Schema.Types.ObjectId},
    itemID: {},
    username: {type: String},
    quantity: {type: Number},
    date: {type: Date},
    approved: {type: Boolean},
});

const Order = mongoose.model("Order",orderSchema);

const supplierSchema = new mongoose.Schema({
    supplierID: {type: mongoose.Schema.Types.ObjectId},
    supplierName: {type: String, required: true},
    website: {type: String},
    email: {type: String},
});

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = {User,Item, Order, Supplier };
