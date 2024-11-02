const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authenticateToken = require('../middleware/auth');

router.get('/getUser', authenticateToken, userController.getUser);
router.post('/refreshToken', userController.refreshToken);
router.post('/login', userController.login);
router.post('/create', userController.createUser);

module.exports = router;
