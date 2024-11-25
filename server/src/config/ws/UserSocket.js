const mongoose = require('mongoose');
const User = require('../../models/User');

function userSocket(io) {
    const changeStream = User.watch();

    changeStream.on('change', (change) => {
        let eventType;
        let updateData = {};

        switch (change.operationType) {
            case 'insert':
                eventType = 'create';
                updateData = change.fullDocument;
                console.log('user created');

                break;
            case 'update':
                eventType = 'update';
                updateData = {
                    _id: change.documentKey._id,
                    updatedFields: change.updateDescription.updatedFields,
                };
                console.log('user updated');
                break;
            case 'delete':
                eventType = 'delete';
                updateData = { _id: change.documentKey._id };
                console.log('user deleted');

                break;
            default:
                console.log('Unhandled change type:', change.operationType);
                return;
        }

        io.emit('user-update', { event: eventType, data: updateData });
    });

    changeStream.on('error', (err) => {
        console.error('ChangeStream error:', err);
    });
}

module.exports = userSocket;
