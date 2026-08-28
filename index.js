const express = require('express');
const {userRoute} = require('./routes/user');
const {mongoose} = require('mongoose');
require("dotenv").config();
const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
    } catch (error) {
        console.error("DB Connection Error:", error);
    }
};

connectToDB();
app = express();
app.use(express.json())
app.use("/api/v1/user",userRoute);
 
app.listen(3000);