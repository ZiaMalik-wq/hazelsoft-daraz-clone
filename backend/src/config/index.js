const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATA_DIR: path.resolve(__dirname, '../../', process.env.DATA_DIR || './data'),
    FRONTEND_PATH: path.resolve(__dirname, '../../', process.env.FRONTEND_PATH || '../frontend')
};
