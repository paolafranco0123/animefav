'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { statsAPI, puntuacionesAPI, authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Clock, Tv, Star, TrendingUp, Loader2, User, Mail, Pencil, X, Check } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Modal para elegir avatar desde Jikan
function AvatarModal({ onClose, onSelect }) {
  const [busqueda, setBusqueda] = useState('');
  const [search, setSearch] = useState('');
  const [animeSeleccionado, setAnimeSeleccionado] = useState(null);

  const { data: animes, isLoading: buscando } = useQuery({
    queryKey: ['avatar-search', search],
    queryFn: async () => {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(search)}&limit=9&sfw=true`);
      const data = await res.json();
      return data.data;
    },
    enabled: search.length > 2,
    staleTime: Infinity
  });
 

  const { data: personajes, isLoading: cargandoPersonajes } = useQuery({
    queryKey: ['avatar-personajes', animeSeleccionado?.mal_id],
    queryFn: async () => {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${animeSeleccionado.mal_id}/characters`);
      const data = await res.json();
      return data.data?.filter(c => c.character?.images?.jpg?.image_url);
    },
    enabled: !!animeSeleccionado,
    staleTime: Infinity
  });

  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {animeSeleccionado && (
              <button
                onClick={() => setAnimeSeleccionado(null)}
                className="text-gray-500 hover:text-white transition-colors text-sm"
              >
                ← Volver
              </button>
            )}
            <h3 className="text-white font-bold">
              {animeSeleccionado ? animeSeleccionado.title : 'Elige tu avatar'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {!animeSeleccionado ? (
          <>
            {/* Buscador de anime */}
            <div className="flex gap-2 mb-4">
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setSearch(busqueda)}
                placeholder="Busca un anime... (ej: Naruto, One Piece)"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-rose-500/50"
              />
              <button
                onClick={() => setSearch(busqueda)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                Buscar
              </button>
            </div>

            {/* Resultados de animes */}
            {buscando && (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="text-rose-500 animate-spin" />
              </div>
            )}
            {animes && (
              <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {animes.map(anime => (
                  <button
                    key={anime.mal_id}
                    onClick={() => setAnimeSeleccionado(anime)}
                    className="group bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-rose-500/50 transition-all text-left"
                  >
                    <img
                      src={anime.images?.jpg?.image_url}
                      alt={anime.title}
                      className="w-full aspect-[2/3] object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <p className="text-white text-xs font-medium p-2 line-clamp-2">{anime.title}</p>
                  </button>
                ))}
              </div>
            )}
            {!buscando && !animes && (
              <p className="text-gray-600 text-sm text-center py-8">Escribe el nombre de un anime para ver sus personajes</p>
            )}
          </>
        ) : (
          <>
            {/* Personajes del anime */}
            {cargandoPersonajes ? (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="text-rose-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-96 overflow-y-auto pr-1">
                {personajes?.map(c => (
                  <button
                    key={c.character.mal_id}
                   onClick={() => {
  console.log('url avatar:', c.character.images.jpg.image_url);
  onSelect(c.character.images.jpg.image_url);
}}
                    className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-rose-500 transition-all"
                    title={c.character.name}
                  >
                    <img
                      src={c.character.images.jpg.image_url}
                      alt={c.character.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
  
}
export default function ProfilePage() {
 const { user, setUser, loading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => statsAPI.getResumen().then(r => r.data),
    enabled: !!user
  });

  const { data: misRatings } = useQuery({
    queryKey: ['my-ratings'],
    queryFn: () => puntuacionesAPI.getMyRatings().then(r => r.data),
    enabled: !!user
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authAPI.getProfile().then(r => r.data),
    enabled: !!user
  });

const avatarMutation = useMutation({
  mutationFn: (avatarUrl) => authAPI.updateAvatar(avatarUrl),
  onSuccess: (_, avatarUrl) => {
    toast.success('Avatar actualizado');
    const updatedUser = { ...user, avatar: avatarUrl };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setShowAvatarModal(false);
  },
  onError: (error) => {
    console.error('Error avatar:', error?.response?.data || error?.message || error);
    toast.error('Error al actualizar el avatar');
  }
});

  if (loading || !user) return null;

  const resumen = stats?.resumen || {};
 const avatarUrl = user?.avatar;


  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Perfil */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0 group">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-rose-500/30">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-rose-600/20 flex items-center justify-center">
                    <User size={28} className="text-rose-400" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute -bottom-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full transition-colors shadow-lg"
                title="Cambiar avatar"
              >
                <Pencil size={10} />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-black text-white">{user.nombre}</h1>
              <span className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                <Mail size={13} /> {user.email}
              </span>
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="text-gray-600 hover:text-rose-400 text-sm transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Resumen rápido */}
        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Tv, label: 'Animes', value: resumen.total_animes || 0, color: 'text-blue-400' },
              { icon: TrendingUp, label: 'Episodios', value: resumen.total_episodios || 0, color: 'text-purple-400' },
              { icon: Clock, label: 'Días', value: `${resumen.tiempo_invertido?.dias || 0}d`, color: 'text-rose-400', sub: `${resumen.tiempo_invertido?.horas || 0} horas` },
              { icon: Star, label: 'Nota media', value: resumen.puntuacion_media || '—', color: 'text-yellow-400', sub: `${resumen.total_puntuados || 0} puntuados` },
            ].map(({ icon: Icon, label, value, color, sub }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={color} />
                  <span className="text-gray-500 text-xs">{label}</span>
                </div>
                <p className="text-2xl font-black text-white">{value}</p>
                {sub && <p className="text-gray-600 text-xs mt-0.5">{sub}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Mis puntuaciones */}
        {misRatings?.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold text-sm mb-4">Mis puntuaciones ({misRatings.length})</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {misRatings.map(r => (
                <Link key={r.id_puntuacion} href={`/anime/${r.id_anime}`}>
                  <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-rose-500/30 transition-all">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img src={r.imagen_portada} alt={r.titulo} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 to-transparent p-2">
                        <div className="flex items-center gap-1 justify-center bg-yellow-400/20 border border-yellow-400/30 rounded-lg py-0.5">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 text-xs font-black">{r.valor}/10</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{r.titulo}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {misRatings?.length === 0 && !isLoading && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
            <Star size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No has puntuado ningún anime aún</p>
            <Link href="/" className="text-rose-400 text-xs hover:text-rose-300 mt-2 inline-block">Explorar animes →</Link>
          </div>
        )}
      </div>

      {showAvatarModal && (
        <AvatarModal
          onClose={() => setShowAvatarModal(false)}
          onSelect={(url) => avatarMutation.mutate(url)}
        />
      )}
    </main>
  );
}