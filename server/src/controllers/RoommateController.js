const Roommate = require('../models/Roommate');

class RoommateController {
    create(req, res, next) {
        const data = req.body.data.data;
        data.userId = req.body.data.userId;
        data.images = req.body.data.successfulUploads;
        data.urlSaveImages = req.body.data.folderPath;
        const location = data.location;
        delete data.location;
        data.location = {
            name: location,
            coordinates: req.body.data.coords,
        };
        const room = new Roommate(data);
        room.save()
            .then((room) => {
                console.log('Post roommate created successfully');
                res.status(200).json({
                    message: 'Roommate created successfully',
                });
            })

            .catch((error) => {
                console.log('Roommate created error:', error);
                res.status(500).json({
                    message: 'Internal Server Error',
                    error,
                });
            });
    }
    getPersonRoommate(req, res, next) {
        const userId = req.user.userId;
        Roommate.find({ userId: userId })
            .then((roommates) => {
                res.status(200).json({
                    message: 'get roommate person successfully',
                    roommates,
                });
            })
            .catch((error) => {
                console.log('Error getting roommate person', error);
                res.status(500).json({
                    message: 'Internal Server Error',
                    error,
                });
            });
    }
}
module.exports = new RoommateController();
