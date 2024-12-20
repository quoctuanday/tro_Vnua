const dotEnv = require('dotenv');
dotEnv.config();

module.exports = {
    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL,
    CLIENT_PORT: process.env.CLIENT_PORT,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    vnp_TmnCode: process.env.vnp_TmnCode,
    vnp_HashSecret: process.env.vnp_HashSecret,
    vnp_Url: process.env.vnp_Url,
    vnp_Api: process.env.vnp_Api,
    vnp_ReturnUrlRoom: process.env.vnp_ReturnUrlRoom,
    vnp_ReturnUrlRoommate: process.env.vnp_ReturnUrlRoommate,
};
