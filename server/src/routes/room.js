const express = require('express');
const router = express.Router();
const roomController = require('../controllers/RoomController');
const authenticateToken = require('../middleware/auth');

router.put(
    '/updateRoomPersonal',
    authenticateToken,
    roomController.updateRoomPersonal
);
router.delete(
    '/forceDeleteRoomPersonal/:roomId',
    authenticateToken,
    roomController.forceDeleteRoomPersonal
);
router.patch(
    '/restoreRoomPersonal/:roomId',
    authenticateToken,
    roomController.restoreRoomPersonal
);
router.get('/getDeleteRoom', authenticateToken, roomController.getDeleteRoom);
router.delete(
    '/deleteRoomPersonal/:roomId',
    authenticateToken,
    roomController.deleteRoomPersonal
);
router.get(
    '/getRoomListPerson',
    authenticateToken,
    roomController.getPersonRoom
);
router.post('/createRoom', authenticateToken, roomController.create);
module.exports = router;
