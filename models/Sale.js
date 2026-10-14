const { Schema, default: mongoose } = require("mongoose");
require("dotenv").config();

const saleSchema = new Schema({
    _id: { type: String }, // UUID from sqflite

    // Notice type is String, not ObjectId, because Customer _id is a UUID String!
    customerId: { type: String, ref: 'customer', required: true },

    amount: { type: Number, required: true }, // Mapped from REAL
    dateTime: { type: Date, required: true }, // Mapped from TEXT (ISO String)

    // MongoDB handles arrays beautifully. 
    // This maps exactly to the JSON list you will encode in Dart.
    productQuantities: [{
        productId: { type: String, ref: 'product' },
        quantity: { type: Number, required: true }
    }],

    // --- OFFLINE SYNC REQUIRED FIELDS ---
    isDeleted: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'user' },
    companyId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    // The employee/user who made the sale
}, {
    timestamps: true
});



const saleModel = mongoose.model("sale", saleSchema);

module.exports = {
    saleModel,
}