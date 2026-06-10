'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { jikanAPI, listasAPI, puntuacionesAPI, reseniasAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { Star, Plus, Loader2, ChevronLeft, ExternalLink, Tv, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1 items-center flex-wrap">
      {[1,2,3,4,5,6,7,8,9,10].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={20}
            className={`transition-colors ${
              star <= (hover || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-700'
            }`}
          />
        </button>
      ))}
      {value > 0 && <span className="text-white font-bold ml-2">{value}/10</span>}
    </div>
  );
}

export default function AnimeDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const malId = params?.malId;
  const queryClient = useQueryClient();

  const [addingTo, setAddingTo] = useState(false);
  const [selectedList, setSelectedList] = useState('');
  const [myRating, setMyRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [editingReview, setEditingReview] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

const { data: anime, isLoading } = useQuery({
    queryKey: ['anime', malId],
    queryFn: () => jikanAPI.getById(malId).then(r => r.data),
    enabled: !!malId && !!user
  });

  const { data: listas } = useQuery({
    queryKey: ['listas'],
    queryFn: () => listasAPI.getAll().then(r => r.data),
    enabled: !!user
  });

  // Helper para obtener id local del anime
// Importar una sola vez y guardar el id
const { data: localAnimeId } = useQuery({
  queryKey: ['local-anime-id', malId],
  queryFn: async () => {
    const r = await jikanAPI.import(malId);
    return r.data?.animeId;
  },
  enabled: !!malId && !!user && !isLoading && !!anime,
  staleTime: Infinity  
});
// Puntuación
const { data: miPuntuacion } = useQuery({
  queryKey: ['puntuacion', malId],
  queryFn: async () => {
    const r = await puntuacionesAPI.getMyRating(localAnimeId);
    return r.data;
  },
  enabled: !!localAnimeId  // solo cuando ya tenemos el id
});

// Reseña
const { data: miResenia, refetch: refetchResenia } = useQuery({
  queryKey: ['resenia', malId],
  queryFn: async () => {
    const r = await reseniasAPI.getByAnime(localAnimeId);
    return r.data?.reviews?.find(rev => rev.id_usuario === user?.id) || null;
  },
  enabled: !!localAnimeId
});

// Cargar puntuación en el estado cuando llegue
useEffect(() => {
  if (miPuntuacion?.valor) {
    setMyRating(miPuntuacion.valor);
  }
}, [miPuntuacion]);

// Cargar reseña en el estado cuando llegue
useEffect(() => {
  if (miResenia?.texto) {
    setReviewText(miResenia.texto);
  }
}, [miResenia]);

  const addToListMutation = useMutation({
    mutationFn: () => listasAPI.addAnime(selectedList, { malId: Number(malId) }),
    onSuccess: () => {
      toast.success('Anime añadido a la lista');
      setAddingTo(false);
      setSelectedList('');
      queryClient.invalidateQueries(['listas']);
    },
    onError: () => toast.error('No se pudo añadir — quizás ya está en esa lista')
  });

  const rateMutation = useMutation({
  mutationFn: (valor) => {
    if (!localAnimeId) throw new Error('Anime no encontrado');
    return puntuacionesAPI.rate(localAnimeId, valor);
  },
  onSuccess: () => {
    toast.success('Puntuación guardada');
    queryClient.invalidateQueries(['puntuacion', malId]);
    queryClient.invalidateQueries(['my-ratings']);
  },
  onError: () => toast.error('Error al guardar puntuación')
});

  if (loading || !user) return null;
  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 size={32} className="text-rose-500 animate-spin" />
    </div>
  );
if (!anime && !isLoading) return (
  <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
    <p className="text-white text-lg font-bold">No se pudo cargar este anime</p>
    <p className="text-gray-500 text-sm">MyAnimeList no está disponible para este título en este momento</p>
    <button
      onClick={() => router.back()}
      className="text-rose-400 hover:text-rose-300 text-sm transition-colors"
    >
      ← Volver
    </button>
  </main>
);


  const genres = anime.genres?.map(g => g.name) || [];
  const studios = anime.studios?.map(s => s.name).join(', ') || 'Desconocido';
  const trailer = anime.trailer?.embed_url;
  const related = anime.relations?.flatMap(r =>
    r.entry.map(e => ({ ...e, relation: r.relation }))
  ).filter(e => e.type === 'anime').slice(0, 6) || [];

  const fechaEstreno = anime.aired?.from
    ? new Date(anime.aired.from).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <main className="min-h-screen bg-gray-950 pb-16">

      {/* Hero */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={anime.images?.jpg?.large_image_url}
          alt={anime.title}
          className="w-full h-full object-cover object-top scale-110 blur-md opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-gray-950/20" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-950/60 px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm"
        >
          <ChevronLeft size={16} /> Volver
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 relative z-10">

        {/* Cabecera: portada + info */}
        <div className="flex gap-6 mb-8">
          <img
            src={anime.images?.jpg?.large_image_url}
            alt={anime.title}
            className="w-40 h-56 object-cover rounded-2xl shadow-2xl shrink-0 border border-gray-700"
          />
          <div className="flex-1 pt-24">
            <h1 className="text-3xl font-black text-white mb-1 leading-tight">{anime.title}</h1>
            {anime.title_english && anime.title_english !== anime.title && (
              <p className="text-gray-500 text-sm mb-3">{anime.title_english}</p>
            )}

            {/* Géneros */}
            <div className="flex flex-wrap gap-2 mb-4">
              {genres.map(g => (
                <span key={g} className="bg-rose-600/15 text-rose-400 text-xs px-2.5 py-1 rounded-lg border border-rose-500/20">{g}</span>
              ))}
            </div>

            {/* Score MAL + info rápida */}
            <div className="flex items-center gap-5 text-sm text-gray-400 mb-5 flex-wrap">
              {anime.score && (
                <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-xl">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-black text-base">{anime.score}</span>
  
                </div>
              )}
              {anime.episodes && (
                <div className="flex items-center gap-1">
                  <Tv size={13} className="text-gray-500" />
                  <span>{anime.episodes} eps</span>
                </div>
              )}
              {anime.aired?.from && (
                <div className="flex items-center gap-1">
                  <Calendar size={13} className="text-gray-500" />
                  <span>{fechaEstreno}</span>
                </div>
              )}
              {anime.status && (
                <span className={`text-xs px-2.5 py-1 rounded-full border ${
                  anime.status === 'Currently Airing'
                    ? 'text-green-400 border-green-400/30 bg-green-400/10'
                    : 'text-gray-500 border-gray-700'
                }`}>
                  {anime.status === 'Currently Airing' ? 'En emisión' : anime.status}
                </span>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setAddingTo(true)}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                <Plus size={16} /> Añadir a lista
              </button>
              
            </div>
          </div>
        </div>

        {/* Sinopsis */}
        {anime.synopsis && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h2 className="text-white font-bold mb-3">Sinopsis</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{anime.synopsis}</p>
          </div>
        )}

        {/* Trailer + Info detallada */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">

          {/* Trailer */}
          {trailer && (
            <div className="md:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <p className="text-white font-bold px-5 py-4 border-b border-gray-800 text-sm">Trailer</p>
              <div className="aspect-video">
                <iframe src={trailer} className="w-full h-full" allowFullScreen allow="autoplay" />
              </div>
            </div>
          )}

          {/* Info detallada */}
          <div className={`${trailer ? 'md:col-span-2' : 'md:col-span-5'} bg-gray-900 border border-gray-800 rounded-2xl p-5`}>
            <p className="text-white font-bold mb-4 text-sm">Información</p>
            <div className="space-y-3">
              {[
                { label: 'Estudio', value: studios },
                { label: 'Tipo', value: anime.type || '—' },
                { label: 'Estado', value: anime.status || '—' },
                { label: 'Rating edad', value: anime.rating?.replace('- ', '') || '—' },
                { label: 'Temporada', value: anime.season ? `${anime.season} ${anime.year}` : '—' },
                { label: 'Duración ep.', value: anime.duration || '—' },
                { label: 'Fuente', value: anime.source || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4">
                  <span className="text-gray-600 text-xs shrink-0">{label}</span>
                  <span className="text-gray-300 text-xs text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mi puntuación */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold mb-4">Mi puntuación</h2>
          <StarRating
            value={myRating}
            onChange={(val) => { setMyRating(val); rateMutation.mutate(val); }}
          />
          {myRating === 0 && <p className="text-gray-600 text-xs mt-3">Haz clic en una estrella para puntuar este anime</p>}
        </div>
 {/* Mi reseña */}
<div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
  <h2 className="text-white font-bold mb-4">Mi reseña</h2>
  {!editingReview ? (
    <div>
      {reviewText ? (
        <div>
          <p className="text-gray-400 text-sm leading-relaxed mb-3">{reviewText}</p>
          <button
            onClick={() => setEditingReview(true)}
            className="text-xs text-gray-500 hover:text-rose-400 transition-colors"
          >
            Editar reseña
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditingReview(true)}
          className="text-sm text-gray-600 hover:text-rose-400 transition-colors border border-dashed border-gray-700 hover:border-rose-500/40 rounded-xl px-4 py-3 w-full text-left"
        >
          + Escribe tu reseña de este anime...
        </button>
      )}
    </div>
  ) : (
    <div>
      <textarea
        value={reviewText}
        onChange={e => setReviewText(e.target.value)}
        placeholder="Escribe tu opinión sobre este anime..."
        rows={4}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-rose-500/50 resize-none mb-3"
      />
      <div className="flex gap-3">
        <button
          onClick={() => setEditingReview(false)}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 rounded-xl text-sm transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={async () => {
  if (reviewText.trim().length < 10) {
    toast.error('La reseña debe tener al menos 10 caracteres');
    return;
  }
  try {
   const animeId = await getLocalAnimeId();
if (!localAnimeId) { toast.error('No se pudo guardar'); return; }
if (miResenia?.id_resenia) {
  await reseniasAPI.update(miResenia.id_resenia, reviewText.trim());
} else {
  await reseniasAPI.create(localAnimeId, reviewText.trim());
}
    toast.success('Reseña guardada');
    setEditingReview(false);
    refetchResenia();
  } catch {
    toast.error('Error al guardar la reseña');
  }
}}
        
          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 rounded-xl text-sm transition-colors"
        >
          Guardar
        </button>
      </div>
    </div>
  )}
</div>

        {/* Animes relacionados */}
        {related.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">Relacionados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {related.map(r => (
                <Link key={r.mal_id} href={`/anime/${r.mal_id}`}>
                  <div className="bg-gray-800 rounded-xl p-3 hover:bg-gray-750 border border-gray-700 hover:border-rose-500/30 transition-all">
                    <p className="text-white text-xs font-medium line-clamp-2 leading-tight mb-1">{r.name}</p>
                    <p className="text-rose-400 text-xs">{r.relation}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal añadir a lista */}
      {addingTo && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold mb-1">Añadir a lista</h3>
            <p className="text-gray-500 text-sm mb-5 truncate">"{anime.title}"</p>
            <div className="space-y-2 mb-4">
              {listas?.map(lista => (
                <button
                  key={lista.id_lista}
                  onClick={() => setSelectedList(lista.id_lista)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all border ${
                    selectedList === lista.id_lista
                      ? 'bg-rose-600/20 border-rose-500/50 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {lista.nombre}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setAddingTo(false); setSelectedList(''); }} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-xl text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={() => addToListMutation.mutate()} disabled={!selectedList} className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}