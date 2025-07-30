import express from "express";
import Product from "../models/products.model.js";

const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ status: "success", payload: products });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener los productos"} );
    }
});

export default productsRouter;