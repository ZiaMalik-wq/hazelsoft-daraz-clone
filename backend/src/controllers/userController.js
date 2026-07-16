const userService = require('../services/userService');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

class UserController {
    async getUsers(req, res) {
        try {
            sendSuccess(res, await userService.getUsers());
        } catch (error) {
            sendError(res, 'Failed to fetch users');
        }
    }
}

module.exports = new UserController();