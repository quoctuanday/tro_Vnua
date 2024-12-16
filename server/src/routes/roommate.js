const express = require('express');
const router = express.Router();
const roomateController = require('../controllers/RoommateController');
const authenticateToken = require('../middleware/auth');

router.get(
    '/getPersonRoommate',
    authenticateToken,
    roomateController.getPersonRoommate
);
router.post('/createRoommate', authenticateToken, roomateController.create);

module.exports = router;
