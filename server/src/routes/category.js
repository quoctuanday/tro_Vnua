const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategoryController');
const authenticateToken = require('../middleware/auth');
const authorization = require('../middleware/author');

router.delete(
    '/delete/:categoryId',
    authenticateToken,
    authorization(['admin']),
    categoryController.delete
);
router.put(
    '/update/:categoryId',
    authenticateToken,
    authorization(['admin']),
    categoryController.update
);
router.get('/get', categoryController.get);
router.post(
    '/create',
    authenticateToken,
    authorization(['admin']),
    categoryController.create
);

module.exports = router;
