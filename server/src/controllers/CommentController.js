const Comment = require('../models/Comment');

class CommentController {
    create(req, res) {
        const userId = req.user.userId;
        const data = req.body.data;
        data.userId = userId;
        const comment = new Comment(data);
        comment
            .save()
            .then(() => {
                res.status(200).json({
                    message: 'Create comment successfully',
                });
            })
            .catch((error) => {
                console.log('create comment error', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }

    get(req, res) {
        Comment.find()
            .populate('userId', 'userName image')
            .then((comments) => {
                if (!comments)
                    res.status(404).json({ message: 'Comment not found' });

                const comment = comments.map((comment) => {
                    const { userId, ...rest } = comment.toObject();
                    return {
                        ...rest,
                        userId: userId?._id || null,
                        userName: userId?.userName || null,
                        image: userId?.image || null,
                    };
                });
                res.status(200).json({ message: 'List Comment', comment });
            })
            .catch((error) => {
                console.log('Get comment error: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
}

module.exports = new CommentController();
