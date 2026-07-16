const { readJsonFile } = require('../utils/fileReader');

class UserService {
    async getUsers() {
        return readJsonFile('users.json');
    }
}

module.exports = new UserService();