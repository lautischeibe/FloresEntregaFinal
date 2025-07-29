import fs from 'fs';

class CartManager {
  constructor(filePath) {
    this.path = filePath;
  }

  async createCart() {
    const carts = await this.getCarts();
    const maxId = carts.length > 0 ? Math.max(...carts.map(cart => cart.id)) : 0;
    const newCart = { id: maxId + 1, products: [] };
    carts.push(newCart);

    try {
      await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
      console.log(`Nuevo carrito creado con ID: ${newCart.id}`);
    } catch (error) {
      console.error('Error al guardar el carrito en el archivo:', error);
      throw new Error('No se pudo guardar el carrito.');
    }

    return newCart;
  }

  async getCarts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn('El archivo carts.json no existe. Creando uno nuevo...');
        await fs.promises.writeFile(this.path, JSON.stringify([], null, 2));
        return [];
      }
      console.error('Error al leer los carritos:', error);
      return [];
    }
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find(cart => cart.id === id);
  }

  async addProductToCart(cid, pid, quantity = 1) {
    const carts = await this.getCarts();
    const cart = carts.find(cart => cart.id === cid);
    if (!cart) {
      console.error(`Carrito con ID ${cid} no encontrado.`);
      return null;
    }

    console.log('Carrito encontrado:', cart);

    const product = cart.products.find(p => p.productId === pid);
    if (product) {
      product.quantity += quantity;
      console.log(`Producto actualizado: ${JSON.stringify(product)}`);
    } else {
      const newProduct = { productId: pid, quantity };
      cart.products.push(newProduct);
      console.log(`Producto agregado: ${JSON.stringify(newProduct)}`);
    }

    try {
      await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
      console.log('Carrito actualizado después de agregar producto:', cart);
    } catch (error) {
      console.error('Error al actualizar el archivo de carritos:', error);
      throw new Error('No se pudo actualizar el carrito.');
    }

    return cart;
  }
}

export default CartManager;
