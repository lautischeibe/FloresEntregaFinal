import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    code: String,
    price: Number,
    status: {type: Boolean, default: true},
    stock: Number,
    category: String,
    thumbnails: [String],
    created_at: { type: Date, default: Date.now() }
});

const Product = mongoose.model("Product", productSchema);

export default Product;