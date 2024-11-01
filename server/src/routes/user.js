const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

router.post('/login', userController.login);
router.post('/create', userController.createUser);

module.exports = router;