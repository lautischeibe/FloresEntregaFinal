import mongoose from "mongoose";

// Conecto a MongoDB
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.URI_MONGODB);
        console.log("Conectado a MongoDB");
    } catch (error) {
        console.error("Error al conectar a MongoDB:", error);
    }
};

export default connectMongoDB;