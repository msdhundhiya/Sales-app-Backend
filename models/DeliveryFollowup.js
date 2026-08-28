// models/DeliveryFollowup.js
const { Schema, model } = require("mongoose");

const deliveryFollowupSchema = new Schema({
    _id: { type: String },
    
    saleId: { type: String, ref: 'Sale', required: true, unique: true },
    
    deliveryDateTime: { type: Date, required: true },
    
    receivedQuantities: [{
        productId: { type: String, ref: 'Product' },
        quantityReceived: { type: Number, required: true }
    }],
    
    remarks: String,
    
    status: { 
        type: String, 
        required: true,
        enum: ['Pending', 'Partial', 'Completed', 'Cancelled'] // Suggestion: Enforce status types
    },
    
    // --- OFFLINE SYNC REQUIRED FIELDS ---
    isDeleted: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
    timestamps: true 
});

module.exports = model("DeliveryFollowup", deliveryFollowupSchema);