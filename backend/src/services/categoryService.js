const { readJsonFile } = require('../utils/fileReader');

class CategoryService {
    async getNavCategories() {
        return readJsonFile('nav-categories.json');
    }
    async getCategories() {
        return readJsonFile('categories.json');
    }
}

module.exports = new CategoryService();