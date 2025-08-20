import express from "express";
import { Types } from "mongoose";
import Cart from "../models/cart.model.js";

const cartRouter = express.Router();

// 1. Listar todos los carritos (GET /api/carts)
cartRouter.get("/", async (req, res) => {
  try {
    const carts = await Cart.find().lean();
    res.status(200).json(carts); // ← devolvemos array plano con _id
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los carritos" });
  }
});

// 2. Crear nuevo carrito (POST /api/carts)
cartRouter.post("/", async (req, res) => {
  try {
    const cart = new Cart();
    await cart.save();
    res.status(201).json({ id: cart._id }); // ← solo devolvemos el ID
  } catch (error) {
    res.status(500).json({ message: "Error al crear el carrito" });
  }
});

// 3. Vista de un carrito (GET /api/carts/:cid/view)
cartRouter.get("/:cid/view", async (req, res) => {
  const { cid } = req.params;
  if (!Types.ObjectId.isValid(cid)) {
    return res.status(400).send("ID de carrito inválido");
  }
  try {
    const cart = await Cart.findById(cid).populate("products.product").lean();
    if (!cart) return res.status(404).send("Carrito no encontrado");
    res.render("cart", { cart });
  } catch (error) {
    res.status(500).send("Error al cargar la vista del carrito");
  }
});

// 4. Obtener los productos de un carrito (GET /api/carts/:cid)
cartRouter.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  if (!Types.ObjectId.isValid(cid)) {
    return res.status(400).json({ message: "ID inválido" });
  }
  try {
    const cart = await Cart.findById(cid).populate("products.product").lean();
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
    res.status(200).json(cart.products);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los productos del carrito" });
  }
});

// 5. Agregar un producto al carrito (POST /api/carts/:cid/product/:pid)
cartRouter.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity = 1 } = req.body;
  if (!Types.ObjectId.isValid(cid) || !Types.ObjectId.isValid(pid)) {
    return res.status(400).json({ message: "ID inválido" });
  }
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    const existing = cart.products.find(p => p.product.toString() === pid);
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.products.push({ product: pid, quantity: Number(quantity) });
    }
    await cart.save();

    res.status(200).json({ message: "Producto agregado", cart });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar producto al carrito" });
  }
});

// 6. Actualizar cantidad de un producto (PUT /api/carts/:cid/product/:pid)
cartRouter.put("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  if (!Types.ObjectId.isValid(cid) || !Types.ObjectId.isValid(pid)) {
    return res.status(400).json({ message: "ID inválido" });
  }
  if (typeof quantity !== "number" || quantity < 1) {
    return res.status(400).json({ message: "Cantidad inválida" });
  }
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item) {
      return res.status(404).json({ message: "Producto no encontrado en el carrito" });
    }
    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Cantidad actualizada", cart });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la cantidad" });
  }
});

// 7. Eliminar un producto del carrito (DELETE /api/carts/:cid/product/:pid)
cartRouter.delete("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  if (!Types.ObjectId.isValid(cid) || !Types.ObjectId.isValid(pid)) {
    return res.status(400).json({ message: "ID inválido" });
  }
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();

    res.status(200).json({ message: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
});

// 8. Vaciar completamente el carrito (DELETE /api/carts/:cid/products)
cartRouter.delete("/:cid/products", async (req, res) => {
  const { cid } = req.params;
  if (!Types.ObjectId.isValid(cid)) {
    return res.status(400).json({ message: "ID inválido" });
  }
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();

    res.status(200).json({ message: "Carrito vaciado" });
  } catch (error) {
    res.status(500).json({ message: "Error al vaciar el carrito" });
  }
});

// 9. Eliminar un carrito completo (DELETE /api/carts/:cid)
cartRouter.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
  if (!Types.ObjectId.isValid(cid)) {
    return res.status(400).json({ message: "ID inválido" });
  }
  try {
    const deleted = await Cart.findByIdAndDelete(cid);
    if (!deleted) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    res.status(200).json({ message: "Carrito eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el carrito" });
  }
});

export default cartRouter;