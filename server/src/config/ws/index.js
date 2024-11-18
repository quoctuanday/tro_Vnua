const WebSocket = require('ws');
const roomSocket = require('./RoomSocket');
const userSocket = require('./UserSocket');

function configureWebSocket() {
    const wss = new WebSocket.Server({
        port: 8000,
        clientTracking: true,
        maxPayload: 100000,
    });

    console.log('WebSocket server đã khởi động');

    roomSocket(wss);
    userSocket(wss);

    wss.on('connection', (ws) => {
        console.log('Client kết nối WebSocket');

        ws.on('message', (message) => {
            console.log('Client gửi tin nhắn:', message);
        });

        ws.on('close', () => {
            console.log('Client ngắt kết nối');
        });
    });

    return wss;
}

module.exports = configureWebSocket;
