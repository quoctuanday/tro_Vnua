const userRouter = require('./user');
const roomRouter = require('./room');
function route(app) {
    app.use('/api/users', userRouter);
    app.use('/api/rooms', roomRouter);
}

module.exports = route;
