// import { Router } from 'express';
// import ProductManager from '../managers/ProductManager.js';

// const router = Router();
// const productManager = new ProductManager('./data/products.json');

// // Obtener todos los productos con filtros y paginación
// router.get('/', async (req, res) => {
//   const { limit = 10, page = 1, sort, query } = req.query;

//   let products = await productManager.getProducts();

//   if (query) {
//     products = products.filter(product => product.category === query);
//   }

//   if (sort === 'asc') {
//     products.sort((a, b) => a.price - b.price);
//   } else if (sort === 'desc') {
//     products.sort((a, b) => b.price - a.price);
//   }

//   const totalPages = Math.ceil(products.length / limit);
//   const startIndex = (page - 1) * limit;
//   const paginatedProducts = products.slice(startIndex, startIndex + Number(limit));

//   res.json({
//     status: 'success',
//     payload: paginatedProducts,
//     totalPages,
//     page: Number(page),
//     hasPrevPage: page > 1,
//     hasNextPage: page < totalPages,
//     prevPage: page > 1 ? Number(page) - 1 : null,
//     nextPage: page < totalPages ? Number(page) + 1 : null,
//   });
// });

// // Obtener producto por ID
// router.get('/:pid', async (req, res) => {
//   const productId = Number(req.params.pid);
//   const product = await productManager.getProductById(productId);

//   if (!product) {
//     return res.status(404).json({ message: 'Producto no encontrado' });
//   }

//   res.json(product);
// });

// // Obtener categorías únicas
// router.get('/categories', async (req, res) => {
//   const products = await productManager.getProducts();
//   const categories = [...new Set(products.map(p => p.category))];
//   res.json(categories);
// });

// // Crear nuevo producto
// router.post('/', async (req, res) => {
//   const { title, description, code, price, stock, category, status } = req.body;

//   if (!title || !description || !code || !price || !stock || !category || status === undefined) {
//     return res.status(400).json({ message: 'Faltan propiedades requeridas' });
//   }

//   const products = await productManager.getProducts();
//   const codeExists = products.some(p => p.code === code);
//   if (codeExists) {
//     return res.status(400).json({ message: 'El código ya existe' });
//   }

//   const newProduct = await productManager.addProduct(req.body);
//   res.status(201).json(newProduct);
// });

// // Actualizar producto existente
// router.put('/:pid', async (req, res) => {
//   const productId = Number(req.params.pid);
//   const updatedFields = req.body;

//   const product = await productManager.getProductById(productId);
//   if (!product) {
//     return res.status(404).json({ message: 'Producto no encontrado' });
//   }

//   if (updatedFields.code) {
//     const products = await productManager.getProducts();
//     const codeExists = products.some(p => p.code === updatedFields.code && p.id !== productId);
//     if (codeExists) {
//       return res.status(400).json({ message: 'El código ya existe' });
//     }
//   }

//   const updatedProduct = await productManager.updateProduct(productId, updatedFields);
//   res.json(updatedProduct);
// });

// // Eliminar producto por ID
// router.delete('/:pid', async (req, res) => {
//   const deleted = await productManager.deleteProduct(Number(req.params.pid));

//   if (!deleted) {
//     return res.status(404).json({ message: 'Producto no encontrado' });
//   }

//   res.json({ message: 'Producto eliminado' });
// });

// export default router;