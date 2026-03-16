const Lista = require('../models/Lista');
const Anime = require('../models/Anime');
const JikanService = require('../services/jikanService');

// Obtener todas las listas del usuario autenticado
const getUserLists = async (req, res) => {
  try {
    const userId = req.user.id;
    const listas = await Lista.getByUserId(userId);
    res.json(listas);
  } catch (error) {
    console.error('Error en getUserLists:', error);
    res.status(500).json({ error: 'Error al obtener listas' });
  }
};

// Crear una lista personalizada
const createList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la lista es obligatorio' });
    }
    
    const listaId = await Lista.create(userId, nombre);
    
    res.status(201).json({
      message: 'Lista creada exitosamente',
      listaId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya tienes una lista con ese nombre' });
    }
    console.error('Error en createList:', error);
    res.status(500).json({ error: 'Error al crear lista' });
  }
};

// Obtener una lista específica
const getListById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const lista = await Lista.findById(id, userId);
    
    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }
    
    res.json(lista);
  } catch (error) {
    console.error('Error en getListById:', error);
    res.status(500).json({ error: 'Error al obtener lista' });
  }
};

// Actualizar nombre de lista personalizada
const updateList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { nombre } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const affectedRows = await Lista.update(id, userId, nombre);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Lista no encontrada o no es personalizada' });
    }
    
    res.json({ message: 'Lista actualizada exitosamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya tienes una lista con ese nombre' });
    }
    console.error('Error en updateList:', error);
    res.status(500).json({ error: 'Error al actualizar lista' });
  }
};

// Eliminar lista personalizada
const deleteList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const affectedRows = await Lista.delete(id, userId);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Lista no encontrada o no es personalizada' });
    }
    
    res.json({ message: 'Lista eliminada exitosamente' });
  } catch (error) {
    console.error('Error en deleteList:', error);
    res.status(500).json({ error: 'Error al eliminar lista' });
  }
};

// Agregar anime a una lista (con importación automática desde Jikan)
const addAnimeToList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { animeId, malId } = req.body;
    
    // Verificar que la lista pertenece al usuario
    const lista = await Lista.findById(id, userId);
    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }
    
    let finalAnimeId = animeId;
    
    // Si viene malId (de Jikan), importar el anime primero
    if (malId && !animeId) {
      // Verificar si ya existe en nuestra BD
      const existingAnime = await Anime.findByMalId(malId);
      
      if (existingAnime) {
        finalAnimeId = existingAnime.id_anime;
      } else {
        // Obtener datos de Jikan
        const jikanAnime = await JikanService.getAnimeById(malId);
        const animeData = JikanService.formatAnimeForDB(jikanAnime);
        
        // Guardar en nuestra BD
        finalAnimeId = await Anime.create(animeData);
      }
    }
    
    if (!finalAnimeId) {
      return res.status(400).json({ error: 'Debes proporcionar animeId o malId' });
    }
    
    const added = await Lista.addAnime(id, finalAnimeId);
    
    if (!added) {
      return res.status(400).json({ error: 'El anime ya está en la lista' });
    }
    
    res.status(201).json({ 
      message: 'Anime agregado a la lista',
      animeId: finalAnimeId
    });
  } catch (error) {
    console.error('Error en addAnimeToList:', error);
    res.status(500).json({ error: 'Error al agregar anime' });
  }
};

// Eliminar anime de una lista
const removeAnimeFromList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, animeId } = req.params;
    
    // Verificar que la lista pertenece al usuario
    const lista = await Lista.findById(id, userId);
    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }
    
    const affectedRows = await Lista.removeAnime(id, animeId);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'El anime no está en esta lista' });
    }
    
    res.json({ message: 'Anime eliminado de la lista' });
  } catch (error) {
    console.error('Error en removeAnimeFromList:', error);
    res.status(500).json({ error: 'Error al eliminar anime' });
  }
};

// Obtener todos los animes de una lista
const getListAnimes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Verificar que la lista pertenece al usuario
    const lista = await Lista.findById(id, userId);
    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }
    
    const animes = await Lista.getAnimes(id);
    
    res.json(animes);
  } catch (error) {
    console.error('Error en getListAnimes:', error);
    res.status(500).json({ error: 'Error al obtener animes de la lista' });
  }
};

// Actualizar episodios vistos de un anime en una lista
const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, animeId } = req.params;
    const { episodios_vistos } = req.body;

    if (episodios_vistos === undefined || episodios_vistos < 0) {
      return res.status(400).json({ error: 'El número de episodios vistos no es válido' });
    }

    // Verificar que la lista pertenece al usuario
    const lista = await Lista.findById(id, userId);
    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    // Verificar que el anime está en la lista y obtener total de episodios
    const progreso = await Lista.getProgress(id, animeId);
    if (!progreso) {
      return res.status(404).json({ error: 'El anime no está en esta lista' });
    }

    // No permitir poner más episodios de los que tiene el anime
    if (progreso.num_episodios > 0 && episodios_vistos > progreso.num_episodios) {
      return res.status(400).json({ 
        error: `Este anime solo tiene ${progreso.num_episodios} episodios` 
      });
    }

    await Lista.updateProgress(id, animeId, episodios_vistos);

    res.json({
      message: 'Progreso actualizado',
      episodios_vistos,
      num_episodios: progreso.num_episodios
    });

  } catch (error) {
    console.error('Error en updateProgress:', error);
    res.status(500).json({ error: 'Error al actualizar progreso' });
  }
};

module.exports = {
  getUserLists,
  createList,
  getListById,
  updateList,
  deleteList,
  addAnimeToList,
  removeAnimeFromList,
  getListAnimes,
  updateProgress
};