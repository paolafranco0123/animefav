const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {

  static async create(userData) {
    const { nombre, email, password, fecha_nacimiento } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO Usuario (nombre, email, password, fecha_nacimiento)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [nombre, email, hashedPassword, fecha_nacimiento]);
    const userId = result.insertId;
    const Lista = require('./Lista');
    await Lista.createDefaultLists(userId);
    return userId;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM Usuario WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id_usuario, nombre, email, fecha_registro, fecha_nacimiento
      FROM Usuario WHERE id_usuario = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async update(id, userData) {
    const { nombre, email, fecha_nacimiento } = userData;
    const query = `
      UPDATE Usuario SET nombre = ?, email = ?, fecha_nacimiento = ?
      WHERE id_usuario = ?
    `;
    const [result] = await db.execute(query, [nombre, email, fecha_nacimiento, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const query = 'DELETE FROM Usuario WHERE id_usuario = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;