const Room = require('../models/Room');

class RoomController {
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
                console.log('Get room person successfully');
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
}
module.exports = new RoomController();
