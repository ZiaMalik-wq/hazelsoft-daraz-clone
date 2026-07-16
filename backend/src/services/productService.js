const { readJsonFile } = require('../utils/fileReader');

class ProductService {
    async getProducts() {
        return readJsonFile('products-list.json');
    }
    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(p => p.id == id);
    }
}

module.exports = new ProductService();