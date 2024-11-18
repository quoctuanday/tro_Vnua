const Room = require('../models/Room');

class RoomController {
    //For personal use only
    create(req, res, next) {
        console.log(req.body.data);
        const data = req.body.data.data;
        data.userId = req.body.data.userId;
        data.images = req.body.data.successfulUploads;
        data.urlSaveImages = req.body.data.folderPath;
        const room = new Room(data);
        room.save()
            .then((room) => {
                console.log('Post room created successfully');
                res.status(200).json({ message: 'Room created successfully' });
            })
            .catch((error) => {
                console.log('Room created error:', error);
                res.status(500).json({
                    message: 'Internal Server Error',
                    error,
                });
            });
    }

    getPersonRoom(req, res, next) {
        const userId = req.user.userId;
        Room.find({ userId: userId })
            .then((rooms) => {
                // console.log('Get room person successfully');
                res.status(200).json({
                    message: 'get room person successfully',
                    rooms,
                });
            })
            .catch((error) => {
                console.log('Error getting room person', error);
                res.status(500).json({
                    message: 'Internal Server Error',
                    error,
                });
            });
    }

    deleteRoomPersonal(req, res, next) {
        const roomId = req.params.roomId;
        const userId = req.user.userId;
        Room.delete({ _id: roomId, userId: userId })
            .then(() => {
                console.log('Delete room Ok!');
                res.status(200).json({ message: 'Room deleted successfully' });
            })
            .catch((error) => {
                console.log('error delete room: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    getDeleteRoom(req, res, next) {
        const userId = req.user.userId;
        Room.find({ userId: userId, deleted: true })
            .then((rooms) => {
                if (rooms) {
                    res.status(200).json({
                        message: 'List rooms has been deleted',
                        rooms,
                    });
                }
            })
            .catch((error) => {
                console.log('error list rooms delete: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
}
module.exports = new RoomController();