const db = require('../config/database');

class Genero {
  static async findByName(nombre) {
    const [rows] = await db.execute('SELECT * FROM Genero WHERE nombre = ?', [nombre]);
    return rows[0];
  }

  static async create(nombre) {
    const [result] = await db.execute('INSERT INTO Genero (nombre) VALUES (?)', [nombre]);
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM Genero ORDER BY nombre');
    return rows;
  }
}

module.exports = Genero;