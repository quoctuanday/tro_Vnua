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
    updateRoommatePersonal(req, res, next) {
        console.log(req.body.data._id);
        const data = req.body.data.data;
        data.userId = req.body.data.userId;
        data.images = req.body.data.uploadURL;
        const location = data.location;
        delete data.location;
        data.location = {
            name: location,
            coordinates: req.body.data.coords,
        };
        Roommate.findByIdAndUpdate(data._id, data)
            .then(() => {
                res.status(200).json({
                    message: 'Roommate updated successfully',
                });
            })
            .catch((error) => {
                res.status(500).json({ message: 'Internal Server Error' });
                console.log('Error update roommate: ', error);
            });
    }

    getAllRoommates(req, res) {
        Roommate.find()
            .populate('userId', 'userName')
            .then((roommates) => {
                if (!roommates)
                    res.status(404).json({ error: 'Roommates not found' });
                const formattedRoommates = roommates.map((roommate) => {
                    const { userId, ...rest } = roommate.toObject();
                    return {
                        ...rest,
                        userId: userId?._id || null,
                        userName: userId?.userName || null,
                    };
                });
                res.status(200).json({
                    message: 'List roommate',
                    formattedRoommates,
                });
            })
            .catch((error) => {
                console.log('Get all roommates error: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    update(req, res) {
        const roommateId = req.params.roommateId;
        const data = req.body.data;
        Roommate.findByIdAndUpdate(roommateId, data)
            .then((roommate) => {
                if (!roommate)
                    res.status(404).json({ message: 'Roommate not found' });
                res.status(200).json({
                    message: 'Updated roommate successfully',
                });
            })
            .catch((error) => {
                console.log('Update roommate error: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
}
module.exports = new RoommateController();
