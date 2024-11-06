const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_SECRET,
} = require('../config/env/index');

class UserController {
    createUser(req, res, next) {
        let { passwordConfirm, ...data } = req.body.data;
        User.findOne({ email: data.email }).then((user) => {
            if (!user) {
                const pass = data.password;
                bcrypt.hash(pass, 10).then((hashedPass) => {
                    data.password = hashedPass;
                    console.log(data);

                    const user = new User(data);
                    user.save()
                        .then((user) => {
                            console.log('User created successfully');
                            res.status(201).json({
                                message: 'User created successfully',
                                user,
                            });
                        })
                        .catch((error) => {
                            console.log('User created error: ', error);
                            res.status(500).json({
                                message: 'Internal server error',
                                error,
                            });
                        });
                });
            } else {
                console.log('User already exists');
                res.status(409).json({ message: 'User already exists' });
            }
        });
    }

    async login(req, res, next) {
        try {
            const data = req.body.data;
            User.findOne({ email: data.email }).then(async (user) => {
                if (!user)
                    return res.status(401).json({ message: 'User not found' });
                const passwordMatch = await bcrypt.compare(
                    data.password,
                    user.password
                );
                if (!passwordMatch)
                    return res
                        .status(401)
                        .json({ message: 'Password is wrong' });
                //create ACCToken and REFToken
                const accessToken = jwt.sign(
                    { userId: user._id, role: user.role },
                    ACCESS_TOKEN_SECRET,
                    { expiresIn: '1h' }
                );
                const refreshToken = jwt.sign(
                    { userId: user._id, role: user.role },
                    REFRESH_TOKEN_SECRET,
                    { expiresIn: '24h' }
                );
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000,
                });
                res.status(200).json({
                    message: 'Login successful',
                    accessToken,
                });
            });
        } catch (err) {
            console.error(err);
        }
    }

    logOut(req, res, next) {
        const refreshToken = req.cookies.refreshToken;
        console.log(refreshToken);
        if (refreshToken) {
            res.clearCookie('refreshToken')
                .status(200)
                .json({ message: 'Logout successfully' });
        } else {
            console.log('Logout failed');
        }
    }

    refreshToken(req, res, next) {
        const refreshToken = req.cookies.refreshToken;
        console.log('refresh token', refreshToken);
        if (!refreshToken) return res.status(401);
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, user) => {
                if (err) {
                    return res.status(403);
                }
                //Create new access token
                const newAccessToken = jwt.sign(
                    { userId: user._id, role: user.role },
                    ACCESS_TOKEN_SECRET,
                    { expiresIn: '1h' }
                );
                res.json({ accessToken: newAccessToken });
            }
        );
    }

    getUser(req, res, next) {
        const userId = req.user.userId;
        User.findById(userId).then((user) => {
            if (!user) res.status(404).json({ error: 'User not found' });
            res.status(200).json(user);
        });
    }

    updateProfile(req, res, next) {
        const userId = req.user.userId;
        User.findByIdAndUpdate(userId, { image: req.body.data.image })
            .then((user) => {
                if (!user) res.status(404).json({ error: 'User not found' });
                res.status(200).json({ message: 'Profile updated' });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server error' });
            });
    }
}
module.exports = new UserController();
