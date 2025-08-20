import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import viewsRouter from "./routes/views.router.js";
import productsRouter from "./routes/products.router.js";
import cartRouter from "./routes/carts.router.js";
import connectMongoDB from "./config/db.js";
import dotenv from "dotenv";
import Product from "./models/products.model.js";

// Inicializo variables de entorno
dotenv.config();

// Conexion MongoDB
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
app.use("/api/products", productsRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewsRouter);

// Servidor HTTP + Websockets
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server);

// Configuración Websockets
io.on("connection", async (socket) => {
  console.log("Cliente conectado");

  // Emitir productos actuales al conectar
  const products = await Product.find().lean();
  socket.emit("updateProducts", products);

  // Agregar nuevo producto
  socket.on("newProduct", async (productData) => {
    try {
      const newProduct = await Product.create(productData);
      const updatedProducts = await Product.find().lean();
      io.emit("updateProducts", updatedProducts);
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  });

  // Eliminar producto
  socket.on("deleteProduct", async (productId) => {
    try {
      await Product.findByIdAndDelete(productId);
      const updatedProducts = await Product.find().lean();
      io.emit("updateProducts", updatedProducts);
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  });
});


// Rutas para vistas
app.get("/", (req, res) => {
  res.redirect("/products");
});

app.get("/products", async (req, res) => {
  const products = await Product.find().lean();
  res.render("home", { products });
});

app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

// Arrancar servidor
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});