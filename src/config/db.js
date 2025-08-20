import mongoose from "mongoose";
import Product from "../models/products.model.js";

// Conecto a MongoDB
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.URI_MONGODB);
        //Sincronizamos los indices del modelo Product
        await Product.syncIndexes();
        console.log("Conectado a MongoDB");
    } catch (error) {
        console.error("Error al conectar a MongoDB:", error);
    }
};

export default connectMongoDB;