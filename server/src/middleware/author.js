const jwt = require('jsonwebtoken');

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res
            .status(403)
            .json({ message: 'Truy cập bị từ chối. Bạn không phải là admin.' });
    }
    next();
};

module.exports = adminOnly;
