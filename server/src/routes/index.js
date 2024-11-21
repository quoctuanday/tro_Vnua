const userRouter = require('./user');
const roomRouter = require('./room');
const newsRouter = require('./news');
function route(app) {
    app.use('/api/users', userRouter);
    app.use('/api/news', newsRouter);
    app.use('/api/rooms', roomRouter);
}

module.exports = route;
