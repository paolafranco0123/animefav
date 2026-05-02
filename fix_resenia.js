const fs = require('fs');
const code = `const db = require('../config/database');

class Resenia {

  static async create(userId, animeId, texto) {
    const query = 'INSERT INTO Resenia (id_usuario, id_anime, texto) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [userId, animeId, texto]);
    return result.insertId;
  }

  static async getByAnimeId(animeId, limit, offset) {
    limit = Number(limit) || 20;
    offset = Number(offset) || 0;
    const query = 'SELECT r.*, u.nombre as usuario_nombre FROM Resenia r INNER JOIN Usuario u ON r.id_usuario = u.id_usuario WHERE r.id_anime = ? ORDER BY r.fecha DESC LIMIT ' + limit + ' OFFSET ' + offset;
    const [rows] = await db.execute(query, [animeId]);
    return rows;
  }

  static async getByUserId(userId) {
    const query = 'SELECT r.*, a.titulo as anime_titulo, a.imagen_portada FROM Resenia r INNER JOIN Anime a ON r.id_anime = a.id_anime WHERE r.id_usuario = ? ORDER BY r.fecha DESC';
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  static async userHasReviewed(userId, animeId) {
    const query = 'SELECT id_resenia FROM Resenia WHERE id_usuario = ? AND id_anime = ?';
    const [rows] = await db.execute(query, [userId, animeId]);
    return rows[0];
  }

  static async update(reseniaId, userId, texto) {
    const query = 'UPDATE Resenia SET texto = ? WHERE id_resenia = ? AND id_usuario = ?';
    const [result] = await db.execute(query, [texto, reseniaId, userId]);
    return result.affectedRows;
  }

  static async delete(reseniaId, userId) {
    const query = 'DELETE FROM Resenia WHERE id_resenia = ? AND id_usuario = ?';
    const [result] = await db.execute(query, [reseniaId, userId]);
    return result.affectedRows;
  }

  static async countByAnimeId(animeId) {
    const query = 'SELECT COUNT(*) as total FROM Resenia WHERE id_anime = ?';
    const [rows] = await db.execute(query, [animeId]);
    return rows[0].total;
  }

  static async findById(reseniaId) {
    const query = 'SELECT r.*, u.nombre as usuario_nombre FROM Resenia r INNER JOIN Usuario u ON r.id_usuario = u.id_usuario WHERE r.id_resenia = ?';
    const [rows] = await db.execute(query, [reseniaId]);
    return rows[0];
  }
}

module.exports = Resenia;`;

fs.writeFileSync('/app/src/models/Resenia.js', code);
console.log('Done:', fs.readFileSync('/app/src/models/Resenia.js', 'utf8').length, 'bytes');