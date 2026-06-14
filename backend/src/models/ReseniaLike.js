const db = require('../config/database');

class ReseniaLike {
  static async toggle(userId, reseniaId) {
    const [existing] = await db.execute(
      'SELECT * FROM Resenia_Like WHERE id_usuario = ? AND id_resenia = ?',
      [userId, reseniaId]
    );
    if (existing.length > 0) {
      await db.execute(
        'DELETE FROM Resenia_Like WHERE id_usuario = ? AND id_resenia = ?',
        [userId, reseniaId]
      );
      return { liked: false };
    } else {
      await db.execute(
        'INSERT INTO Resenia_Like (id_usuario, id_resenia) VALUES (?, ?)',
        [userId, reseniaId]
      );
      return { liked: true };
    }
  }

  static async countByResenia(reseniaId) {
    const [[{ total }]] = await db.execute(
      'SELECT COUNT(*) as total FROM Resenia_Like WHERE id_resenia = ?',
      [reseniaId]
    );
    return total;
  }

  static async userLiked(userId, reseniaId) {
    const [rows] = await db.execute(
      'SELECT * FROM Resenia_Like WHERE id_usuario = ? AND id_resenia = ?',
      [userId, reseniaId]
    );
    return rows.length > 0;
  }
}

module.exports = ReseniaLike;