const db = require('../config/database');

const getDashboard = async (req, res) => {
  try {
    const [[{ total_usuarios }]] = await db.execute('SELECT COUNT(*) as total_usuarios FROM Usuario');
    const [[{ total_animes }]] = await db.execute('SELECT COUNT(*) as total_animes FROM Anime');
    const [[{ total_resenias }]] = await db.execute('SELECT COUNT(*) as total_resenias FROM Resenia');
    const [[{ total_puntuaciones }]] = await db.execute('SELECT COUNT(*) as total_puntuaciones FROM Puntuacion');

    const [registros_por_dia] = await db.execute(`
      SELECT DATE(fecha_registro) as fecha, COUNT(*) as total
      FROM Usuario
      WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(fecha_registro)
      ORDER BY fecha ASC
    `);

    res.json({
      total_usuarios,
      total_animes,
      total_resenias,
      total_puntuaciones,
      registros_por_dia
    });
  } catch (error) {
    console.error('Error en getDashboard:', error);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

const getUsuarios = async (req, res) => {
  try {
    const [usuarios] = await db.execute(`
      SELECT id_usuario, nombre, email, fecha_registro, rol, avatar,
        (SELECT COUNT(*) FROM Lista WHERE Lista.id_usuario = Usuario.id_usuario) as total_listas,
        (SELECT COUNT(*) FROM Puntuacion WHERE Puntuacion.id_usuario = Usuario.id_usuario) as total_puntuaciones
      FROM Usuario
      ORDER BY fecha_registro DESC
    `);
    res.json(usuarios);
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const updateUsuarioRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    if (!['user', 'admin'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    await db.execute('UPDATE Usuario SET rol = ? WHERE id_usuario = ?', [rol, id]);
    res.json({ message: 'Rol actualizado' });
  } catch (error) {
    console.error('Error en updateUsuarioRol:', error);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }
    await db.execute('DELETE FROM Usuario WHERE id_usuario = ?', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error en deleteUsuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

const getResenias = async (req, res) => {
  try {
    const [resenias] = await db.execute(`
      SELECT r.id_resenia, r.texto, r.fecha,
        u.nombre as autor, u.id_usuario,
        a.titulo as anime
      FROM Resenia r
      JOIN Usuario u ON r.id_usuario = u.id_usuario
      JOIN Anime a ON r.id_anime = a.id_anime
      ORDER BY r.fecha DESC
    `);
    res.json(resenias);
  } catch (error) {
    console.error('Error en getResenias:', error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};
const deleteResenia = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM Resenia WHERE id_resenia = ?', [id]);
    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    console.error('Error en deleteResenia:', error);
    res.status(500).json({ error: 'Error al eliminar reseña' });
  }
};

const getAnimes = async (req, res) => {
  try {
    const [animes] = await db.execute(`
      SELECT a.id_anime, a.mal_id, a.titulo, a.imagen_portada, a.fecha_estreno, a.num_episodios,
        COUNT(la.id_anime) as veces_en_listas
      FROM Anime a
      LEFT JOIN Lista_Anime la ON a.id_anime = la.id_anime
      GROUP BY a.id_anime
      ORDER BY veces_en_listas DESC
    `);
    res.json(animes);
  } catch (error) {
    console.error('Error en getAnimes:', error);
    res.status(500).json({ error: 'Error al obtener animes' });
  }
};

const getEstadisticas = async (req, res) => {
  try {
    const [animes_populares] = await db.execute(`
  SELECT a.titulo, a.imagen_portada, COUNT(la.id_anime) as veces_en_listas
  FROM Anime a
  JOIN Lista_Anime la ON a.id_anime = la.id_anime
  GROUP BY a.id_anime
  ORDER BY veces_en_listas DESC
  LIMIT 10
`);
console.log('animes_populares:', animes_populares);

    const [puntuaciones_promedio] = await db.execute(`
      SELECT a.titulo, ROUND(AVG(p.valor), 1) as promedio, COUNT(p.id_puntuacion) as total_votos
      FROM Anime a
      JOIN Puntuacion p ON a.id_anime = p.id_anime
      GROUP BY a.id_anime
      HAVING total_votos > 0
      ORDER BY promedio DESC
      LIMIT 10
    `);

    const [usuarios_activos] = await db.execute(`
  SELECT u.nombre, u.avatar,
    COUNT(DISTINCT la.id_anime) as animes_en_listas,
    COUNT(DISTINCT p.id_puntuacion) as puntuaciones
  FROM Usuario u
  LEFT JOIN Lista l ON u.id_usuario = l.id_usuario
  LEFT JOIN Lista_Anime la ON l.id_lista = la.id_lista
  LEFT JOIN Puntuacion p ON u.id_usuario = p.id_usuario
  GROUP BY u.id_usuario
  ORDER BY animes_en_listas DESC
  LIMIT 5
`);

    res.json({ animes_populares, puntuaciones_promedio, usuarios_activos });
  } catch (error) {
    console.error('Error en getEstadisticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
module.exports = { getDashboard, getUsuarios, updateUsuarioRol, deleteUsuario, getResenias, deleteResenia, getAnimes, getEstadisticas};