const express = require('express');
const router = express.Router();
const roomController = require('../controllers/RoomController');
const authenticateToken = require('../middleware/auth');
const authorization = require('../middleware/author');

//For all user
router.get('/getFavourites', authenticateToken, roomController.getFavourites);
router.delete(
    '/deleteFavourite/:roomId',
    authenticateToken,
    roomController.deleteFavourite
);
router.post(
    '/createFavourite/:roomId',
    authenticateToken,
    roomController.createFavourite
);
router.put(
    '/update/:roomId',
    authenticateToken,
    authorization(['admin', 'moderator']),
    roomController.update
);
router.put(
    '/refuse/:roomId',
    authenticateToken,
    authorization(['admin', 'moderator']),
    roomController.refuse
);
router.get('/getAllRooms', roomController.getAllRooms);
//For personal user
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
