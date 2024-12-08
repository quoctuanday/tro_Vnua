const userRouter = require('./user');
const roomRouter = require('./room');
const newsRouter = require('./news');
const categoryRouter = require('./category');
const commentRouter = require('./comment');

function route(app) {
    app.use('/api/comments', commentRouter);
    app.use('/api/category', categoryRouter);
    app.use('/api/users', userRouter);
    app.use('/api/news', newsRouter);
    app.use('/api/rooms', roomRouter);
}

module.exports = route;
