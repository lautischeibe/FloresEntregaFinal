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

productsRouter.post("/", async(req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;

        const product = new Product({title, description, code, price, status, stock, category, thumbnails});

        await product.save();

        res.status(201).json({ status: "success", payload: product });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al crear un nuevo producto"} );
    }
})

productsRouter.put("/:pid", async(req, res) => {
    try {
        const pid = req.params.pid;
        const updateData = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(pid, updateData, { new: true, runValidators: true });

        if (!updatedProduct) return res.status(404).json({ status: "error", message: "Producto no encontrado"} );

        res.status(200).json({ status: "success", payload: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al modificar el producto"} );
    }
})

productsRouter.delete("/:pid", async(req, res) => {
    try {
        const pid = req.params.pid;
        
        const deletedProduct = await Product.findByIdAndDelete(pid);

        if (!deletedProduct) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

        res.status(200).json({ status: "success", payload: deletedProduct });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar el producto"} );
    }
})

export default productsRouter;