const express = require('express');
const router = express.Router();
const animeController = require('../controllers/animeController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.get('/', animeController.getAllAnimes);
router.get('/search', animeController.searchAnime);
router.get('/mal/:malId', animeController.getAnimeByMalId); 
router.get('/:id', animeController.getAnimeById);
router.get('/:id/genres', animeController.getAnimeGenres);

// Rutas protegidas
router.post('/', authMiddleware, animeController.createAnime);
router.put('/:id', authMiddleware, animeController.updateAnime);
router.delete('/:id', authMiddleware, animeController.deleteAnime);

module.exports = router;