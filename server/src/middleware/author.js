const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;

        if (!userRole) {
            return res
                .status(401)
                .json({ message: 'Không xác thực được vai trò người dùng.' });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message:
                    'Truy cập bị từ chối. Bạn không có quyền thực hiện thao tác này.',
            });
        }
        console.log('Ban duoc cho phep', userRole);

        next();
    };
};

module.exports = authorizeRole;
