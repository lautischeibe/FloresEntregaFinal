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

viewsRouter.get('/realtimeproducts', async (req, res) => {
  const { page = 1, limit = 5 } = req.query;

  const result = await Product.paginate({}, { page, limit, lean: true });
  const categories = await Product.distinct('category');

  res.render('realtimeproducts', {
    products: result.docs,
    page: result.page,
    categories
  });
});

viewsRouter.get("/realtimeproducts", async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const result = await Product.paginate({}, { page, limit, lean: true });
    const categories = await Product.distinct("category");

    res.render("realtimeproducts", {
      products: result.docs,
      page: result.page,
      categories
    });
  } catch (error) {
    res.status(500).render("error", { message: "Error al cargar productos en tiempo real" });
  }
});


export default viewsRouter;