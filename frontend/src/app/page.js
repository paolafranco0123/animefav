'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { jikanAPI, listasAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Star, TrendingUp, Tv } from 'lucide-react';

function AnimeCard({ anime, onAdd }) {
  const title = anime.title || anime.titulo;
  const image = anime.images?.jpg?.image_url || anime.imagen_portada;
  const score = anime.score;
  const episodes = anime.episodes || anime.num_episodios;
  const malId = anime.mal_id;

  return (
    <div className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-rose-500/40 transition-all duration-300 hover:-translate-y-1">
      {/* Imagen */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay con botón al hacer hover */}
        <div className="absolute inset-0 bg-gray-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onAdd(malId, title)}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus size={14} /> Añadir a lista
          </button>
        </div>
        {/* Score badge */}
        {score && (
          <div className="absolute top-2 right-2 bg-gray-950/80 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <Star size={10} fill="currentColor" /> {score}
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-3">
        <h3 className="text-white text-xs font-semibold line-clamp-2 leading-tight">{title}</h3>
        {episodes > 0 && (
          <p className="text-gray-500 text-xs mt-1">{episodes} eps</p>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const { data: topData, isLoading: loadingTop } = useQuery({
    queryKey: ['top-anime'],
    queryFn: () => jikanAPI.getTop(1).then(r => r.data),
    enabled: !!user
  });

  const { data: seasonData, isLoading: loadingSeason } = useQuery({
    queryKey: ['current-season'],
    queryFn: () => jikanAPI.getCurrentSeason().then(r => r.data),
    enabled: !!user
  });

  const { data: listasData } = useQuery({
    queryKey: ['listas'],
    queryFn: () => listasAPI.getAll().then(r => r.data),
    enabled: !!user
  });

  const handleAdd = async (malId, titulo) => {
    if (!listasData?.length) {
      toast.error('No tienes listas disponibles');
      return;
    }
    // Añadir a "Plan to Watch" por defecto
    const planList = listasData.find(l => l.nombre === 'Plan to Watch');
    if (!planList) {
      toast.error('No se encontró la lista Plan to Watch');
      return;
    }
    try {
      await listasAPI.addAnime(planList.id_lista, { malId });
      toast.success(`"${titulo}" añadido a Plan to Watch`);
    } catch {
      toast.error('No se pudo añadir el anime');
    }
  };

  if (loading || !user) return null;

  const topAnimes = topData?.data?.slice(0, 12) || [];
  const seasonAnimes = seasonData?.data?.slice(0, 12) || [];

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Saludo */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white">
            こんにちは、<span className="text-rose-500">{user.nombre}</span>
          </h1>
        </div>

        {/* Top Anime */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-rose-500" />
              <h2 className="text-lg font-bold text-white">Top Anime</h2>
            </div>
            <Link href="/search" className="text-xs text-gray-500 hover:text-rose-400 transition-colors">
              Ver más →
            </Link>
          </div>

          {loadingTop ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-900 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {topAnimes.map(anime => (
                <AnimeCard key={anime.mal_id} anime={anime} onAdd={handleAdd} />
              ))}
            </div>
          )}
        </section>

        {/* Temporada actual */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Tv size={18} className="text-rose-500" />
              <h2 className="text-lg font-bold text-white">Temporada actual</h2>
            </div>
            <Link href="/calendar" className="text-xs text-gray-500 hover:text-rose-400 transition-colors">
              Ver calendario →
            </Link>
          </div>

          {loadingSeason ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-900 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {seasonAnimes.map(anime => (
                <AnimeCard key={anime.mal_id} anime={anime} onAdd={handleAdd} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}