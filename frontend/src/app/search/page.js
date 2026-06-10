'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { jikanAPI, listasAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Search, Star, Plus, Loader2, SlidersHorizontal, X } from 'lucide-react';
import toast from 'react-hot-toast';

const TIPOS = ['TV', 'Movie', 'OVA', 'Special', 'ONA'];
const ESTADOS = [
  { value: 'airing', label: 'En emisión' },
  { value: 'complete', label: 'Finalizado' },
  { value: 'upcoming', label: 'Próximamente' }
];
const AÑOS = Array.from({ length: 35 }, (_, i) => 2026 - i);
const PUNTUACIONES = [9, 8, 7, 6, 5];

export default function SearchPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [selectedList, setSelectedList] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    tipo: '',
    estado: '',
    año: '',
    puntuacionMin: '',
    genero: ''
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const hasFilters = Object.values(filters).some(v => v !== '');
const buildSearchParams = () => {
  const params = { order_by: 'score', sort: 'desc', limit: 25 };
  if (search) params.q = search;
  if (filters.tipo) params.type = filters.tipo.toLowerCase();
  if (filters.estado) params.status = filters.estado;
  if (filters.puntuacionMin) params.min_score = filters.puntuacionMin;
  if (filters.genero) params.genres = filters.genero;
  return params;
};


  const { data: results, isLoading: searching } = useQuery({
  queryKey: ['search', search, filters],
  queryFn: () => jikanAPI.search(search, 1, filters).then(r => r.data),
  enabled: search.length > 2 || hasFilters
});

  const { data: listas } = useQuery({
    queryKey: ['listas'],
    queryFn: () => listasAPI.getAll().then(r => r.data),
    enabled: !!user
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(query);
  };

  const clearFilter = (key) => setFilters(f => ({ ...f, [key]: '' }));
  const clearAllFilters = () => setFilters({ tipo: '', estado: '', año: '', puntuacionMin: '', genero: '' });

  const handleAdd = async () => {
    if (!selectedList) { toast.error('Selecciona una lista'); return; }
    try {
      await listasAPI.addAnime(selectedList, { malId: selectedAnime.mal_id });
      toast.success(`"${selectedAnime.title}" añadido`);
      setSelectedAnime(null);
      setSelectedList('');
      queryClient.invalidateQueries(['listas']);
    } catch {
      toast.error('No se pudo añadir — quizás ya está en esa lista');
    }
  };

  if (loading || !user) return null;
const animes = (results?.data || []).filter(anime => {
  if (!filters.año) return true;
  const año = anime.aired?.from ? new Date(anime.aired.from).getFullYear() : null;
  return año === parseInt(filters.año);
});

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-black text-white mb-6">Buscar anime</h1>

        {/* Barra de búsqueda */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Busca por título..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-rose-500/50 transition-colors"
            />
          </div>
          <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors">
            Buscar
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
              showFilters || hasFilters
                ? 'bg-rose-600/20 border-rose-500/50 text-rose-400'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
            }`}
          >
            <SlidersHorizontal size={16} />
            Filtros
            {hasFilters && <span className="bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{Object.values(filters).filter(v => v).length}</span>}
          </button>
        </form>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm">Filtros</h3>
              {hasFilters && (
                <button onClick={clearAllFilters} className="text-gray-500 hover:text-rose-400 text-xs transition-colors">
                  Limpiar todo
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-gray-600 text-xs mb-1.5 block">Tipo</label>
                <select
                  value={filters.tipo}
                  onChange={e => setFilters(f => ({ ...f, tipo: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500/50"
                >
                  <option value="">Todos</option>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-xs mb-1.5 block">Estado</label>
                <select
                  value={filters.estado}
                  onChange={e => setFilters(f => ({ ...f, estado: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500/50"
                >
                  <option value="">Todos</option>
                  {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-xs mb-1.5 block">Año</label>
                <select
                  value={filters.año}
                  onChange={e => setFilters(f => ({ ...f, año: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500/50"
                >
                  <option value="">Todos</option>
                  {AÑOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-xs mb-1.5 block">Puntuación mínima</label>
                <select
                  value={filters.puntuacionMin}
                  onChange={e => setFilters(f => ({ ...f, puntuacionMin: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500/50"
                >
                  <option value="">Sin mínimo</option>
                  {PUNTUACIONES.map(p => <option key={p} value={p}>+{p} ⭐</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-xs mb-1.5 block">Género</label>
                <select
                  value={filters.genero}
                  onChange={e => setFilters(f => ({ ...f, genero: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500/50"
                >
                  <option value="">Todos</option>
                  <option value="1">Action</option>
                  <option value="2">Adventure</option>
                  <option value="4">Comedy</option>
                  <option value="7">Mystery</option>
                  <option value="8">Drama</option>
                  <option value="10">Fantasy</option>
                  <option value="14">Horror</option>
                  <option value="22">Romance</option>
                  <option value="24">Sci-Fi</option>
                  <option value="36">Slice of Life</option>
                  <option value="37">Supernatural</option>
                  <option value="41">Suspense</option>
                </select>
              </div>
            </div>

            {/* Filtros activos */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mt-4">
                {filters.tipo && <span className="bg-rose-600/20 text-rose-400 text-xs px-2.5 py-1 rounded-lg border border-rose-500/20 flex items-center gap-1">{filters.tipo} <X size={10} className="cursor-pointer" onClick={() => clearFilter('tipo')} /></span>}
                {filters.estado && <span className="bg-rose-600/20 text-rose-400 text-xs px-2.5 py-1 rounded-lg border border-rose-500/20 flex items-center gap-1">{ESTADOS.find(e => e.value === filters.estado)?.label} <X size={10} className="cursor-pointer" onClick={() => clearFilter('estado')} /></span>}
                {filters.año && <span className="bg-rose-600/20 text-rose-400 text-xs px-2.5 py-1 rounded-lg border border-rose-500/20 flex items-center gap-1">{filters.año} <X size={10} className="cursor-pointer" onClick={() => clearFilter('año')} /></span>}
                {filters.puntuacionMin && <span className="bg-rose-600/20 text-rose-400 text-xs px-2.5 py-1 rounded-lg border border-rose-500/20 flex items-center gap-1">+{filters.puntuacionMin}⭐ <X size={10} className="cursor-pointer" onClick={() => clearFilter('puntuacionMin')} /></span>}
                {filters.genero && <span className="bg-rose-600/20 text-rose-400 text-xs px-2.5 py-1 rounded-lg border border-rose-500/20 flex items-center gap-1">Género activo <X size={10} className="cursor-pointer" onClick={() => clearFilter('genero')} /></span>}
              </div>
            )}
          </div>
        )}

        {searching && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-rose-500 animate-spin" />
          </div>
        )}

        {!searching && animes.length > 0 && (
          <>
            <p className="text-gray-600 text-xs mb-4">{animes.length} resultados</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {animes.map(anime => (
                <div
                  key={anime.mal_id}
                  className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-rose-500/40 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-[2/3] overflow-hidden cursor-pointer" onClick={() => router.push(`/anime/${anime.mal_id}`)}>
                    <img src={anime.images?.jpg?.image_url} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {anime.score && (
                      <div className="absolute top-2 right-2 bg-gray-950/80 text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> {anime.score}
                      </div>
                    )}
                    {anime.type && (
                      <div className="absolute top-2 left-2 bg-gray-950/80 text-gray-400 text-xs px-1.5 py-0.5 rounded-md">
                        {anime.type}
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-white text-xs font-semibold line-clamp-2 leading-tight cursor-pointer hover:text-rose-400" onClick={() => router.push(`/anime/${anime.mal_id}`)}>{anime.title}</h3>
                    {anime.episodes > 0 && <p className="text-gray-500 text-xs mt-0.5">{anime.episodes} eps</p>}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedAnime(anime); }}
                    className="absolute bottom-2 right-2 bg-rose-600 hover:bg-rose-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {!searching && search && animes.length === 0 && (
          <div className="text-center py-20 text-gray-600">No se encontraron resultados para "{search}"</div>
        )}

        {!search && !hasFilters && (
  <div className="text-center py-20 text-gray-700 text-sm">Busca por título o usa los filtros</div>
)}
      </div>

      {selectedAnime && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex gap-4 mb-6">
              <img src={selectedAnime.images?.jpg?.image_url} alt={selectedAnime.title} className="w-16 h-24 object-cover rounded-lg shrink-0" />
              <div>
                <h3 className="text-white font-bold text-sm leading-tight mb-1">{selectedAnime.title}</h3>
                {selectedAnime.score && (
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    <Star size={10} fill="currentColor" /> {selectedAnime.score}
                  </div>
                )}
                {selectedAnime.episodes > 0 && <p className="text-gray-500 text-xs mt-1">{selectedAnime.episodes} episodios</p>}
              </div>
            </div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Añadir a lista</label>
            <select
              value={selectedList}
              onChange={e => setSelectedList(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-500/50 mb-4"
            >
              <option value="">Selecciona una lista...</option>
              {listas?.map(lista => (
                <option key={lista.id_lista} value={lista.id_lista}>{lista.nombre}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => { setSelectedAnime(null); setSelectedList(''); }} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-xl text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={handleAdd} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}