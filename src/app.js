import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import ProductManager from "./managers/ProductManager.js";
import productsRouter from "./routes/products.router.js";

// Conecto a MongoDB
const connectMongoDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://lautischeibe:a42331389@ecommerce-cluster.kczq7za.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=ecommerce-cluster");
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  }
};

connectMongoDB();

// __dirname workaround en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware para JSON y archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/img", express.static(path.join(__dirname, "img")));

// Rutas de API
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);

// ProductManager instanciado
const productManager = new ProductManager("./data/products.json");

// Endpoints mongoose
app.use("/api/products", productsRouter);

// Servidor HTTP + Websockets
const PORT = 8080;
const server = http.createServer(app);
const io = new Server(server);

// Configuración Websockets
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("newProduct", async(productData) => {
    try {
      const newProduct = await productManager.addProduct(productData);
      io.emit("productAdded", newProduct)
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  })


  socket.emit("updateProducts", productManager.getProducts());

  socket.on("newProduct", async (product) => {
    await productManager.addProduct(product);
    const products = await productManager.getProducts();
    io.emit("updateProducts", products);
  });

  socket.on("deleteProduct", async (productId) => {
    await productManager.deleteProduct(productId);
    const products = await productManager.getProducts();
    io.emit("updateProducts", products);
  });
});

// Rutas para vistas
app.get("/", (req, res) => {
  res.redirect("/products");
});

app.get("/products", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("home", { products });
});

app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

// Arrancar servidor
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});