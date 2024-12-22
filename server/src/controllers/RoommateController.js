const Category = require('../models/Category');
const FavouriteRoom = require('../models/FavouriteRoom');
const Roommate = require('../models/Roommate');

class RoommateController {
    create(req, res, next) {
        const data = req.body.data.data;
        data.userId = req.body.data.userId;
        data.images = req.body.data.successfulUploads;
        data.urlSaveImages = req.body.data.folderPath;
        const location = data.location;
        const gender = data.gender;
        const min = data.min;
        const max = data.max;
        const other = data.other;
        delete data.location;
        delete data.gender;
        delete data.min;
        delete data.max;
        delete data.other;
        data.require = {
            gender: gender,
            age: {
                min: min,
                max: max,
            },
            other: other,
        };
        data.location = {
            name: location,
            coordinates: req.body.data.coords,
        };
        const childIds = req.body.data.childCateId;
        const room = new Roommate(data);
        room.save()
            .then((room) => {
                console.log('Post roommate created successfully');
                if (childIds && childIds.length > 0) {
                    return Category.updateMany(
                        { 'child._id': { $in: childIds } },
                        { $push: { 'child.$.roommateId': room._id } }
                    );
                }
            })
            .then(() => {
                res.status(200).json({
                    message:
                        'Roommate created and categories updated successfully',
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

    deleteRoommatePersonal(req, res, next) {
        const roomId = req.params.roomId;
        const userId = req.user.userId;
        Roommate.delete({ _id: roomId, userId: userId })
            .then(() => {
                console.log('Delete room Ok!');
                res.status(200).json({ message: 'Room deleted successfully' });
            })
            .catch((error) => {
                console.log('error delete room: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    getDeleteRoommate(req, res, next) {
        const userId = req.user.userId;
        Roommate.findWithDeleted({ userId: userId, deleted: true })
            .then((rooms) => {
                console.log(rooms);
                if (rooms) {
                    res.status(200).json({
                        message: 'List Roommate has been deleted',
                        rooms,
                    });
                }
            })
            .catch((error) => {
                console.log('error list Roommate delete: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    restoreRoommatePersonal(req, res, next) {
        const userId = req.user.userId;
        const roomId = req.params.roomId;
        Roommate.restore({ _id: roomId, userId: userId })
            .then(() => {
                console.log('Restore Roommate ok!');
                res.status(200).json({ message: 'Roommate has been restore' });
            })
            .catch((error) => {
                console.log('Error restore Roommate', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    forceDeleteRoommatePersonal(req, res, next) {
        const roomId = req.params.roomId;
        Roommate.deleteOne({ _id: roomId })
            .then(() => {
                res.status(200).json({
                    message: 'Roommate has been force deleted ',
                });
            })
            .catch((error) => {
                console.log('error force delete: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
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
    getFavourites(req, res) {
        const userId = req.user.userId;

        FavouriteRoom.find({ userId })
            .then((favouriteRooms) => {
                if (!favouriteRooms.length) {
                    return res
                        .status(404)
                        .json({ message: 'No favourite rooms found' });
                }

                const roomIds = favouriteRooms.map(
                    (favourite) => favourite.roommateId
                );

                return Roommate.find({ _id: { $in: roomIds } })
                    .then((rooms) =>
                        res.status(200).json({
                            message: 'List of favourite rooms',
                            roomIds,
                            rooms,
                        })
                    )
                    .catch((err) =>
                        res.status(500).json({
                            message: 'Error fetching rooms',
                            error: err,
                        })
                    );
            })
            .catch((err) =>
                res
                    .status(500)
                    .json({ message: 'Error fetching favourites', error: err })
            );
    }

    createFavourite(req, res) {
        const userId = req.user.userId;
        const roomId = req.params.roomId;
        const data = {};
        data.roommateId = roomId;
        data.userId = userId;
        const favourite = new FavouriteRoom(data);
        favourite
            .save()
            .then((favourite) => {
                if (!favourite)
                    res.status(400).json({
                        message: 'Favourite do not created',
                    });
                res.status(200).json({
                    message: 'Favourite created successfully',
                });
            })
            .catch((error) => {
                console.log('create favourite error: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    deleteFavourite(req, res) {
        const userId = req.user.userId;
        const roomId = req.params.roomId;
        FavouriteRoom.deleteOne({ roommateId: roomId, userId: userId })
            .then(() => {
                res.status(200).json({
                    message: 'room favourite has been deleted ',
                });
            })
            .catch((error) => {
                console.log('error force delete: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
}
module.exports = new RoommateController();
