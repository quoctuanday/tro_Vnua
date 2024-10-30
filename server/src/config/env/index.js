const dotEnv = require('dotenv');
dotEnv.config();

module.exports = {
    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL,
    CLIENT_PORT: process.env.CLIENT_PORT,
};
