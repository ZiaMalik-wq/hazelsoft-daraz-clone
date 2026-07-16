const storeService = require('../services/storeService');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

class StoreController {
    async getBrands(req, res) {
        try {
            sendSuccess(res, await storeService.getBrands());
        } catch (error) {
            sendError(res, 'Failed to fetch brands');
        }
    }
    async getSellers(req, res) {
        try {
            sendSuccess(res, await storeService.getSellers());
        } catch (error) {
            sendError(res, 'Failed to fetch sellers');
        }
    }
    async getDeliveryMethods(req, res) {
        try {
            sendSuccess(res, await storeService.getDeliveryMethods());
        } catch (error) {
            sendError(res, 'Failed to fetch delivery methods');
        }
    }
}

module.exports = new StoreController();