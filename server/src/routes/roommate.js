const express = require('express');
const router = express.Router();
const roomateController = require('../controllers/RoommateController');
const authenticateToken = require('../middleware/auth');
const authorization = require('../middleware/author');

router.put(
    '/update/:roommateId',
    authenticateToken,
    authorization(['admin', 'moderator']),
    roomateController.update
);
router.get(
    '/getAllRoommates',
    authenticateToken,
    roomateController.getAllRoommates
);
router.put(
    '/updateRoommatePersonal',
    authenticateToken,
    roomateController.updateRoommatePersonal
);
router.get(
    '/getPersonRoommate',
    authenticateToken,
    roomateController.getPersonRoommate
);
router.post('/createRoommate', authenticateToken, roomateController.create);

module.exports = router;
