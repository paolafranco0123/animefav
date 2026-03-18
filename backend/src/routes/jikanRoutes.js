const express = require('express');
const router = express.Router();
const jikanController = require('../controllers/jikanController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas (sin autenticación)
router.get('/search', jikanController.searchAnime);
router.get('/anime/:malId', jikanController.getAnimeById);
router.get('/top', jikanController.getTopAnime);
router.get('/season/now', jikanController.getCurrentSeason);
router.get('/genres', jikanController.getGenres);


// Rutas protegidas (requieren autenticación)
router.post('/import/:malId', authMiddleware, jikanController.importAnime);
router.get('/calendario', authMiddleware, jikanController.getCalendario);

module.exports = router;