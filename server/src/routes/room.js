const express = require('express');
const router = express.Router();
const roomController = require('../controllers/RoomController');
const authenticateToken = require('../middleware/auth');

router.get(
    '/getRoomListPerson',
    authenticateToken,
    roomController.getPersonRoom
);
router.post('/createRoom', authenticateToken, roomController.create);
module.exports = router;
