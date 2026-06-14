const resenia = require('../models/Resenia');
const Anime = require('../models/Anime');
const ReseniaLike = require('../models/ReseniaLike');
// Crear una resenia
const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { animeId } = req.params;
    const { texto } = req.body;
    
    if (!texto || texto.trim().length < 10) {
      return res.status(400).json({ error: 'La resenia debe tener al menos 10 caracteres' });
    }
    
    // Verificar que el anime existe
    const anime = await Anime.findById(animeId);
    if (!anime) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }
    
    // Verificar si ya reseñó este anime
    const existingReview = await resenia.userHasReviewed(userId, animeId);
    if (existingReview) {
      return res.status(400).json({ 
        error: 'Ya has reseniado este anime',
        reseniaId: existingReview.id_resenia
      });
    }
    
    const reseniaId = await resenia.create(userId, animeId, texto.trim());
    
    res.status(201).json({
      message: 'resenia creada exitosamente',
      reseniaId
    });
    
  } catch (error) {
    console.error('Error en createReview:', error);
    res.status(500).json({ error: 'Error al crear resenia' });
  }
};

// Obtener una resenia específica
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await resenia.findById(id);
    
    if (!review) {
      return res.status(404).json({ error: 'resenia no encontrada' });
    }
    
    res.json(review);
    
  } catch (error) {
    console.error('Error en getReviewById:', error);
    res.status(500).json({ error: 'Error al obtener resenia' });
  }
};

// Obtener todas las resenias de un anime
const getAnimeReviews = async (req, res) => {
  try {
    const { animeId } = req.params;
    const userId = req.user?.id;
    const { limit = 20, offset = 0 } = req.query;

    const reviews = await resenia.getByAnimeId(animeId, parseInt(limit), parseInt(offset));
    const total = await resenia.countByAnimeId(animeId);

    const reviewsConLikes = await Promise.all(reviews.map(async (r) => {
      const likes = await ReseniaLike.countByResenia(r.id_resenia);
      const liked = userId ? await ReseniaLike.userLiked(userId, r.id_resenia) : false;
      return { ...r, likes, liked };
    }));

    const ordenadas = reviewsConLikes.sort((a, b) => b.likes - a.likes);

    res.json({
      reviews: ordenadas,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error en getAnimeReviews:', error);
    res.status(500).json({ error: 'Error al obtener resenias' });
  }
};

// Obtener todas las resenias del usuario autenticado
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const reviews = await resenia.getByUserId(userId);
    
    res.json(reviews);
    
  } catch (error) {
    console.error('Error en getUserReviews:', error);
    res.status(500).json({ error: 'Error al obtener resenias' });
  }
};

// Actualizar una resenia
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { texto } = req.body;
    
    if (!texto || texto.trim().length < 10) {
      return res.status(400).json({ error: 'La resenia debe tener al menos 10 caracteres' });
    }
    
    const affectedRows = await resenia.update(id, userId, texto.trim());
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'resenia no encontrada o no tienes permiso para editarla' });
    }
    
    res.json({ message: 'resenia actualizada exitosamente' });
    
  } catch (error) {
    console.error('Error en updateReview:', error);
    res.status(500).json({ error: 'Error al actualizar resenia' });
  }
};

// Eliminar una resenia
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const affectedRows = await resenia.delete(id, userId);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'resenia no encontrada o no tienes permiso para eliminarla' });
    }
    
    res.json({ message: 'resenia eliminada exitosamente' });
    
  } catch (error) {
    console.error('Error en deleteReview:', error);
    res.status(500).json({ error: 'Error al eliminar resenia' });
  }
};

module.exports = {
  createReview,
  getReviewById,
  getAnimeReviews,
  getUserReviews,
  updateReview,
  deleteReview
};