const axios = require('axios');
const redis = require('../config/redis');

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

const CACHE_TTL = {
  TOP_ANIME: 60 * 60,
  CURRENT_SEASON: 60 * 30,
  GENRES: 60 * 60 * 24,
  ANIME_DETAIL: 60 * 60 * 6
};

async function getFromCache(key) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function saveToCache(key, data, ttl) {
  try {
    await redis.setEx(key, ttl, JSON.stringify(data));
  } catch {
    // Si Redis falla, no pasa nada
  }
}

class JikanService {

static async searchAnime(query, page = 1, limit = 25, filters = {}) {
  try {
    const params = { page, limit, sfw: true };
    if (query) params.q = query;
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;

    if (filters.min_score) params.min_score = filters.min_score;
    if (filters.genres) params.genres = filters.genres;
    if (filters.order_by) params.order_by = filters.order_by;

    const response = await axios.get(`${JIKAN_BASE_URL}/anime`, { params });
    return response.data;
  } catch (error) {
    console.error('Error buscando anime:', error);
    throw error;
  }
}
  static async getAnimeById(malId) {
    const cacheKey = `jikan:anime:${malId}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/anime/${malId}/full`);
      const data = response.data.data;
      await saveToCache(cacheKey, data, CACHE_TTL.ANIME_DETAIL);
      return data;
    } catch (error) {
      console.error('Error obteniendo anime:', error);
      throw error;
    }
  }

  static async getTopAnime(page = 1, limit = 25) {
    const cacheKey = `jikan:top:${page}:${limit}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/top/anime`, {
        params: { page, limit }
      });
      await saveToCache(cacheKey, response.data, CACHE_TTL.TOP_ANIME);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo top animes:', error);
      throw error;
    }
  }

  static async getCurrentSeason(page = 1) {
    const cacheKey = `jikan:season:now:${page}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/seasons/now`, {
        params: { page }
      });
      await saveToCache(cacheKey, response.data, CACHE_TTL.CURRENT_SEASON);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo temporada actual:', error);
      throw error;
    }
  }

  static async getGenres() {
    const cacheKey = 'jikan:genres';
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/genres/anime`);
      await saveToCache(cacheKey, response.data.data, CACHE_TTL.GENRES);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo géneros:', error);
      throw error;
    }
  }

  static async getAnimeByGenre(genreId, page = 1) {
    try {
      const response = await axios.get(`${JIKAN_BASE_URL}/anime`, {
        params: { genres: genreId, page }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo animes por género:', error);
      throw error;
    }
  }

  static formatAnimeForDB(jikanAnime) {
    return {
      titulo: jikanAnime.title || jikanAnime.title_english || 'Sin título',
      descripcion: jikanAnime.synopsis || '',
      fecha_estreno: jikanAnime.aired?.from ? jikanAnime.aired.from.split('T')[0] : null,
      num_episodios: jikanAnime.episodes || 0,
      edad_recomendada: jikanAnime.rating || 'Unknown',
      imagen_portada: jikanAnime.images?.jpg?.large_image_url || jikanAnime.images?.jpg?.image_url || '',
      mal_id: jikanAnime.mal_id
    };
  }
}

module.exports = JikanService;