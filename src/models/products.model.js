import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
    title: String,
    description: { type: String, index: "text" },
    code: { type: String, unique: true },
    price: Number,
    stock: Number,
    category: { type: String, index: true },
    thumbnails: { type: String, default: ""},
    status: {type: Boolean, default: true},
    created_at: { type: Date, default: Date.now() }
});

productSchema.plugin(paginate);

const Product = mongoose.model("Product", productSchema);

export default Product;