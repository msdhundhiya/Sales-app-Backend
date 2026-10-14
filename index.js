const express = require('express');
const {userRoute} = require('./routes/user');
const {loginRouter} = require('./routes/Login');
const {adminRouter} =require('./routes/Admin');
const {asmRouter} =require('./routes/Asm');

const cors = require('cors');
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
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/",loginRouter);
app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/user",userRoute);
app.use("/api/v1/asm",asmRouter);

 
app.listen(3000);