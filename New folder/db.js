//db.js
const mongoose = require("mongoose");
//database
const connectDB = async () => {
    mongoose.connect("mongodb://127.0.0.1/Midterm"
            //  127.0.0.1 , localhost , 0.0.0.0
            ).then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error: ", err));
};

module.exports = connectDB;
