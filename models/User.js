const { Schema, default: mongoose } = require("mongoose");
require("dotenv").config();

const userSchema = new Schema({
    email: { type: String, unique: true },
    password: String,
    isDeleted: { type: Boolean, default: false }
},
    { timestamps: true });



const userModel = mongoose.model("user", userSchema);

module.exports = {
    userModel,
}