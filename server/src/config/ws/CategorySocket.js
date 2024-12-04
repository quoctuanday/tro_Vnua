const mongoose = require('mongoose');
const Category = require('../../models/Category');

function categorySocket(io) {
    const changeStream = Category.watch();

    changeStream.on('change', (change) => {
        let eventType;
        let updateData = {};

        switch (change.operationType) {
            case 'insert':
                eventType = 'create';
                updateData = change.fullDocument;
                console.log('category created');

                break;
            case 'update':
                eventType = 'update';
                updateData = {
                    _id: change.documentKey._id,
                    updatedFields: change.updateDescription.updatedFields,
                };
                console.log('category updated');
                break;
            case 'delete':
                eventType = 'delete';
                updateData = { _id: change.documentKey._id };
                console.log('category deleted');

                break;
            default:
                console.log('Unhandled change type:', change.operationType);
                return;
        }

        io.emit('category-update', { event: eventType, data: updateData });
    });

    changeStream.on('error', (err) => {
        console.error('ChangeStream error:', err);
    });
}

module.exports = categorySocket;
