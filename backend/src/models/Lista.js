const db = require('../config/database');

class Lista {
  
  // Listas predeterminadas que se crean automáticamente
  static LISTAS_PREDETERMINADAS = [
    'Watching',
    'Completed',
    'On-Hold',
    'Dropped',
    'Plan to Watch'
  ];
  
  // Crear listas predeterminadas para un usuario nuevo
  static async createDefaultLists(userId) {
    const values = this.LISTAS_PREDETERMINADAS.map(nombre => [nombre, 'predeterminada', userId]);
    const placeholders = values.map(() => '(?, ?, ?)').join(', ');
    const flatValues = values.flat();
    
    const query = `INSERT INTO Lista (nombre, tipo, id_usuario) VALUES ${placeholders}`;
    await db.execute(query, flatValues);
  }
  
  // Crear una lista personalizada
  static async create(userId, nombre, color) {
    const query = `
      INSERT INTO Lista (nombre, tipo, id_usuario, color)
      VALUES (?, 'personalizada', ?, ?)
    `;
    
    const [result] = await db.execute(query, [nombre, userId, color]);
    return result.insertId;
  }
  
  // Obtener todas las listas de un usuario con contador de animes
  static async getByUserId(userId) {
    const query = `
      SELECT l.id_lista, l.nombre, l.tipo, l.fecha_creacion, l.color,
             COUNT(la.id_anime) as total_animes
      FROM Lista l
      LEFT JOIN Lista_Anime la ON l.id_lista = la.id_lista
      WHERE l.id_usuario = ?
      GROUP BY l.id_lista, l.nombre, l.tipo, l.fecha_creacion, l.color
      ORDER BY l.tipo DESC, l.nombre ASC
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }
  
  // Obtener una lista específica
  static async findById(listaId, userId) {
    const query = `
      SELECT id_lista, nombre, tipo, fecha_creacion 
      FROM Lista 
      WHERE id_lista = ? AND id_usuario = ?
    `;
    const [rows] = await db.execute(query, [listaId, userId]);
    return rows[0];
  }
  
  // Actualizar nombre de lista (solo personalizadas)
  static async update(listaId, userId, nuevoNombre) {
    const query = `
      UPDATE Lista 
      SET nombre = ?
      WHERE id_lista = ? AND id_usuario = ? AND tipo = 'personalizada'
    `;
    
    const [result] = await db.execute(query, [nuevoNombre, listaId, userId]);
    return result.affectedRows;
  }
  
  // Eliminar lista (solo personalizadas)
  static async delete(listaId, userId) {
    const query = `
      DELETE FROM Lista 
      WHERE id_lista = ? AND id_usuario = ? AND tipo = 'personalizada'
    `;
    
    const [result] = await db.execute(query, [listaId, userId]);
    return result.affectedRows;
  }
  
  // Agregar anime a una lista
  static async addAnime(listaId, animeId) {
    const query = `
      INSERT INTO Lista_Anime (id_lista, id_anime)
      VALUES (?, ?)
    `;
    
    try {
      await db.execute(query, [listaId, animeId]);
      return true;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return false; // Ya existe en la lista
      }
      throw error;
    }
  }
  
  // Eliminar anime de una lista
  static async removeAnime(listaId, animeId) {
    const query = `
      DELETE FROM Lista_Anime 
      WHERE id_lista = ? AND id_anime = ?
    `;
    
    const [result] = await db.execute(query, [listaId, animeId]);
    return result.affectedRows;
  }
  
  // Obtener todos los animes de una lista
  static async getAnimes(listaId) {
    const query = `
      SELECT a.*, la.fecha_anadido, la.episodios_vistos
      FROM Anime a
      INNER JOIN Lista_Anime la ON a.id_anime = la.id_anime
      WHERE la.id_lista = ?
      ORDER BY la.fecha_anadido DESC
    `;
    
    const [rows] = await db.execute(query, [listaId]);
    return rows;
  }

  // Actualizar episodios vistos de un anime en una lista
  static async updateProgress(listaId, animeId, episodiosVistos) {
    const query = `
      UPDATE Lista_Anime
      SET episodios_vistos = ?
      WHERE id_lista = ? AND id_anime = ?
    `;
    const [result] = await db.execute(query, [episodiosVistos, listaId, animeId]);
    return result.affectedRows;
  }

  // Obtener progreso de un anime concreto en una lista
  static async getProgress(listaId, animeId) {
    const query = `
      SELECT la.episodios_vistos, a.num_episodios, a.titulo
      FROM Lista_Anime la
      INNER JOIN Anime a ON la.id_anime = a.id_anime
      WHERE la.id_lista = ? AND la.id_anime = ?
    `;
    const [rows] = await db.execute(query, [listaId, animeId]);
    return rows[0];
  }
}

module.exports = Lista;