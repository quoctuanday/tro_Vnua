const userRouter = require('./user');
function route(app) {
    app.use('/api/users', userRouter);
}

module.exports = route;
