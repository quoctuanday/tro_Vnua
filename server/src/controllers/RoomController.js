const Room = require('../models/Room');
const Category = require('../models/Category');

class RoomController {
    //For personal use only
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
        const childIds = req.body.data.childCateId;
        const room = new Room(data);
        room.save()
            .then((room) => {
                console.log('Post room created successfully');
                if (childIds && childIds.length > 0) {
                    return Category.updateMany(
                        { 'child._id': { $in: childIds } },
                        { $push: { 'child.$.roomId': room._id } }
                    );
                }
            })
            .then(() => {
                res.status(200).json({
                    message: 'Room created and categories updated successfully',
                });
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

    updateRoomPersonal(req, res, next) {
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
        const childIds = req.body.data.childCateId;
        const roomId = data._id;
        Room.findByIdAndUpdate(data._id, data)
            .then(() => {
                //Tìm child categories có chứa roomId
                return Category.find({ 'child.roomId': roomId });
            })
            .then((categories) => {
                const updatePromises = [];

                categories.forEach((category) => {
                    category.child.forEach((child) => {
                        if (child.roomId.includes(roomId)) {
                            if (!childIds.includes(child._id.toString())) {
                                // Nếu childId không có trong danh sách mới, xóa roomId
                                child.roomId = child.roomId.filter(
                                    (id) => id.toString() !== roomId.toString()
                                );
                            }
                        }
                    });
                    updatePromises.push(category.save());
                });

                // Thêm roomId vào childId mới nếu chưa tồn tại
                childIds.forEach((childId) => {
                    updatePromises.push(
                        Category.findOneAndUpdate(
                            { 'child._id': childId },
                            {
                                $addToSet: { 'child.$.roomId': roomId },
                            }
                        )
                    );
                });

                return Promise.all(updatePromises);
            })
            .then(() => {
                res.status(200).json({ message: 'Room updated successfully' });
            })
            .catch((error) => {
                res.status(500).json({ message: 'Internal Server Error' });
                console.log('Error update room: ', error);
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
        Room.findWithDeleted({ userId: userId, deleted: true })
            .then((rooms) => {
                console.log(rooms);
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
    restoreRoomPersonal(req, res, next) {
        const userId = req.user.userId;
        const roomId = req.params.roomId;
        Room.restore({ _id: roomId, userId: userId })
            .then(() => {
                console.log('Restore room ok!');
                res.status(200).json({ message: 'Room has been restore' });
            })
            .catch((error) => {
                console.log('Error restore room', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    forceDeleteRoomPersonal(req, res, next) {
        const roomId = req.params.roomId;
        Room.deleteOne({ _id: roomId })
            .then(() => {
                res.status(200).json({
                    message: 'Room has been force deleted ',
                });
            })
            .catch((error) => {
                console.log('error force delete: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    getAllRooms(req, res) {
        Room.find()
            .populate('userId', 'userName')
            .then((rooms) => {
                if (!rooms) res.status(404).json({ error: 'Rooms not found' });
                const formattedRooms = rooms.map((room) => {
                    const { userId, ...rest } = room.toObject();
                    return {
                        ...rest,
                        userId: userId?._id || null,
                        userName: userId?.userName || null,
                    };
                });
                res.status(200).json({ message: 'List room', formattedRooms });
            })
            .catch((error) => {
                console.log('Get all rooms error: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    update(req, res) {
        const roomId = req.params.roomId;
        const data = req.body.data;
        Room.findByIdAndUpdate(roomId, data)
            .then((room) => {
                if (!room) res.status(404).json({ message: 'Room not found' });
                res.status(200).json({ message: 'Updated room successfully' });
            })
            .catch((error) => {
                console.log('Update room error: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
}
module.exports = new RoomController();
