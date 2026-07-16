const express = require('express');
const router = express.Router();

router.use('/', require('./productRoutes'));
router.use('/', require('./categoryRoutes'));
router.use('/', require('./contentRoutes'));
router.use('/', require('./userRoutes'));
router.use('/', require('./storeRoutes'));

module.exports = router;