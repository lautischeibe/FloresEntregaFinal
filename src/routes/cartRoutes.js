import { Router } from 'express';
import fs from 'fs';
import CartManager from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager('./data/carts.json');

// Obtener todos los carritos
router.get('/', async (req, res) => {
  try {
    const carts = await cartManager.getCarts();
    res.json(carts);
  } catch (error) {
    console.error('Error al obtener carritos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    console.error('Error creando el carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener productos de carrito por ID
router.get('/:cid', async (req, res) => {
  try {
    const cid = Number(req.params.cid);
    if (isNaN(cid)) {
      return res.status(400).json({ message: 'ID de carrito inválido' });
    }

    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    res.json(cart.products);
  } catch (error) {
    console.error('Error obteniendo productos del carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cid = Number(req.params.cid);
    const pid = Number(req.params.pid);
    const quantity = req.body.quantity || 1;

    if (isNaN(cid) || isNaN(pid) || quantity <= 0) {
      return res.status(400).json({
        message: 'Datos inválidos: El ID de carrito, ID de Pokémon y cantidad deben ser válidos.',
      });
    }

    const updatedCart = await cartManager.addProductToCart(cid, pid, quantity);
    if (!updatedCart) {
      return res.status(404).json({ message: 'Carrito no encontrado.' });
    }

    res.json({ message: 'Pokémon agregado al carrito', updatedCart });
  } catch (error) {
    console.error('Error al agregar el Pokémon al carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Renderizar vista del carrito
router.get('/:cid/view', async (req, res) => {
  try {
    const cid = Number(req.params.cid);
    if (isNaN(cid)) {
      return res.status(400).send('ID de carrito inválido.');
    }

    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).send('Carrito no encontrado.');
    }

    res.render('cart', { cart });
  } catch (error) {
    console.error('Error renderizando la vista del carrito:', error);
    res.status(500).send('Error interno del servidor.');
  }
});

// Eliminar producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
  try {
    const cid = Number(req.params.cid);
    const pid = Number(req.params.pid);

    console.log('Recibido en DELETE:', { cid, pid });

    if (isNaN(cid) || isNaN(pid)) {
      return res.status(400).json({ message: 'Datos inválidos: ID de carrito o producto incorrectos.' });
    }

    const carts = await cartManager.getCarts();
    const cart = carts.find(c => c.id === cid);

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const originalProductsCount = cart.products.length;
    cart.products = cart.products.filter(p => p.productId !== pid);

    if (cart.products.length === originalProductsCount) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito.' });
    }

    const updatedCarts = carts.map(c => (c.id === cid ? cart : c));
    await fs.promises.writeFile(cartManager.path, JSON.stringify(updatedCarts, null, 2));

    res.json({ message: 'Producto eliminado del carrito', cart });
  } catch (error) {
    console.error('Error eliminando producto del carrito:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;