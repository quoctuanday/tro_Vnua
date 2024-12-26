const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_SECRET,
} = require('../config/env/index');

class UserController {
    createUser(req, res) {
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

    async login(req, res) {
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
                        .status(402)
                        .json({ message: 'Password is wrong' });
                //create ACCToken and REFToken
                const accessToken = jwt.sign(
                    { userId: user._id, role: user.role },
                    ACCESS_TOKEN_SECRET,
                    { expiresIn: '5h' }
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

    logOut(req, res) {
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Log out successfully' });
    }

    async forgotPassword(req, res) {
        const email = req.body.data.email;

        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: 'sunny.emmerich@ethereal.email',
                    pass: '4rnr54CG52jTJJgj8b',
                },
            });
            console.log(email);

            const user = await User.findOne({ email: email });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const userId = user._id;
            const info = await transporter.sendMail({
                from: '"Admin web tro_Vnua 👻" <admin@ethereal.email>',
                to: email,
                subject: 'Reset Password ✔',
                text: 'Please click the link below to reset your password.',
                html: `
                    <b>Please click the link below to reset your password.</b><br>
                    <a href="http://localhost:3000/forgotPass/${userId}">http://localhost:3000/forgotPass/${userId}</a>
                `,
            });

            console.log('Message sent: %s', info.messageId);

            res.status(200).json({ message: 'Reset email sent successfully!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    resetPass(req, res) {
        const userId = req.params.userId;
        let { passwordConfirm, ...data } = req.body.data;
        const pass = data.password;
        bcrypt.hash(pass, 10).then((hashedPass) => {
            data.password = hashedPass;
            console.log(data);
            User.findByIdAndUpdate(userId, data)
                .then((user) => {
                    if (!user) return;
                    res.status(200).json({
                        message: 'Reset password successfully',
                    });
                })
                .catch((err) => {
                    console.log('Reset password failed: %s', err);
                    return res
                        .status(500)
                        .json({ error: 'Internal Server Error' });
                });
        });
    }
    refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;
        console.log('refresh token', refreshToken);
        if (!refreshToken) return res.status(401);
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, user) => {
                if (err) {
                    console.log('refresh token error', err);
                    return res.status(403);
                }

                //Create new access token
                const newAccessToken = jwt.sign(
                    { userId: user.userId, role: user.role },
                    ACCESS_TOKEN_SECRET,
                    { expiresIn: '5h' }
                );
                res.json({ accessToken: newAccessToken });
            }
        );
    }

    getUser(req, res) {
        const userId = req.user.userId;
        console.log(req.user);
        console.log(userId);
        User.findById(userId)
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                return res.status(200).json(user);
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    updateProfile(req, res) {
        const userId = req.user.userId;
        const data = req.body.data;
        console.log(data);
        User.findByIdAndUpdate(userId, data)
            .then((user) => {
                if (!user) res.status(404).json({ error: 'User not found' });
                res.status(200).json({ message: 'Profile updated' });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server error' });
            });
    }

    //All User
    getAllUsers(req, res) {
        User.find()
            .then((users) => {
                if (!users) res.status(404).json({ error: 'User not found' });
                res.status(200).json({ message: 'List all user', users });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server error' });
            });
    }
    updateUser(req, res) {
        const userId = req.params.userId;
        const data = req.body.data;
        User.findByIdAndUpdate(userId, data)
            .then((user) => {
                if (!user) res.status(404).json({ error: 'User not found' });
                res.status(200).json({ message: 'User updated successfully' });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server error' });
            });
    }

    countPosts(req, res) {}
}
module.exports = new UserController();
