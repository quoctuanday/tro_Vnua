const Comment = require('../models/Comment');
const Room = require('../models/Room');

class CommentController {
    create = async (req, res) => {
        try {
            const userId = req.user.userId;
            const data = req.body.data;
            data.userId = userId;
            const comment = new Comment(data);
            await comment.save();
            const room = await Room.findById(data.roomId);
            if (!room) {
                return res.status(404).json({ message: 'Room not found' });
            }
            const comments = await Comment.find({ roomId: data.roomId });
            if (comments.length === 0) {
                return res
                    .status(404)
                    .json({ message: 'No comments found for this room' });
            }
            const totalRate = comments.reduce(
                (sum, comment) => sum + (comment.rate || 0),
                0
            );
            const averageRate = totalRate / comments.length;
            await Room.findByIdAndUpdate(data.roomId, { rate: averageRate });

            res.status(200).json({
                message: 'Create comment successfully and update room rate',
            });
        } catch (error) {
            console.log('Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    get(req, res) {
        const roomId = req.params.roomId;
        Comment.find({ roomId: roomId })
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
