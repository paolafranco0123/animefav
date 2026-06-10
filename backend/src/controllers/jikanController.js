const JikanService = require('../services/jikanService');
const Anime = require('../models/Anime');

const searchAnime = async (req, res) => {
  try {
    const { query, page = 1, limit = 25, type, status, min_score, genres, order_by, sort } = req.query;
    const result = await JikanService.searchAnime(query || '', page, limit, { type, status, min_score, genres, order_by, sort });
    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    console.error('Error en searchAnime:', error);
    res.status(500).json({ error: 'Error al buscar animes' });
  }
};



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

const getTopAnime = async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const result = await JikanService.getTopAnime(page, limit);
    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    console.error('Error en getTopAnime:', error);
    res.status(500).json({ error: 'Error al obtener top animes' });
  }
};

const getCurrentSeason = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const result = await JikanService.getCurrentSeason(page);
    res.json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    console.error('Error en getCurrentSeason:', error);
    res.status(500).json({ error: 'Error al obtener temporada actual' });
  }
};

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
    const Genero = require('../models/Genero');

    const existingAnime = await Anime.findByMalId(malId);
    const jikanAnime = await JikanService.getAnimeById(malId);

    let animeId;
    if (existingAnime) {
      animeId = existingAnime.id_anime;
    } else {
      const animeData = JikanService.formatAnimeForDB(jikanAnime);
      animeId = await Anime.create(animeData);
    }

    // Guardar géneros siempre
    if (jikanAnime.genres?.length > 0) {
      const generoIds = [];
      for (const genre of jikanAnime.genres) {
        let genero = await Genero.findByName(genre.name);
        if (!genero) {
          const generoId = await Genero.create(genre.name);
          generoIds.push(generoId);
        } else {
          generoIds.push(genero.id_genero);
        }
      }
      await Anime.assignGenres(animeId, generoIds);
    }

    res.status(200).json({
      message: existingAnime ? 'Anime ya existe' : 'Anime importado exitosamente',
      animeId,
    });

  } catch (error) {
    console.error('Error en importAnime:', error);
    res.status(500).json({ error: 'Error al importar anime' });
  }
};

const getCalendario = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = require('../config/database');

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

    const temporadaActual = await JikanService.getCurrentSeason();
    const enEmision = temporadaActual.data || [];
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