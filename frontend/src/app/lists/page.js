'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { listasAPI } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2, Edit2, Check, X, Loader2, Eye, CheckCircle, Clock, PauseCircle, XCircle, BookmarkPlus, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const LIST_CONFIG = {
  'Watching':      { icon: Eye,          color: 'text-blue-400',   bg: 'bg-blue-950/40',    border: 'border-blue-500/30',   accent: '#60a5fa' },
  'Completed':     { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-950/40',   border: 'border-green-500/30',  accent: '#4ade80' },
  'Plan to Watch': { icon: BookmarkPlus, color: 'text-purple-400', bg: 'bg-purple-950/40',  border: 'border-purple-500/30', accent: '#c084fc' },
  'On-Hold':       { icon: PauseCircle,  color: 'text-yellow-400', bg: 'bg-yellow-950/40',  border: 'border-yellow-500/30', accent: '#facc15' },
  'Dropped':       { icon: XCircle,      color: 'text-rose-400',   bg: 'bg-rose-950/40',    border: 'border-rose-500/30',   accent: '#fb7185' },
};

const COLOR_OPTIONS = {
  blue:   { label: 'Azul',    color: 'text-blue-400',   bg: 'bg-blue-950/40',   border: 'border-blue-500/50',   accent: '#60a5fa' },
  green:  { label: 'Verde',   color: 'text-green-400',  bg: 'bg-green-950/40',  border: 'border-green-500/50',  accent: '#4ade80' },
  purple: { label: 'Morado',  color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-500/50', accent: '#c084fc' },
  yellow: { label: 'Amarillo',color: 'text-yellow-400', bg: 'bg-yellow-950/40', border: 'border-yellow-500/50', accent: '#facc15' },
  rose:   { label: 'Rosa',    color: 'text-rose-400',   bg: 'bg-rose-950/40',   border: 'border-rose-500/50',   accent: '#fb7185' },
  orange: { label: 'Naranja', color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-500/50', accent: '#fb923c' },
  cyan:   { label: 'Cyan',    color: 'text-cyan-400',   bg: 'bg-cyan-950/40',   border: 'border-cyan-500/50',   accent: '#22d3ee' },
  gray:   { label: 'Gris',    color: 'text-gray-400',   bg: 'bg-gray-800/60',   border: 'border-gray-500/50',   accent: '#9ca3af' },
};

export default function ListsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeList, setActiveList] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('blue');
  const [showNewList, setShowNewList] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [editName, setEditName] = useState('');
  const [listPreviews, setListPreviews] = useState({});

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const openId = searchParams.get('open');
    if (openId) setActiveList(parseInt(openId));
  }, [searchParams]);

  const { data: listas, isLoading } = useQuery({
    queryKey: ['listas'],
    queryFn: () => listasAPI.getAll().then(r => r.data),
    enabled: !!user
  });

  // Cargar previews de portadas para cada lista
  useEffect(() => {
    if (!listas) return;
    listas.forEach(async (lista) => {
      if (lista.total_animes > 0) {
        try {
          const res = await listasAPI.getAnimes(lista.id_lista);
          const images = res.data.slice(0, 5).map(a => a.imagen_portada).filter(Boolean);
          setListPreviews(prev => ({ ...prev, [lista.id_lista]: images }));
        } catch {}
      }
    });
  }, [listas]);

  const { data: animesEnLista, isLoading: loadingAnimes } = useQuery({
    queryKey: ['lista-animes', activeList],
    queryFn: () => listasAPI.getAnimes(activeList).then(r => r.data),
    enabled: !!activeList
  });

  const createMutation = useMutation({
    mutationFn: () => listasAPI.create(newListName, newListColor),
    onSuccess: () => { queryClient.invalidateQueries(['listas']); toast.success('Lista creada'); setNewListName(''); setNewListColor('blue'); setShowNewList(false); },
    onError: () => toast.error('No se pudo crear la lista')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => listasAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['listas']); toast.success('Lista eliminada'); if (activeList === deleteMutation.variables) setActiveList(null); },
    onError: () => toast.error('No se puede eliminar esta lista')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, nombre }) => listasAPI.update(id, nombre),
    onSuccess: () => { queryClient.invalidateQueries(['listas']); toast.success('Lista actualizada'); setEditingList(null); },
    onError: () => toast.error('No se pudo actualizar')
  });

  const removeAnimeMutation = useMutation({
    mutationFn: ({ listaId, animeId }) => listasAPI.removeAnime(listaId, animeId),
    onSuccess: () => {
      queryClient.invalidateQueries(['lista-animes', activeList]);
      queryClient.invalidateQueries(['listas']);
      toast.success('Anime eliminado');
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ listaId, animeId, episodios }) => listasAPI.updateProgress(listaId, animeId, episodios),
    onSuccess: () => queryClient.invalidateQueries(['lista-animes', activeList])
  });

  if (loading || !user) return null;

  const listaActiva = listas?.find(l => l.id_lista === activeList);
  const predeterminadas = listas?.filter(l => l.tipo === 'predeterminada') || [];
  const personalizadas = listas?.filter(l => l.tipo === 'personalizada') || [];

  // Vista detalle de una lista
  if (activeList && listaActiva) {
    const config = LIST_CONFIG[listaActiva.nombre] || { icon: BookmarkPlus, color: 'text-gray-400', bg: 'bg-gray-900', border: 'border-gray-700', accent: '#9ca3af' };
    const Icon = config.icon;
    const GRADIENTS = {
      'Watching':      'radial-gradient(ellipse at top left, rgba(30,58,138,0.5) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(29,78,216,0.3) 0%, transparent 60%)',
      'Completed':     'radial-gradient(ellipse at top left, rgba(20,83,45,0.5) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(22,163,74,0.25) 0%, transparent 60%)',
      'Plan to Watch': 'radial-gradient(ellipse at top left, rgba(88,28,135,0.5) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(126,34,206,0.25) 0%, transparent 60%)',
      'On-Hold':       'radial-gradient(ellipse at top left, rgba(113,63,18,0.5) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(202,138,4,0.25) 0%, transparent 60%)',
      'Dropped':       'radial-gradient(ellipse at top left, rgba(136,19,55,0.5) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(225,29,72,0.25) 0%, transparent 60%)',
    };
    const gradient = GRADIENTS[listaActiva.nombre] || 'radial-gradient(ellipse at top left, rgba(55,65,81,0.5) 0%, transparent 60%)';

    return (
      <main className="min-h-screen bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: gradient }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,10,15,0.8) 100%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Cabecera */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setActiveList(null)} className="text-gray-500 hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className={`p-2 rounded-xl ${config.bg} border ${config.border}`}>
              <Icon size={20} className={config.color} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{listaActiva.nombre}</h1>
              <p className="text-gray-500 text-sm">{animesEnLista?.length || 0} animes</p>
            </div>
          </div>

          {loadingAnimes ? (
            <div className="flex justify-center py-20"><Loader2 size={32} className="text-rose-500 animate-spin" /></div>
          ) : !animesEnLista?.length ? (
            <div className="text-center py-20">
              <Icon size={48} className={`${config.color} mx-auto mb-4 opacity-30`} />
              <p className="text-gray-600">Esta lista está vacía</p>
              <p className="text-gray-700 text-sm mt-1">Busca animes y añádelos aquí</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {animesEnLista.map(anime => {
                const pct = anime.num_episodios > 0 ? Math.round((anime.episodios_vistos / anime.num_episodios) * 100) : 0;
                return (
                  <div key={anime.id_anime} className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all">
                    {/* Portada */}
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img src={anime.imagen_portada} alt={anime.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {/* Barra de progreso sobre la imagen */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/80">
                        <div className="h-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: config.accent }} />
                      </div>
                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeAnimeMutation.mutate({ listaId: activeList, animeId: anime.id_anime })}
                        className="absolute top-2 right-2 bg-gray-950/70 hover:bg-rose-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="text-white text-xs font-semibold line-clamp-2 leading-tight mb-2">{anime.titulo}</h3>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-gray-600 text-xs">{pct}%</span>
                        {listaActiva?.nombre === 'Completed' ? (
                          <span className="text-green-400 text-xs font-semibold">✓ {anime.num_episodios || anime.episodios_vistos} eps</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={anime.num_episodios || 9999}
                              value={anime.episodios_vistos}
                              onChange={e => updateProgressMutation.mutate({ listaId: activeList, animeId: anime.id_anime, episodios: parseInt(e.target.value) || 0 })}
                              className="w-10 bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-white text-xs focus:outline-none focus:border-rose-500/50 text-center"
                            />
                            <span className="text-gray-600 text-xs">/{anime.num_episodios || '?'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    );
  }

  // Vista general de todas las listas
  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-white">Mis listas</h1>
          <button
            onClick={() => setShowNewList(!showNewList)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} /> Nueva lista
          </button>
        </div>

        {showNewList && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="Nombre de la lista..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-rose-500/50"
                onKeyDown={e => e.key === 'Enter' && createMutation.mutate()}
              />
              <button onClick={() => setShowNewList(false)} className="text-gray-500 hover:text-white px-2"><X size={16} /></button>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Color</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(COLOR_OPTIONS).map(([key, opt]) => (
                  <button
                    key={key}
                    onClick={() => setNewListColor(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${opt.color} ${opt.bg} ${newListColor === key ? opt.border + ' scale-105' : 'border-transparent opacity-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => createMutation.mutate()} className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
              Crear lista
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 size={32} className="text-rose-500 animate-spin" /></div>
        ) : (
          <div className="space-y-8">

            {/* Listas predeterminadas */}
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">Listas predeterminadas</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {predeterminadas.map(lista => {
                  const config = LIST_CONFIG[lista.nombre] || { icon: BookmarkPlus, color: 'text-gray-400', bg: 'bg-gray-900', border: 'border-gray-700', accent: '#9ca3af' };
                  const Icon = config.icon;
                  const previews = listPreviews[lista.id_lista] || [];
                  return (
                    <button
                      key={lista.id_lista}
                      onClick={() => setActiveList(lista.id_lista)}
                      className={`${config.bg} border ${config.border} rounded-2xl p-5 hover:brightness-110 transition-all text-left group relative overflow-hidden`}
                    >
                      {/* Glow de fondo */}
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle, ${config.accent} 0%, transparent 70%)`, filter: 'blur(20px)' }} />

                      {/* Cabecera */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-black/20">
                          <Icon size={20} className={config.color} />
                        </div>
                        {/* Número grande */}
                        <span className={`text-3xl font-black ${config.color} opacity-90`}>{lista.total_animes || 0}</span>
                      </div>

                      {/* Nombre */}
                      <p className={`font-bold text-sm ${config.color} mb-3`}>{lista.nombre}</p>

                      {/* Mini portadas apiladas */}
                      {previews.length > 0 ? (
                        <div className="flex items-center">
                          {previews.slice(0, 5).map((src, i) => (
                            <div
                              key={i}
                              className="w-7 h-7 rounded-full overflow-hidden border-2 border-gray-950 shrink-0"
                              style={{ marginLeft: i > 0 ? '-8px' : '0', zIndex: previews.length - i }}
                            >
                              <img src={src} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {lista.total_animes > 5 && (
                            <div className="w-7 h-7 rounded-full bg-gray-800 border-2 border-gray-950 flex items-center justify-center -ml-2">
                              <span className="text-gray-400 text-[9px] font-bold">+{lista.total_animes - 5}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-700 text-xs">Sin animes aún</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Listas personalizadas */}
            {personalizadas.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">Mis listas</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {personalizadas.map(lista => {
                    const colP = COLOR_OPTIONS[lista.color] || COLOR_OPTIONS.gray;
                    return (
                    <div key={lista.id_lista} className={`flex items-center gap-4 p-4 ${colP.bg} border ${colP.border} rounded-2xl group relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle, ${colP.accent} 0%, transparent 70%)`, filter: 'blur(15px)' }} />
                      {editingList === lista.id_lista ? (
                        <>
                          <input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-rose-500/50"
                          />
                          <button onClick={() => updateMutation.mutate({ id: lista.id_lista, nombre: editName })} className="text-green-400 hover:text-green-300 p-1"><Check size={16} /></button>
                          <button onClick={() => setEditingList(null)} className="text-gray-500 hover:text-white p-1"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setActiveList(lista.id_lista)} className="flex-1 flex items-center gap-3 text-left">
                            {(() => {
                              const col = COLOR_OPTIONS[lista.color] || COLOR_OPTIONS.gray;
                              return (
                                <div className={`p-3 rounded-xl ${col.bg}`}>
                                  <BookmarkPlus size={20} className={col.color} />
                                </div>
                              );
                            })()}
                            <div>
                              <p className={`font-semibold text-sm ${colP.color}`}>{lista.nombre}</p>
                              <p className="text-gray-600 text-xs mt-0.5">{lista.total_animes || 0} animes</p>
                            </div>
                          </button>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingList(lista.id_lista); setEditName(lista.nombre); }} className="text-gray-600 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"><Edit2 size={14} /></button>
                            <button onClick={() => deleteMutation.mutate(lista.id_lista)} className="text-gray-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </>
                      )}
                    </div>
                  )})}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}