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
      SELECT r.id_resenia, r.texto, r.fecha_creada,
        u.nombre as autor, u.id_usuario,
        a.titulo as anime
      FROM Resenia r
      JOIN Usuario u ON r.id_usuario = u.id_usuario
      JOIN Anime a ON r.id_anime = a.id_anime
      ORDER BY r.fecha_creada DESC
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
      SELECT a.id_anime, a.mal_id, a.titulo, a.imagen_portada, a.tipo, a.estado,
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

module.exports = { getDashboard, getUsuarios, updateUsuarioRol, deleteUsuario, getResenias, deleteResenia, getAnimes };