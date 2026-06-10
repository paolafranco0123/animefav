const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/verify/:token', userController.verifyEmail);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/avatar', authMiddleware, userController.updateAvatar);

module.exports = router;