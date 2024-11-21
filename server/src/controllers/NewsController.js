const News = require('../models/News');

class NewsController {
    create(req, res) {
        const userId = req.user.userId;
        const data = req.body.data;
        data.userId = userId;
        console.log(data);
        const news = new News(data);
        news.save()
            .then(() => {
                res.status(200).json({ message: 'Create News successfully' });
            })
            .catch((error) => {
                console.log('Create news error: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    getNewsPersonal(req, res) {
        const userId = req.user.userId;
        News.find({ userId: userId })
            .then((news) => {
                res.status(200).json({
                    message: 'Get News successfully',
                    news,
                });
            })
            .catch((error) => {
                console.log('Get news error: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    update(req, res) {
        const data = req.body.data.data;
        const newsId = req.body.data.newsId;
        console.log(data, newsId);
        News.findByIdAndUpdate(newsId, data)
            .then((news) => {
                res.status(200).json({ message: 'Update news successfully' });
            })
            .catch((error) => {
                console.log('Error updating news: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    delete(req, res) {
        const newsId = req.params.newsId;
        const userId = req.user.userId;
        News.delete({ _id: newsId, userId: userId })
            .then(() => {
                console.log('Delete News Ok!');
                res.status(200).json({ message: 'News deleted successfully' });
            })
            .catch((error) => {
                console.log('error delete News: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
}
module.exports = new NewsController();
