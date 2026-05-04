const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');


// Rutas públicas (sin autenticación)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/verify/:token', userController.verifyEmail);

module.exports = router;