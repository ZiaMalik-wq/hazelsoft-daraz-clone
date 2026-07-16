const categoryService = require('../services/categoryService');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

class CategoryController {
    async getNavCategories(req, res) {
        try {
            sendSuccess(res, await categoryService.getNavCategories());
        } catch (error) {
            sendError(res, 'Failed to fetch nav categories');
        }
    }
    async getCategories(req, res) {
        try {
            sendSuccess(res, await categoryService.getCategories());
        } catch (error) {
            sendError(res, 'Failed to fetch categories');
        }
    }
}

module.exports = new CategoryController();