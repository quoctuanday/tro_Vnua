const express = require('express');
const router = express.Router();
const roomateController = require('../controllers/RoommateController');
const authenticateToken = require('../middleware/auth');
const authorization = require('../middleware/author');

router.get(
    '/getFavourites',
    authenticateToken,
    roomateController.getFavourites
);
router.delete(
    '/deleteFavourite/:roomId',
    authenticateToken,
    roomateController.deleteFavourite
);
router.put(
    '/refuse/:roomId',
    authenticateToken,
    authorization(['admin', 'moderator']),
    roomateController.refuse
);
router.post(
    '/createFavourite/:roomId',
    authenticateToken,
    roomateController.createFavourite
);
router.put(
    '/update/:roommateId',
    authenticateToken,
    authorization(['admin', 'moderator']),
    roomateController.update
);
router.get('/getAllRoommates', roomateController.getAllRoommates);

router.delete(
    '/forceDeleteRoomPersonal/:roomId',
    authenticateToken,
    roomateController.forceDeleteRoommatePersonal
);
router.patch(
    '/restoreRoomPersonal/:roomId',
    authenticateToken,
    roomateController.restoreRoommatePersonal
);
router.get(
    '/getDeleteRoom',
    authenticateToken,
    roomateController.getDeleteRoommate
);
router.delete(
    '/deleteRoomPersonal/:roomId',
    authenticateToken,
    roomateController.deleteRoommatePersonal
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
