const { Schema, default: mongoose } = require("mongoose");
require("dotenv").config();

const userSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    mobile:{ type: String, unique: true },
    password: String,
    isDeleted: { type: Boolean, default: false },
    role: {
        type: String,
        enum: ['asm', 'salesman', 'admin'],
        default: 'salesman'
    },

    managerId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    companyId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    deviceId: { 
        type: String, 
        default: null 
    }
},
    { timestamps: true });



const userModel = mongoose.model("user", userSchema);

module.exports = {
    userModel,
}