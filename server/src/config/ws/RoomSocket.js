const WebSocket = require('ws');
const mongoose = require('mongoose');
const Room = require('../../models/Room');

function roomSocket(wss) {
    Room.watchRoomChanges = (updateData) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(updateData));
            }
        });
    };

    Room.schema.pre('save', function (next) {
        this.isNewDocument = this.isNew;
        next();
    });

    Room.schema.post('save', function (doc) {
        const eventType = doc.isNewDocument ? 'create' : 'update';
        Room.watchRoomChanges({ event: eventType, data: doc });
    });

    Room.schema.post('remove', function (doc) {
        Room.watchRoomChanges({ event: 'delete', data: doc });
    });
}

module.exports = roomSocket;
