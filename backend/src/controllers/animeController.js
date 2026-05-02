const Anime = require('../models/Anime');

// Obtener todos los animes de nuestra BD
const getAllAnimes = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const animes = await Anime.getAll(parseInt(limit), parseInt(offset));
    res.json(animes);
  } catch (error) {
    console.error('Error en getAllAnimes:', error);
    res.status(500).json({ error: 'Error al obtener animes' });
  }
};

// Obtener un anime por ID
const getAnimeById = async (req, res) => {
  try {
    const { id } = req.params;
    const anime = await Anime.findById(id);
    
    if (!anime) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }
    
    res.json(anime);
  } catch (error) {
    console.error('Error en getAnimeById:', error);
    res.status(500).json({ error: 'Error al obtener anime' });
  }
};

// Buscar animes por título en nuestra BD
const searchAnime = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }
    
    const animes = await Anime.searchByTitle(query);
    res.json(animes);
  } catch (error) {
    console.error('Error en searchAnime:', error);
    res.status(500).json({ error: 'Error al buscar animes' });
  }
};

// Crear un anime manualmente (admin)
const createAnime = async (req, res) => {
  try {
    const animeData = req.body;
    
    if (!animeData.titulo) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }
    
    const animeId = await Anime.create(animeData);
    
    res.status(201).json({
      message: 'Anime creado exitosamente',
      animeId
    });
  } catch (error) {
    console.error('Error en createAnime:', error);
    res.status(500).json({ error: 'Error al crear anime' });
  }
};

// Actualizar un anime
const updateAnime = async (req, res) => {
  try {
    const { id } = req.params;
    const animeData = req.body;
    
    const affectedRows = await Anime.update(id, animeData);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }
    
    res.json({ message: 'Anime actualizado exitosamente' });
  } catch (error) {
    console.error('Error en updateAnime:', error);
    res.status(500).json({ error: 'Error al actualizar anime' });
  }
};

// Eliminar un anime
const deleteAnime = async (req, res) => {
  try {
    const { id } = req.params;
    
    const affectedRows = await Anime.delete(id);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }
    
    res.json({ message: 'Anime eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteAnime:', error);
    res.status(500).json({ error: 'Error al eliminar anime' });
  }
};

// Obtener géneros de un anime
const getAnimeGenres = async (req, res) => {
  try {
    const { id } = req.params;
    const genres = await Anime.getGenres(id);
    res.json(genres);
  } catch (error) {
    console.error('Error en getAnimeGenres:', error);
    res.status(500).json({ error: 'Error al obtener géneros' });
  }
};

const getAnimeByMalId = async (req, res) => {
  try {
    const { malId } = req.params;
    const anime = await Anime.findByMalId(malId);
    if (!anime) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }
    res.json(anime);
  } catch (error) {
    console.error('Error en getAnimeByMalId:', error);
    res.status(500).json({ error: 'Error al obtener anime' });
  }
};
module.exports = {
  getAllAnimes,
  getAnimeById,
  getAnimeByMalId,
  searchAnime,
  createAnime,
  updateAnime,
  deleteAnime,
  getAnimeGenres
};