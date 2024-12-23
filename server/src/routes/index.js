const userRouter = require('./user');
const roomRouter = require('./room');
const newsRouter = require('./news');
const categoryRouter = require('./category');
const roommateRouter = require('./roommate');
const commentRouter = require('./comment');
const paymentRouter = require('./payment');
const adminRouter = require('./admin');

function route(app) {
    app.use('/api/admin', adminRouter);
    app.use('/api/payment', paymentRouter);
    app.use('/api/comments', commentRouter);
    app.use('/api/roommate', roommateRouter);
    app.use('/api/category', categoryRouter);
    app.use('/api/users', userRouter);
    app.use('/api/news', newsRouter);
    app.use('/api/rooms', roomRouter);
}

module.exports = route;
