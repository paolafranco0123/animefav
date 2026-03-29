const JikanService = require('../services/jikanService');
const Anime = require('../models/Anime');

// Buscar animes en Jikan
const searchAnime = async (req, res) => {
  try {
    const { query, page = 1, limit = 25 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }
    
    const result = await JikanService.searchAnime(query, page, limit);
    
    res.json({
      data: result.data,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('Error en searchAnime:', error);
    res.status(500).json({ error: 'Error al buscar animes' });
  }
};

// Obtener anime por ID de MAL
const getAnimeById = async (req, res) => {
  try {
    const { malId } = req.params;
    
    const anime = await JikanService.getAnimeById(malId);
    
    res.json(anime);
    
  } catch (error) {
    console.error('Error en getAnimeById:', error);
    res.status(500).json({ error: 'Error al obtener anime' });
  }
};

// Obtener top animes
const getTopAnime = async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    
    const result = await JikanService.getTopAnime(page, limit);
    
    res.json({
      data: result.data,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('Error en getTopAnime:', error);
    res.status(500).json({ error: 'Error al obtener top animes' });
  }
};

// Obtener temporada actual
const getCurrentSeason = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    
    const result = await JikanService.getCurrentSeason(page);
    
    res.json({
      data: result.data,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('Error en getCurrentSeason:', error);
    res.status(500).json({ error: 'Error al obtener temporada actual' });
  }
};

// Obtener géneros
const getGenres = async (req, res) => {
  try {
    const genres = await JikanService.getGenres();
    res.json(genres);
  } catch (error) {
    console.error('Error en getGenres:', error);
    res.status(500).json({ error: 'Error al obtener géneros' });
  }
};

const importAnime = async (req, res) => {
  try {
    const { malId } = req.params;

    // Verificar si ya existe
    const existingAnime = await Anime.findByMalId(malId);
    if (existingAnime) {
      return res.status(200).json({
        message: 'Anime ya existe',
        animeId: existingAnime.id_anime,
        anime: existingAnime
      });
    }

    const jikanAnime = await JikanService.getAnimeById(malId);
    const animeData = JikanService.formatAnimeForDB(jikanAnime);
    const animeId = await Anime.create(animeData);

    res.status(201).json({
      message: 'Anime importado exitosamente',
      animeId,
      anime: animeData
    });

  } catch (error) {
    console.error('Error en importAnime:', error);
    res.status(500).json({ error: 'Error al importar anime' });
  }
};

// Calendario de emisiones: animes en "Watching" del usuario que están en emisión
const getCalendario = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = require('../config/database');

    // Obtener los mal_id de los animes que el usuario tiene en "Watching"
    const [watchingAnimes] = await db.execute(`
      SELECT a.mal_id, a.titulo, a.imagen_portada, a.num_episodios, la.episodios_vistos
      FROM Lista_Anime la
      INNER JOIN Lista l ON la.id_lista = l.id_lista
      INNER JOIN Anime a ON la.id_anime = a.id_anime
      WHERE l.id_usuario = ? AND l.nombre = 'Watching' AND a.mal_id IS NOT NULL
    `, [userId]);

    if (watchingAnimes.length === 0) {
      return res.json({ data: [], mensaje: 'No tienes animes en tu lista Watching' });
    }

    // Obtener temporada actual de Jikan
    const temporadaActual = await JikanService.getCurrentSeason();
    const enEmision = temporadaActual.data || [];

    // Cruzar los mal_ids del usuario con los animes en emisión
    const malIdsUsuario = watchingAnimes.map(a => a.mal_id);
    const calendario = enEmision
      .filter(anime => malIdsUsuario.includes(anime.mal_id))
      .map(anime => {
        const animeLocal = watchingAnimes.find(a => a.mal_id === anime.mal_id);
        return {
          mal_id: anime.mal_id,
          titulo: anime.title,
          imagen: anime.images?.jpg?.image_url || '',
          episodios_totales: anime.episodes || animeLocal.num_episodios,
          episodios_vistos: animeLocal.episodios_vistos,
          dia_emision: anime.broadcast?.day || 'Unknown',
          hora_emision: anime.broadcast?.time || '',
          score: anime.score
        };
      });

    res.json({ data: calendario });

  } catch (error) {
    console.error('Error en getCalendario:', error);
    res.status(500).json({ error: 'Error al obtener calendario de emisiones' });
  }
};
module.exports = {
  searchAnime,
  getAnimeById,
  getTopAnime,
  getCurrentSeason,
  getGenres,
  importAnime,
  getCalendario
};