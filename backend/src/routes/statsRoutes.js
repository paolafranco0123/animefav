const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', statsController.getResumen);
router.get('/listas', statsController.getAnimesByList);
router.get('/tiempo', statsController.getTiempoInvertido);
router.get('/generos', statsController.getGenerosFavoritos);
router.get('/puntuaciones', statsController.getDistribucionPuntuaciones);

module.exports = router;