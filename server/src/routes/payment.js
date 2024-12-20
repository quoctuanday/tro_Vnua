const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

router.put('/vnpay/callback', PaymentController.callbackVnpay);
router.post('/vnpay/create', PaymentController.createPayment);

module.exports = router;
