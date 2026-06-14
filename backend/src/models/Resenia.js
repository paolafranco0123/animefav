const db = require('../config/database');

class Resenia {
  static async create(userId, animeId, texto) {
    const [result] = await db.execute('INSERT INTO Resenia (id_usuario, id_anime, texto) VALUES (?, ?, ?)', [userId, animeId, texto]);
    return result.insertId;
  }
 static async getByAnimeId(animeId, limit, offset) {
  limit = Number(limit) || 20;
  offset = Number(offset) || 0;
  const [rows] = await db.execute(
    'SELECT r.*, u.nombre as usuario_nombre, u.avatar as usuario_avatar FROM Resenia r INNER JOIN Usuario u ON r.id_usuario = u.id_usuario WHERE r.id_anime = ? ORDER BY r.fecha DESC LIMIT ' + limit + ' OFFSET ' + offset,
    [animeId]
  );
  return rows;
}
  static async getByUserId(userId) {
    const [rows] = await db.execute('SELECT r.*, a.titulo as anime_titulo, a.imagen_portada FROM Resenia r INNER JOIN Anime a ON r.id_anime = a.id_anime WHERE r.id_usuario = ? ORDER BY r.fecha DESC', [userId]);
    return rows;
  }
  static async userHasReviewed(userId, animeId) {
    const [rows] = await db.execute('SELECT id_resenia FROM Resenia WHERE id_usuario = ? AND id_anime = ?', [userId, animeId]);
    return rows[0];
  }
  static async update(reseniaId, userId, texto) {
    const [result] = await db.execute('UPDATE Resenia SET texto = ? WHERE id_resenia = ? AND id_usuario = ?', [texto, reseniaId, userId]);
    return result.affectedRows;
  }
  static async delete(reseniaId, userId) {
    const [result] = await db.execute('DELETE FROM Resenia WHERE id_resenia = ? AND id_usuario = ?', [reseniaId, userId]);
    return result.affectedRows;
  }
  static async countByAnimeId(animeId) {
    const [rows] = await db.execute('SELECT COUNT(*) as total FROM Resenia WHERE id_anime = ?', [animeId]);
    return rows[0].total;
  }
  static async findById(reseniaId) {
    const [rows] = await db.execute('SELECT r.*, u.nombre as usuario_nombre FROM Resenia r INNER JOIN Usuario u ON r.id_usuario = u.id_usuario WHERE r.id_resenia = ?', [reseniaId]);
    return rows[0];
  }
}

module.exports = Resenia;