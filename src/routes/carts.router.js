import express from "express";
import { Types } from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/products.model.js";

const cartRouter = express.Router();
const isValidId = (id) => Types.ObjectId.isValid(id);

/**
 * 1. Listar todos los carritos
 *    GET /api/carts
 */
cartRouter.get("/", async (req, res) => {
  try {
    const carts = await Cart.find().lean();
    res.status(200).json({ status: "success", payload: carts });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al obtener los carritos" });
  }
});

/**
 * 2. Crear un carrito nuevo
 *    POST /api/carts
 */
cartRouter.post("/", async (req, res) => {
  try {
    const cart = await Cart.create({ products: [] });
    return res
      .status(201)
      .json({ status: "success", payload: cart });
  } catch (error) {
    console.error("Error al crear carrito:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Error al crear el carrito" });
  }
});

/**
 * 3. Obtener productos de un carrito (JSON)
 *    GET /api/carts/:cid
 */
cartRouter.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  if (!isValidId(cid)) {
    return res
      .status(400)
      .json({ status: "error", message: "ID de carrito inválido" });
  }
  try {
    const cart = await Cart.findById(cid)
      .populate("products.product")
      .lean();
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }
    return res
      .status(200)
      .json({ status: "success", payload: cart.products });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al obtener el carrito" });
  }
});

/**
 * 4. Renderizar vista de carrito (Handlebars)
 *    GET /api/carts/:cid/view
 */
cartRouter.get("/:cid/view", async (req, res) => {
  const { cid } = req.params;
  if (!isValidId(cid)) {
    return res.status(400).send("ID de carrito inválido");
  }
  try {
    const cart = await Cart.findById(cid)
      .populate("products.product")
      .lean();
    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }
    return res.render("cart", { cart });
  } catch (error) {
    res.status(500).send("Error al cargar la vista del carrito");
  }
});

/**
 * 5. Agregar un producto al carrito
 *    POST /api/carts/:cid/products/:pid
 */
cartRouter.post("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  let { quantity = 1 } = req.body;
  quantity = Number(quantity);

  if (!isValidId(cid) || !isValidId(pid)) {
    return res
      .status(400)
      .json({ status: "error", message: "ID inválido" });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res
      .status(400)
      .json({ status: "error", message: "Cantidad inválida" });
  }

  try {
    const [cart, product] = await Promise.all([
      Cart.findById(cid),
      Product.findById(pid)
    ]);

    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }
    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ status: "error", message: "Stock insuficiente" });
    }

    product.stock -= quantity;
    await product.save();

    const item = cart.products.find(i => i.product.toString() === pid);
    if (item) {
      item.quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }
    await cart.save();

    return res
      .status(200)
      .json({ status: "success", payload: cart });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al agregar producto al carrito" });
  }
});

/**
 * 6. Eliminar un producto del carrito
 *    DELETE /api/carts/:cid/products/:pid
 */
cartRouter.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  if (!isValidId(cid) || !isValidId(pid)) {
    return res
      .status(400)
      .json({ status: "error", message: "ID inválido" });
  }

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    const index = cart.products.findIndex(p => p.product.toString() === pid);
    if (index === -1) {
      return res
        .status(404)
        .json({ status: "error", message: "Producto no está en el carrito" });
    }

    const { quantity } = cart.products[index];
    const product = await Product.findById(pid);
    if (product) {
      product.stock += quantity;
      await product.save();
    }

    cart.products.splice(index, 1);
    await cart.save();

    return res
      .status(200)
      .json({ status: "success", payload: cart });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al eliminar producto del carrito" });
  }
});

/**
 * 7. Eliminar carrito completo y restaurar stock
 *    DELETE /api/carts/:cid
 */
cartRouter.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
  if (!isValidId(cid)) {
    return res
      .status(400)
      .json({ status: "error", message: "ID inválido" });
  }

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    for (const item of cart.products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await Cart.findByIdAndDelete(cid);
    return res
      .status(200)
      .json({ status: "success", message: "Carrito eliminado y stock restaurado" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al eliminar el carrito" });
  }
});

export default cartRouter;