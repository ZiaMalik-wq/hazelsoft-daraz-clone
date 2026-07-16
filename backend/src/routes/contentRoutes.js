const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

router.get('/banners', contentController.getBanners);
router.get('/sections', contentController.getSections);

module.exports = router;