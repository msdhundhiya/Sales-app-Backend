const { Schema, default: mongoose } = require("mongoose");
require("dotenv").config();

const customerSchema = new Schema({
    _id: { type: String },
    firmName: String,
    perName: String,
    moNumber: String,
    waNumber: String,
    day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        default: 'monday'
    },
    remarks: String,
    address: String,
    isDeleted: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true });


const customerModel = mongoose.model("customer", customerSchema);

module.exports = {
    customerModel,
}