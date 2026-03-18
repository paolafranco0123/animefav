const db = require('../config/database');

class Stats {

  // Total de animes por lista (watching, completed, etc.)
  static async getAnimesByList(userId) {
    const query = `
      SELECT l.nombre, COUNT(la.id_anime) as total
      FROM Lista l
      LEFT JOIN Lista_Anime la ON l.id_lista = la.id_lista
      WHERE l.id_usuario = ?
      GROUP BY l.id_lista, l.nombre
      ORDER BY l.tipo DESC, l.nombre ASC
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // Total de episodios vistos en todas las listas
  static async getTotalEpisodiosVistos(userId) {
    const query = `
      SELECT COALESCE(SUM(la.episodios_vistos), 0) as total_episodios
      FROM Lista_Anime la
      INNER JOIN Lista l ON la.id_lista = l.id_lista
      WHERE l.id_usuario = ?
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows[0].total_episodios;
  }

  // Tiempo invertido en minutos (asumiendo 24 min por episodio de media)
  static async getTiempoInvertido(userId) {
    const MINUTOS_POR_EPISODIO = 24;
    const totalEpisodios = await Stats.getTotalEpisodiosVistos(userId);
    const totalMinutos = totalEpisodios * MINUTOS_POR_EPISODIO;
    return {
      minutos: totalMinutos,
      horas: Math.floor(totalMinutos / 60),
      dias: Math.floor(totalMinutos / 60 / 24)
    };
  }

  // Géneros más vistos (basado en animes completados o en progreso)
  static async getGenerosFavoritos(userId) {
    const query = `
      SELECT g.nombre, COUNT(*) as total
      FROM Anime_Genero ag
      INNER JOIN Genero g ON ag.id_genero = g.id_genero
      INNER JOIN Lista_Anime la ON ag.id_anime = la.id_anime
      INNER JOIN Lista l ON la.id_lista = l.id_lista
      WHERE l.id_usuario = ? AND la.episodios_vistos > 0
      GROUP BY g.id_genero, g.nombre
      ORDER BY total DESC
      LIMIT 5
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // Puntuación media del usuario
  static async getPuntuacionMedia(userId) {
    const query = `
      SELECT 
        ROUND(AVG(valor), 2) as media,
        COUNT(*) as total_puntuados
      FROM Puntuacion
      WHERE id_usuario = ?
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows[0];
  }

  // Distribución de puntuaciones (cuántos animes tienen cada nota)
  static async getDistribucionPuntuaciones(userId) {
    const query = `
      SELECT valor, COUNT(*) as total
      FROM Puntuacion
      WHERE id_usuario = ?
      GROUP BY valor
      ORDER BY valor ASC
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // Animes añadidos por mes (actividad del usuario)
  static async getActividadMensual(userId) {
    const query = `
      SELECT 
        DATE_FORMAT(la.fecha_anadido, '%Y-%m') as mes,
        COUNT(*) as animes_añadidos
      FROM Lista_Anime la
      INNER JOIN Lista l ON la.id_lista = l.id_lista
      WHERE l.id_usuario = ?
      GROUP BY mes
      ORDER BY mes DESC
      LIMIT 12
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // Resumen completo de estadísticas
  static async getResumen(userId) {
    const [
      animesPorLista,
      tiempoInvertido,
      generosFavoritos,
      puntuacionMedia,
      distribucionPuntuaciones,
      actividadMensual
    ] = await Promise.all([
      Stats.getAnimesByList(userId),
      Stats.getTiempoInvertido(userId),
      Stats.getGenerosFavoritos(userId),
      Stats.getPuntuacionMedia(userId),
      Stats.getDistribucionPuntuaciones(userId),
      Stats.getActividadMensual(userId)
    ]);

    const totalEpisodios = await Stats.getTotalEpisodiosVistos(userId);
    const totalAnimes = animesPorLista.reduce((acc, l) => acc + l.total, 0);

    return {
      resumen: {
        total_animes: totalAnimes,
        total_episodios: totalEpisodios,
        tiempo_invertido: tiempoInvertido,
        puntuacion_media: puntuacionMedia.media || 0,
        total_puntuados: puntuacionMedia.total_puntuados || 0
      },
      animes_por_lista: animesPorLista,
      generos_favoritos: generosFavoritos,
      distribucion_puntuaciones: distribucionPuntuaciones,
      actividad_mensual: actividadMensual
    };
  }
}

module.exports = Stats;