const Stats = require('../models/Stats');

// Obtener resumen completo de estadísticas del usuario
const getResumen = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumen = await Stats.getResumen(userId);
    res.json(resumen);
  } catch (error) {
    console.error('Error en getResumen:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// Obtener animes por lista
const getAnimesByList = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await Stats.getAnimesByList(userId);
    res.json(data);
  } catch (error) {
    console.error('Error en getAnimesByList:', error);
    res.status(500).json({ error: 'Error al obtener animes por lista' });
  }
};

// Obtener tiempo invertido
const getTiempoInvertido = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await Stats.getTiempoInvertido(userId);
    res.json(data);
  } catch (error) {
    console.error('Error en getTiempoInvertido:', error);
    res.status(500).json({ error: 'Error al obtener tiempo invertido' });
  }
};

// Obtener géneros favoritos
const getGenerosFavoritos = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await Stats.getGenerosFavoritos(userId);
    res.json(data);
  } catch (error) {
    console.error('Error en getGenerosFavoritos:', error);
    res.status(500).json({ error: 'Error al obtener géneros favoritos' });
  }
};

// Obtener distribución de puntuaciones
const getDistribucionPuntuaciones = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await Stats.getDistribucionPuntuaciones(userId);
    res.json(data);
  } catch (error) {
    console.error('Error en getDistribucionPuntuaciones:', error);
    res.status(500).json({ error: 'Error al obtener distribución de puntuaciones' });
  }
};

module.exports = {
  getResumen,
  getAnimesByList,
  getTiempoInvertido,
  getGenerosFavoritos,
  getDistribucionPuntuaciones
};