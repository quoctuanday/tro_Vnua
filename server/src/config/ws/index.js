const WebSocket = require('ws');
const roomSocket = require('./UserSocket');
const userSocket = require('./RoomSocket');
const { CLIENT_PORT } = require('../env');

const { Server } = require('socket.io');
const newsSocket = require('./NewsSocket');

function configureWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: `http://localhost:${CLIENT_PORT}`,
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type'],
            credentials: true,
        },
    });

    console.log('WebSocket server đã khởi động');

    roomSocket(io);
    userSocket(io);
    newsSocket(io);

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('Hi server', () => {
            console.log('Received Hi server');
            socket.emit('message', 'Hello from the server');
        });
        socket.on('send_message', (message) => {
            console.log('Received message:', message);
            io.emit('recieve_message', `Server received: ${message}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
}

module.exports = configureWebSocket;
