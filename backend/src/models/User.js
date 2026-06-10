const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {

  static async create(userData) {
<<<<<<< HEAD
  const { nombre, email, password, fecha_nacimiento } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  const query = `INSERT INTO Usuario (nombre, email, password, fecha_nacimiento, token_verificacion) VALUES (?, ?, ?, ?, ?)`;
  const [result] = await db.execute(query, [nombre, email, hashedPassword, fecha_nacimiento || null, token]);
  const userId = result.insertId;
  const Lista = require('./Lista');
  await Lista.createDefaultLists(userId);
  return { userId, token };
}

static async verifyEmail(token) {
  const [result] = await db.execute(
    `UPDATE Usuario SET email_verificado = TRUE, token_verificacion = NULL WHERE token_verificacion = ?`,
    [token]
  );
  return result.affectedRows;
}
=======
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
>>>>>>> f47cac16fd014f5b7b878bca514ed2a672961e32

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