const Comment = require('../models/Comment');
const Room = require('../models/Room');
const Roommate = require('../models/Roommate');

class CommentController {
    create = async (req, res) => {
        try {
            const userId = req.user.userId;
            const data = req.body.data.data;
            const type = req.body.data.type;
            data.userId = userId;
            const comment = new Comment(data);
            await comment.save();
            if (type) {
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
                await Room.findByIdAndUpdate(data.roomId, {
                    rate: averageRate,
                });

                res.status(200).json({
                    message: 'Create comment successfully and update room rate',
                });
            } else {
                const roommate = await Roommate.findById(data.roommateId);
                if (!roommate) {
                    return res
                        .status(404)
                        .json({ message: 'Roommate not found' });
                }
                const comments = await Comment.find({
                    roommateId: data.roommateId,
                });
                if (comments.length === 0) {
                    return res.status(404).json({
                        message: 'No comments found for this roommate',
                    });
                }
                const totalRate = comments.reduce(
                    (sum, comment) => sum + (comment.rate || 0),
                    0
                );
                const averageRate = totalRate / comments.length;
                await Roommate.findByIdAndUpdate(data.roommateId, {
                    rate: averageRate,
                });

                res.status(200).json({
                    message:
                        'Create comment successfully and update roommate rate',
                });
            }
        } catch (error) {
            console.log('Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };

    get(req, res) {
        const roomId = req.params.roomId;
        const { type } = req.query;
        Comment.find(
            type === 'true' ? { roomId: roomId } : { roommateId: roomId }
        )
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
    delete(req, res) {
        const commentId = req.params.commentId;
        Comment.findByIdAndDelete(commentId)
            .then((comment) => {
                if (!comment) return;
                res.status(200).json({ message: 'Comment deleted' });
            })
            .catch((error) => {
                console.log('error deleting comment: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
    block(req, res) {
        const commentId = req.params.commentId;
        Comment.findByIdAndUpdate(commentId, { isBlocked: true })
            .then((comment) => {
                if (!comment) return;
                res.status(200).json({ message: 'Comment blocked' });
            })
            .catch((error) => {
                console.log('error blocked comment: ', error);
                res.status(500).json({ message: 'Internal Server Error' });
            });
    }
}

module.exports = new CommentController();
