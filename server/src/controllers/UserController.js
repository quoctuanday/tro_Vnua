const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env/index');

class UserController {
    createUser(req, res, next) {
        const { passwordConfirm, ...data } = req.body.data;
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
                const token = jwt.sign(
                    { userId: user._id, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '1h' }
                );
                console.log(token);
                res.status(200).json({ message: 'Login successful', token });
            });
        } catch (err) {}
    }
}
module.exports = new UserController();
