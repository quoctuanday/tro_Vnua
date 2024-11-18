const express = require('express');
const cors = require('cors');
const http = require('http');
const { PORT, CLIENT_PORT } = require('./config/env');
const db = require('./config/db');
const route = require('./routes');
const cookieParser = require('cookie-parser');
const configureWebSocket = require('./config/ws/index');

const app = express();
db.connect();
configureWebSocket();

app.use(cookieParser());

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

route(app);

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
