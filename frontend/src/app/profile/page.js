'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { statsAPI, puntuacionesAPI, authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Clock, Tv, Star, TrendingUp, Loader2, User, Mail, Pencil, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';


const ANIMES_POPULARES = [
  { nombre: 'Naruto', mal_id: 20 },
  { nombre: 'One Piece', mal_id: 21 },
  { nombre: 'Dragon Ball Z', mal_id: 813 },
  { nombre: 'Attack on Titan', mal_id: 16498 },
  { nombre: 'Demon Slayer', mal_id: 38000 },
  { nombre: 'Fullmetal Alchemist', mal_id: 121 },
  { nombre: 'Death Note', mal_id: 1535 },
  { nombre: 'Sword Art Online', mal_id: 11757 },
  { nombre: 'My Hero Academia', mal_id: 31964 },
  { nombre: 'Hunter x Hunter', mal_id: 11061 },
  { nombre: 'Bleach', mal_id: 269 },
  { nombre: 'Tokyo Ghoul', mal_id: 22319 },
  { nombre: 'Blue Lock', mal_id: 54866 },
  { nombre: 'Cowboy Bebop', mal_id: 1 },
];

function AvatarModal({ onClose, onSelect }) {
  const [animeActivo, setAnimeActivo] = useState(ANIMES_POPULARES[0]);
  const [tab, setTab] = useState('predeterminados');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data: personajes, isLoading } = useQuery({
    queryKey: ['avatar-personajes', animeActivo.mal_id],
    queryFn: async () => {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${animeActivo.mal_id}/characters`);
      const data = await res.json();
      return data.data?.filter(c =>
        c.character?.images?.jpg?.image_url &&
        !c.character.images.jpg.image_url.includes('questionmark')
      ) || [];
    },
    staleTime: Infinity
  });

  return (
  <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">Elige tu avatar</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Tabs principales */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('predeterminados')}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all border ${
            tab === 'predeterminados'
              ? 'bg-rose-600 border-rose-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          Personajes
        </button>
        <button
          onClick={() => setTab('subir')}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all border ${
            tab === 'subir'
              ? 'bg-rose-600 border-rose-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          Subir foto
        </button>
      </div>

      {tab === 'subir' ? (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpg,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setUploading(true);
              try {
                const formData = new FormData();
                formData.append('avatar', file);
                const res = await authAPI.uploadAvatar(formData);
                onSelect(res.data.avatar);
              } catch {
                toast.error('Error al subir la imagen');
              } finally {
                setUploading(false);
              }
            }}
          />
          <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center">
            <User size={32} className="text-gray-600" />
          </div>
          <p className="text-gray-400 text-sm">JPG, PNG o WEBP — máximo 10MB</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : null}
            {uploading ? 'Subiendo...' : 'Elegir imagen'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap mb-4">
            {ANIMES_POPULARES.map(anime => (
              <button
                key={anime.mal_id}
                onClick={() => setAnimeActivo(anime)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all border ${
                  animeActivo.mal_id === anime.mal_id
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
              >
                {anime.nombre}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="text-rose-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-80 overflow-y-auto pr-1">
              {personajes?.map(c => (
                <button
                  key={c.character.mal_id}
                  onClick={() => onSelect(c.character.images.jpg.image_url)}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-rose-500 transition-all"
                  title={c.character.name}
                >
                  <img
                    src={c.character.images.jpg.image_url}
                    alt={c.character.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-950/80 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs text-center truncate">{c.character.name}</p>
                  </div>
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

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
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