const ReseniaLike = require('../models/ReseniaLike');

const toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await ReseniaLike.toggle(userId, id);
    const total = await ReseniaLike.countByResenia(id);
    res.json({ ...result, total });
  } catch (error) {
    console.error('Error en toggleLike:', error);
    res.status(500).json({ error: 'Error al dar like' });
  }
};

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

    res.json({ reviews: ordenadas, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    console.error('Error en getAnimeReviews:', error);
    res.status(500).json({ error: 'Error al obtener resenias' });
  }
};
module.exports = { toggleLike };