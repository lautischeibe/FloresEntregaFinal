import express from "express";
import Product from "../models/products.model.js";

const productsRouter = express.Router();

// 🧩 Obtener productos con paginación
productsRouter.get("/", async (req, res) => {
    try {
        const { limit = 5, page = 1 } = req.query;

        const data = await Product.paginate({}, { limit, page });
        const products = data.docs;
        delete data.docs;

        res.status(200).json({ status: "success", payload: products, ...data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener los productos" });
    }
});

// 🧠 Crear nuevo producto
productsRouter.post("/", async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails, status } = req.body;

        const product = new Product({ title, description, code, price, stock, category, thumbnails, status });
        await product.save();

        res.status(201).json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al crear un nuevo producto: " + error });
    }
});

// 🔧 Actualizar producto por ID
productsRouter.put("/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;
        const updateData = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(pid, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedProduct)
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });

        res.status(200).json({ status: "success", payload: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al modificar el producto" });
    }
});

// 🗑️ Eliminar producto por ID
productsRouter.delete("/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;

        const deletedProduct = await Product.findByIdAndDelete(pid);

        if (!deletedProduct)
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });

        res.status(200).json({ status: "success", payload: deletedProduct });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar el producto" });
    }
});

// 📦 Obtener categorías únicas desde MongoDB
productsRouter.get("/categories", async (req, res) => {
    try {
        const categoria = await Product.distinct("category");
        res.status(200).json(categoria);
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener categorías" });
    }
});


// 🔍 Filtrar productos por categoría, precio, orden y paginación
productsRouter.get("/filter", async (req, res) => {
    try {
        const { query, minPrice, maxPrice, sort, limit = 5, page = 1 } = req.query;
        const filter = {};
        const sortOption = {};

        if (query) filter.category = query;
        if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
        if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
        if (sort === "asc") sortOption.price = 1;
        if (sort === "desc") sortOption.price = -1;

        const data = await Product.paginate(filter, {
            limit: Number(limit),
            page: Number(page),
            sort: sortOption,
        });

        const products = data.docs;
        delete data.docs;

        res.status(200).json({ status: "success", payload: products, ...data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al filtrar productos" });
    }
});

export default productsRouter;

