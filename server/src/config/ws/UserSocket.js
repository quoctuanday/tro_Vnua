const WebSocket = require('ws');
const mongoose = require('mongoose');
const User = require('../../models/User');

function userSocketSocket(wss) {
    User.watchUserChanges = (updateData) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(updateData));
            }
        });
    };

    User.schema.post('save', function (doc) {
        User.watchUserChanges({ event: 'update', data: doc });
    });

    User.schema.post('remove', function (doc) {
        User.watchUserChanges({ event: 'delete', data: doc });
    });
}

module.exports = userSocketSocket;
