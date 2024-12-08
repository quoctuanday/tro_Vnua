const express = require('express');
const router = express.Router();
const commentController = require('../controllers/CommentController');
const authenticateToken = require('../middleware/auth');

router.get('/get', commentController.get);
router.post('/create', authenticateToken, commentController.create);
module.exports = router;
