const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

const DATA_DIR = config.DATA_DIR;

exports.readJsonFile = async (filename) => {
    try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading :", error);
        throw error;
    }
};
