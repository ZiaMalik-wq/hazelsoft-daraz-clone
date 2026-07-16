const { readJsonFile } = require('../utils/fileReader');

class StoreService {
    async getBrands() {
        return readJsonFile('brands.json');
    }
    async getSellers() {
        return readJsonFile('sellers.json');
    }
    async getDeliveryMethods() {
        return readJsonFile('delivery-methods.json');
    }
}

module.exports = new StoreService();