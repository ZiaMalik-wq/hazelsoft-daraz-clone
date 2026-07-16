const contentService = require('../services/contentService');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

class ContentController {
    async getBanners(req, res) {
        try {
            sendSuccess(res, await contentService.getBanners());
        } catch (error) {
            sendError(res, 'Failed to fetch banners');
        }
    }
    async getSections(req, res) {
        try {
            sendSuccess(res, await contentService.getSections());
        } catch (error) {
            sendError(res, 'Failed to fetch sections');
        }
    }
}

module.exports = new ContentController();