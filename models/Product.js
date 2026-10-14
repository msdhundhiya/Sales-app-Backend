const { Schema, default: mongoose } = require("mongoose");
require("dotenv").config();

const productSchema = new Schema({
    _id: { type: String },
    name: String,
    mrp: Number,
    sellingPrice: Number,
    isDeleted: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'user' },
    companyId: { type: Schema.Types.ObjectId, ref: 'user', required: true }

}, { timestamps: true });


const productModel = mongoose.model("product", productSchema);

module.exports = {
    productModel,
}