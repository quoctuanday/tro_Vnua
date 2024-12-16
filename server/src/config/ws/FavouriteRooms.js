const mongoose = require('mongoose');
const RoomFavourite = require('../../models/FavouriteRoom');

function roomFavouriteSocket(io) {
    const changeStream = RoomFavourite.watch();

    changeStream.on('change', (change) => {
        let eventType;
        let updateData = {};

        switch (change.operationType) {
            case 'insert':
                eventType = 'create';
                updateData = change.fullDocument;
                console.log('roomFavourite created');

                break;
            case 'update':
                eventType = 'update';
                updateData = {
                    _id: change.documentKey._id,
                    updatedFields: change.updateDescription.updatedFields,
                };
                console.log('roomFavourite updated');
                break;
            case 'delete':
                eventType = 'delete';
                updateData = { _id: change.documentKey._id };
                console.log('roomFavourite deleted');

                break;
            default:
                console.log('Unhandled change type:', change.operationType);
                return;
        }

        io.emit('roomFavourite-update', { event: eventType, data: updateData });
    });

    changeStream.on('error', (err) => {
        console.error('ChangeStream error:', err);
    });
}

module.exports = roomFavouriteSocket;
