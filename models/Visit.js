// models/Visit.js
const { Schema, model } = require("mongoose");

const visitSchema = new Schema({
    _id: { type: String },
    customerId: { type: String, ref: 'customer', required: true },
    dateTime: { type: Date, required: true },

    // --- OFFLINE SYNC REQUIRED FIELDS ---
    isDeleted: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'user' },
    companyId: { type: Schema.Types.ObjectId, ref: 'user', required: true }

}, {
    timestamps: true
});

module.exports = model("Visit", visitSchema);