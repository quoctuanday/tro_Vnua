const WebSocket = require('ws');
const roomSocket = require('./UserSocket');
const roommateSocket = require('./RoommateSocket');
const userSocket = require('./RoomSocket');
const categorySocket = require('./CategorySocket');
const commentSocket = require('./CommentSocket');
const favouriteRoomsSocket = require('./FavouriteRooms');
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

    favouriteRoomsSocket(io);
    categorySocket(io);
    roomSocket(io);
    roommateSocket(io);
    userSocket(io);
    newsSocket(io);
    commentSocket(io);

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
