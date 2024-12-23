const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const authenticateToken = require('../middleware/auth');
const authorization = require('../middleware/author');

router.get('/getRevenue', adminController.showTotalAmounts);
router.get('/getCount', adminController.getTotal);

module.exports = router;
