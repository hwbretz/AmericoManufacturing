// models.js
const mongoose = require("mongoose");

// Creating User Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const itemSchema = new mongoose.Schema({
    //id: {type: ObjectId,},
    name: { type: String, required: true, unique: true},
    inStock: { type: Number, required: true},
    inUse: { type: Boolean, required: true},
});

const Item = mongoose.model("Item",itemSchema);

module.exports = User;
