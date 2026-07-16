const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.get('/brands', storeController.getBrands);
router.get('/sellers', storeController.getSellers);
router.get('/delivery-methods', storeController.getDeliveryMethods);

module.exports = router;