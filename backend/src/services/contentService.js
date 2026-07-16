const { readJsonFile } = require('../utils/fileReader');

class ContentService {
    async getBanners() {
        return readJsonFile('banners.json');
    }
    async getSections() {
        return readJsonFile('sections.json');
    }
}

module.exports = new ContentService();