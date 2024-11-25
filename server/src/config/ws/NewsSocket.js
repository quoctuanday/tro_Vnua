const mongoose = require('mongoose');
const News = require('../../models/News');

function newsSocket(io) {
    const changeStream = News.watch();

    changeStream.on('change', (change) => {
        let eventType;
        let updateData = {};

        switch (change.operationType) {
            case 'insert':
                eventType = 'create';
                updateData = change.fullDocument;
                console.log('news created');

                break;
            case 'update':
                eventType = 'update';
                updateData = {
                    _id: change.documentKey._id,
                    updatedFields: change.updateDescription.updatedFields,
                };
                console.log('news updated');
                break;
            case 'delete':
                eventType = 'delete';
                updateData = { _id: change.documentKey._id };
                console.log('news deleted');

                break;
            default:
                console.log('Unhandled change type:', change.operationType);
                return;
        }

        io.emit('news-update', { event: eventType, data: updateData });
    });

    changeStream.on('error', (err) => {
        console.error('ChangeStream error:', err);
    });
}

module.exports = newsSocket;
