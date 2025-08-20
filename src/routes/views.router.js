import express from "express";
import Product from "../models/products.model.js";

const viewsRouter = express.Router();

viewsRouter.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query

        const data = await Product.paginate({ }, { limit, page, lean: true });

        const products = data.docs
        delete data.docs

        const links = []

        for(let index = 1; index <= data.totalPages; index++) {
            links.push({ text: index, link: `?limit=${limit}&page=${index}` })
        }

        res.render("home", { products, links });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al obtener los productos"} );   
    }
})

viewsRouter.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await Product.findById(pid).lean();

    if (!product) {
      return res.status(404).render("error", { message: "Producto no encontrado" });
    }

    res.render("productDetail", { product });
  } catch (error) {
    res.status(500).render("error", { message: "Error al cargar el producto" });
  }
});


export default viewsRouter;