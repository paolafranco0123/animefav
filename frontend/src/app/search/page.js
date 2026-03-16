'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { jikanAPI, listasAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Search, Star, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [selectedList, setSelectedList] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const { data: results, isLoading: searching } = useQuery({
    queryKey: ['search', search],
    queryFn: () => jikanAPI.search(search).then(r => r.data),
    enabled: search.length > 2
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

  const handleAdd = async () => {
    if (!selectedList) { toast.error('Selecciona una lista'); return; }
    try {
      await listasAPI.addAnime(selectedList, { malId: selectedAnime.mal_id });
      toast.success(`"${selectedAnime.title}" añadido`);
      setSelectedAnime(null);
      setSelectedList('');
      queryClient.invalidateQueries(['listas']);
      queryClient.invalidateQueries(['lista-animes', parseInt(selectedList)]);
    } catch {
      toast.error('No se pudo añadir — quizás ya está en esa lista');
    }
  };

  if (loading || !user) return null;
  const animes = results?.data || [];

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-black text-white mb-6">Buscar anime</h1>

        <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mb-8">
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
        </form>

        {searching && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-rose-500 animate-spin" />
          </div>
        )}

        {!searching && animes.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {animes.map(anime => (
              <div
                key={anime.mal_id}
                onClick={() => setSelectedAnime(anime)}
                className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-rose-500/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img src={anime.images?.jpg?.image_url} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gray-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus size={24} className="text-white" />
                  </div>
                  {anime.score && (
                    <div className="absolute top-2 right-2 bg-gray-950/80 text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> {anime.score}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="text-white text-xs font-semibold line-clamp-2 leading-tight">{anime.title}</h3>
                  {anime.episodes > 0 && <p className="text-gray-500 text-xs mt-0.5">{anime.episodes} eps</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {!searching && search && animes.length === 0 && (
          <div className="text-center py-20 text-gray-600">No se encontraron resultados para "{search}"</div>
        )}

        {!search && (
          <div className="text-center py-20 text-gray-700 text-sm">Escribe al menos 3 caracteres para buscar</div>
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