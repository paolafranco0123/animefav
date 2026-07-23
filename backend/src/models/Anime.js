const db = require('../config/database');

class Anime {
  
  // Crear un anime
  static async create(animeData) {
    const { titulo, descripcion, fecha_estreno, num_episodios, edad_recomendada, imagen_portada, mal_id } = animeData;
    
    const query = `
      INSERT INTO Anime (titulo, descripcion, fecha_estreno, num_episodios, edad_recomendada, imagen_portada, mal_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      titulo, 
      descripcion, 
      fecha_estreno, 
      num_episodios, 
      edad_recomendada, 
      imagen_portada,
      mal_id
    ]);
    
    return result.insertId;
  }
  
// Obtener todos los animes
static async getAll(limit = 50, offset = 0) {
  const safeLimit = parseInt(limit) || 50;
  const safeOffset = parseInt(offset) || 0;

  const query = `
    SELECT * FROM Anime 
    ORDER BY fecha_estreno DESC 
    LIMIT ${safeLimit} OFFSET ${safeOffset}
  `;
  const [rows] = await db.query(query);
  return rows;
}
  
  // Buscar anime por ID
  static async findById(id) {
    const query = 'SELECT * FROM Anime WHERE id_anime = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }
  
  // Buscar anime por MAL ID
  static async findByMalId(malId) {
    const query = 'SELECT * FROM Anime WHERE mal_id = ?';
    const [rows] = await db.execute(query, [malId]);
    return rows[0];
  }
  
  // Buscar animes por título
  static async searchByTitle(titulo) {
    const query = 'SELECT * FROM Anime WHERE titulo LIKE ? ORDER BY titulo';
    const [rows] = await db.execute(query, [`%${titulo}%`]);
    return rows;
  }
  
  // Actualizar anime
  static async update(id, animeData) {
    const { titulo, descripcion, fecha_estreno, num_episodios, edad_recomendada, imagen_portada } = animeData;
    
    const query = `
      UPDATE Anime 
      SET titulo = ?, descripcion = ?, fecha_estreno = ?, 
          num_episodios = ?, edad_recomendada = ?, imagen_portada = ?
      WHERE id_anime = ?
    `;
    
    const [result] = await db.execute(query, [
      titulo, 
      descripcion, 
      fecha_estreno, 
      num_episodios, 
      edad_recomendada, 
      imagen_portada,
      id
    ]);
    
    return result.affectedRows;
  }
  
  // Eliminar anime
  static async delete(id) {
    const query = 'DELETE FROM Anime WHERE id_anime = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows;
  }
  
  // Obtener géneros de un anime
  static async getGenres(animeId) {
    const query = `
      SELECT g.id_genero, g.nombre 
      FROM Genero g
      INNER JOIN Anime_Genero ag ON g.id_genero = ag.id_genero
      WHERE ag.id_anime = ?
    `;
    const [rows] = await db.execute(query, [animeId]);
    return rows;
  }
  
  // Asignar géneros a un anime
static async assignGenres(animeId, genreIds) {
  if (!genreIds || genreIds.length === 0) return;
  
  const values = genreIds.map(genreId => [animeId, genreId]);
  const placeholders = values.map(() => '(?, ?)').join(', ');
  const flatValues = values.flat();
  
  await db.execute(
    `INSERT IGNORE INTO Anime_Genero (id_anime, id_genero) VALUES ${placeholders}`,
    flatValues
  );
}
}

module.exports = Anime;