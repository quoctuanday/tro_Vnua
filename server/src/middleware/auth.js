const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log(req.headers.authorization, 'authen middle');
    const token = authHeader && authHeader.split(' ')[1];
    // console.log('TOKEN: ', token, ' this is token');
    if (!token) {
        return res
            .status(401)
            .json({ error: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Invalid token' });
        }
        req.user = user;
        next();
    });
};
module.exports = authenticateToken;
