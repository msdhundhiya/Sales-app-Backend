// models/Visit.js
const { Schema, model } = require("mongoose");

const visitSchema = new Schema({
    _id: { type: String },
    customerId: { type: String, ref: 'Customer', required: true },
    dateTime: { type: Date, required: true },
    
    // --- OFFLINE SYNC REQUIRED FIELDS ---
    isDeleted: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
    timestamps: true 
});

module.exports = model("Visit", visitSchema);