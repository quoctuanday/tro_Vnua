const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authenticateToken = require('../middleware/auth');
const authorization = require('../middleware/author');

//All user
router.put(
    '/updatedUser/:userId',
    authenticateToken,
    authorization(['admin']),
    userController.updateUser
);
router.get(
    '/getAllUsers',
    authenticateToken,
    authorization(['admin']),
    userController.getAllUsers
);
//Personal user
router.put('/updateProfile', authenticateToken, userController.updateProfile);
router.get('/getUser', authenticateToken, userController.getUser);
router.post('/refreshToken', userController.refreshToken);
router.post('/forgotPassword', userController.forgotPassword);
router.put('/resetPassword/:userId', userController.resetPass);
router.get('/logout', userController.logOut);
router.post('/login', userController.login);
router.post('/create', userController.createUser);

module.exports = router;
