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
    location: {
        type: {
            type: String,
            enum: ['Point'], // 'location.type' must be 'Point'
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // Default to 0,0 if not provided
        }
    },
    isDeleted: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'user' },
    companyId: { type: Schema.Types.ObjectId, ref: 'user', required: true }

}, { timestamps: true });

customerSchema.index({ location: '2dsphere' });
const customerModel = mongoose.model("customer", customerSchema);

module.exports = {
    customerModel,
}