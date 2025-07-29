import fs from 'fs';

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
  }

  async getProducts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(product => product.id === id);
  }

  async addProduct(product) {
    const products = await this.getProducts();
    product.id = products.length ? products[products.length - 1].id + 1 : 1;
    products.push(product);
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return product;
  }

  async updateProduct(id, updatedFields) {
    const products = await this.getProducts();
    const productIndex = products.findIndex(product => product.id === id);

    if (productIndex === -1) {
      return null;
    }

    const existingProduct = products[productIndex];
    products[productIndex] = {
      ...existingProduct,
      ...updatedFields,
      id: existingProduct.id
    };

    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    return products[productIndex];
  }

  async deleteProduct(productId) {
    const products = await this.getProducts();
    const filteredProducts = products.filter(product => product.id !== productId);
    await fs.promises.writeFile(this.path, JSON.stringify(filteredProducts, null, 2));
    return true;
  }
}

export default ProductManager;