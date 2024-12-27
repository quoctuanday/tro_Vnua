const express = require('express');
const router = express.Router();
const commentController = require('../controllers/CommentController');
const authenticateToken = require('../middleware/auth');
const authorization = require('../middleware/author');

router.put(
    '/block/:commentId',
    authenticateToken,
    authorization(['admin', 'moderator']),
    commentController.block
);
router.delete('/delete/:commentId', commentController.delete);
router.get('/get/:roomId', commentController.get);
router.post('/create', authenticateToken, commentController.create);
module.exports = router;
