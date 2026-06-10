'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { jikanAPI, listasAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Star, TrendingUp, Tv, Search, Loader2, Eye, CheckCircle, Clock, PauseCircle, XCircle, BookmarkPlus } from 'lucide-react';

const LIST_ICONS = {
  'Watching':      { icon: Eye,          color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20' },
  'Completed':     { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20' },
  'Plan to Watch': { icon: BookmarkPlus, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  'On-Hold':       { icon: PauseCircle,  color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  'Dropped':       { icon: XCircle,      color: 'text-rose-400',   bg: 'bg-rose-400/10',   border: 'border-rose-400/20' },
};

function AnimeCard({ anime, onAdd }) {
  const title = anime.title || anime.titulo;
  const image = anime.images?.jpg?.image_url || anime.imagen_portada;
  const score = anime.score;
  const episodes = anime.episodes || anime.num_episodios;
  const router = useRouter();

  return (
    <div className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-rose-500/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => router.push(`/anime/${anime.mal_id}`)}>
      <div className="relative aspect-[2/3] overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {score && (
          <div className="absolute top-2 right-2 bg-gray-950/80 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <Star size={10} fill="currentColor" /> {score}
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(anime.mal_id, title); }}
          className="absolute top-2 left-2 bg-rose-600 hover:bg-rose-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
        >
          <Plus size={12} />
        </button>
      </div>
      <div className="p-3">
        <h3 className="text-white text-xs font-semibold line-clamp-2 leading-tight">{title}</h3>
        {episodes > 0 && <p className="text-gray-500 text-xs mt-1">{episodes} eps</p>}
      </div>
    </div>
  );
}

// para q funcionen algunos animes bug 
const dedupe = (arr) => arr
  ? [...new Map(arr.map(a => [a.mal_id, a])).values()]
  : []; 


export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [search, setSearch] = useState('');
  const [addingTo, setAddingTo] = useState(null); // {malId, titulo}
  const queryClient = useQueryClient();

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

  const { data: searchData, isLoading: loadingSearch } = useQuery({
    queryKey: ['search-home', search],
    queryFn: () => jikanAPI.search(search).then(r => r.data),
    enabled: search.length > 2
  });

  const { data: listasData } = useQuery({
    queryKey: ['listas'],
    queryFn: () => listasAPI.getAll().then(r => r.data),
    enabled: !!user
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchQuery);
  };

  const handleAddToList = async (listaId) => {
    try {
      await listasAPI.addAnime(listaId, { malId: Number(addingTo.malId) });
      toast.success(`"${addingTo.titulo}" añadido`);
      setAddingTo(null);
      queryClient.invalidateQueries(['listas']);
      queryClient.invalidateQueries(['lista-animes', parseInt(listaId)]);
      queryClient.invalidateQueries(['lista-animes', String(listaId)]);
    } catch {
      toast.error('No se pudo añadir — quizás ya está en esa lista');
    }
  };

if (loading || !user) return null;



  const topAnimes = topData?.data?.slice(0, 12) || [];
  const seasonAnimes = seasonData?.data?.slice(0, 12) || [];
  const searchResults = searchData?.data?.slice(0, 12) || [];
  const predeterminadas = listasData?.filter(l => l.tipo === 'predeterminada') || [];

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Saludo */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white">
            こんにちは、<span className="text-rose-500">{user.nombre}</span>
          </h1>
        </div>

        {/* Buscador */}
        <section className="mb-10">
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Busca cualquier anime..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-rose-500/50 transition-colors"
              />
            </div>
            <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors">
              Buscar
            </button>
          </form>

          {loadingSearch && (
            <div className="flex items-center gap-2 mt-4 text-gray-500 text-sm">
              <Loader2 size={16} className="animate-spin" /> Buscando...
            </div>
          )}
          {!loadingSearch && searchResults.length > 0 && (
            <div className="mt-5">
              <p className="text-xs text-gray-500 mb-3">Resultados para "{search}"</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {searchResults.map(anime => (
                  <AnimeCard key={anime.mal_id} anime={anime} onAdd={(malId, titulo) => setAddingTo({ malId, titulo })} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Mis listas */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Mis listas</h2>
            <Link href="/lists" className="text-xs text-gray-500 hover:text-rose-400 transition-colors">Ver todas →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {predeterminadas.map(lista => {
              const config = LIST_ICONS[lista.nombre] || { icon: BookmarkPlus, color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' };
              const Icon = config.icon;
              return (
                <Link
                  key={lista.id_lista}
                  href={`/lists?open=${lista.id_lista}`}
                  className={`${config.bg} border ${config.border} rounded-2xl p-5 flex flex-col items-center gap-3 hover:scale-105 transition-all duration-200 group`}
                >
                  <div className={`${config.color} p-2 rounded-xl bg-white/5`}>
                    <Icon size={22} />
                  </div>
                  <span className={`text-sm font-semibold ${config.color} text-center leading-tight`}>{lista.nombre}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Top Anime */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-rose-500" />
              <h2 className="text-lg font-bold text-white">Top Anime</h2>
            </div>
            <Link href="/search" className="text-xs text-gray-500 hover:text-rose-400 transition-colors">Ver más →</Link>
          </div>
          {loadingTop ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => <div key={i} className="aspect-[2/3] bg-gray-900 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {topAnimes.map(anime => <AnimeCard key={anime.mal_id} anime={anime} onAdd={(malId, titulo) => setAddingTo({ malId, titulo })} />)}
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
            <Link href="/calendar" className="text-xs text-gray-500 hover:text-rose-400 transition-colors">Ver calendario →</Link>
          </div>
          {loadingSeason ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => <div key={i} className="aspect-[2/3] bg-gray-900 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {seasonAnimes.map(anime => <AnimeCard key={anime.mal_id} anime={anime} onAdd={(malId, titulo) => setAddingTo({ malId, titulo })} />)}
            </div>
          )}
        </section>
      </div>

      {/* Modal seleccionar lista */}
      {addingTo && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold mb-1">Añadir a lista</h3>
            <p className="text-gray-500 text-sm mb-5 truncate">"{addingTo.titulo}"</p>
            <div className="space-y-2 mb-4">
              {listasData?.map(lista => {
                const config = LIST_ICONS[lista.nombre] || { icon: BookmarkPlus, color: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-700' };
                const Icon = config.icon;
                return (
                  <button
                    key={lista.id_lista}
                    onClick={() => handleAddToList(lista.id_lista)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-rose-500/40 rounded-xl text-sm text-white transition-all text-left"
                  >
                    <Icon size={16} className={config.color} />
                    {lista.nombre}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setAddingTo(null)} className="w-full py-2.5 text-gray-500 hover:text-white text-sm transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}