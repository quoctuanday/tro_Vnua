const express = require('express');
const router = express.Router();
const newsController = require('../controllers/NewsController');
const authenticateToken = require('../middleware/auth');

router.delete('/deleteNews/:newsId', authenticateToken, newsController.delete);
router.put('/updateNews', authenticateToken, newsController.update);
router.get(
    '/getNewsPersonal',
    authenticateToken,
    newsController.getNewsPersonal
);
router.post('/createNews', authenticateToken, newsController.create);

module.exports = router;
