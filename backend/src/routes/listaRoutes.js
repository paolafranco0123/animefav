const express = require('express');
const router = express.Router();
const listaController = require('../controllers/listaController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de listas
router.get('/', listaController.getUserLists);
router.post('/', listaController.createList);
router.get('/:id', listaController.getListById);
router.put('/:id', listaController.updateList);
router.delete('/:id', listaController.deleteList);

// Rutas de animes en listas
router.get('/:id/animes', listaController.getListAnimes);
router.post('/:id/animes', listaController.addAnimeToList);
router.delete('/:id/animes/:animeId', listaController.removeAnimeFromList);
router.patch('/:id/animes/:animeId/progress', listaController.updateProgress);

module.exports = router;