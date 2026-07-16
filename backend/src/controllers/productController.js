const productService = require('../services/productService');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

class ProductController {
    async getProducts(req, res) {
        try {
            sendSuccess(res, await productService.getProducts());
        } catch (error) {
            sendError(res, 'Failed to fetch products');
        }
    }
    async getProductDetails(req, res) {
        try {
            const data = await productService.getProductById(req.params.id);
            if (!data) return sendError(res, 'Product not found', 404);
            sendSuccess(res, data);
        } catch (error) {
            sendError(res, 'Failed to fetch product details');
        }
    }
}

module.exports = new ProductController();