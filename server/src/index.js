const express = require('express');
const cors = require('cors');
const http = require('http');
const { PORT, CLIENT_PORT } = require('./config/env');
const db = require('./config/db');
const route = require('./routes');
const cookieParser = require('cookie-parser');
const configureWebSocket = require('./config/ws/index');
const { Server } = require('socket.io');

const app = express();
db.connect();

const server = http.createServer(app);

app.use(cookieParser());

//CORS
app.use(
    cors({
        origin: `http://localhost:${CLIENT_PORT}`,
        credentials: true,
    })
);

app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());

//socket.io
configureWebSocket(server);

route(app);

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
