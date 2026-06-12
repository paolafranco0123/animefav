const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.use(authMiddleware);
router.use(adminAuth);

router.get('/dashboard', adminController.getDashboard);
router.get('/usuarios', adminController.getUsuarios);
router.put('/usuarios/:id/rol', adminController.updateUsuarioRol);
router.delete('/usuarios/:id', adminController.deleteUsuario);
router.get('/resenias', adminController.getResenias);
router.delete('/resenias/:id', adminController.deleteResenia);
router.get('/estadisticas', adminController.getEstadisticas);

module.exports = router;