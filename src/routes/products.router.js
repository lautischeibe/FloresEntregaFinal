import express from "express";
import { Types } from "mongoose";
import Product from "../models/products.model.js";

const productsRouter = express.Router();

// 1. Listar productos con filtros, paginación y orden

productsRouter.get("/", async (req, res) => {
    try {
        console.log("QUERY PARAMS:", req.query);

        // Desestructurá y sanitizá
        let {
            limit = 10,
            page = 1,
            sort = "",
            query = "",
            minPrice,
            maxPrice
        } = req.query;
        sort = sort.trim();
        query = query.trim();

        // Armá el filtro
        const filter = {};
        if (query) filter.category = query;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Armá la opción de orden
        const sortOption = {};
        if (sort === "asc") sortOption.price = 1;
        if (sort === "desc") sortOption.price = -1;

        // Opciones de paginación
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOption,
            lean: true
        };

        // Ejecutá la paginación
        const result = await Product.paginate(filter, options);

        // Helper para armar prevLink/nextLink con todos los params
        const buildLink = (pageNum) => {
            let link = `/api/products?limit=${limit}&page=${pageNum}`;
            if (query) link += `&query=${encodeURIComponent(query)}`;
            if (minPrice) link += `&minPrice=${minPrice}`;
            if (maxPrice) link += `&maxPrice=${maxPrice}`;
            if (sort) link += `&sort=${sort}`;
            return link;
        };

        // Respondé con la estructura completa
        res.status(200).json({
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
            nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "Error al obtener los productos"
        });
    }
});


// 2. Listar categorías únicas
productsRouter.get("/categories", async (req, res) => {
    try {
        const categories = await Product.distinct("category");
        res.status(200).json(categories);
    } catch (error) {
        res
            .status(500)
            .json({ status: "error", message: "Error al obtener categorías" });
    }
});

// 3. Obtener producto por ID
productsRouter.get("/:pid", async (req, res) => {
    const { pid } = req.params;
    if (!Types.ObjectId.isValid(pid)) {
        return res
            .status(400)
            .json({ status: "error", message: "ID inválido" });
    }
    try {
        const product = await Product.findById(pid).lean();
        if (!product) {
            return res
                .status(404)
                .json({ status: "error", message: "Producto no encontrado" });
        }
        res.status(200).json({ status: "success", payload: product });
    } catch (error) {
        res
            .status(500)
            .json({ status: "error", message: "Error al obtener el producto" });
    }
});

// 4. Crear producto con validación
productsRouter.post("/", async (req, res) => {
    try {
        const {
            title,
            description,
            code,
            price: priceRaw,
            stock: stockRaw,
            category,
            thumbnails = [],
            status = true
        } = req.body;
        if (
            !title ||
            !description ||
            !code ||
            priceRaw == null ||
            stockRaw == null ||
            !category
        ) {
            return res
                .status(400)
                .json({ status: "error", message: "Faltan campos obligatorios" });
        }
        const price = Number(priceRaw);
        const stock = Number(stockRaw);
        if (isNaN(price) || isNaN(stock)) {
            return res
                .status(400)
                .json({ status: "error", message: "Precio y stock deben ser números" });
        }
        const product = new Product({
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails,
            status
        });
        await product.save();
        return res.status(201).json({ status: "success", payload: product });

    } catch (error) {
        // Si es error de clave duplicada sobre `code`
        if (error.code === 11000 && error.keyPattern?.code) {
            return res
                .status(409)
                .json({ status: "error", message: "El código ya existe" });
        }

        console.error("Error al crear producto:", error);
        return res
            .status(500)
            .json({ status: "error", message: error.message });
    }

});

// 5. Actualizar producto por ID
productsRouter.put("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        const updateData = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(pid, updateData, {
            new: true,
            runValidators: true
        });
        if (!updatedProduct) {
            return res
                .status(404)
                .json({ status: "error", message: "Producto no encontrado" });
        }
        res.status(200).json({ status: "success", payload: updatedProduct });
    } catch (error) {
        res
            .status(500)
            .json({ status: "error", message: "Error al modificar el producto" });
    }
});

// 6. Eliminar producto por ID
productsRouter.delete("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(pid);
        if (!deletedProduct) {
            return res
                .status(404)
                .json({ status: "error", message: "Producto no encontrado" });
        }
        res.status(200).json({ status: "success", payload: deletedProduct });
    } catch (error) {
        res
            .status(500)
            .json({ status: "error", message: "Error al eliminar el producto" });
    }
});

productsRouter.get('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    if (!Types.ObjectId.isValid(pid)) {
      return res.status(400).send('ID de producto inválido');
    }

    const product = await Product.findById(pid).lean();
    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }

    // Pasamos el product a la vista
    res.render('detailProducts', { product });
  } catch (err) {
    console.error('Error al cargar detalle de producto:', err);
    res.status(500).send('Error interno');
  }
});


export default productsRouter;