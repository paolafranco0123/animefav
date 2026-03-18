'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { jikanAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Loader2, Clock, Tv } from 'lucide-react';

// Convierte hora JST (UTC+9) a hora española (UTC+1 invierno / UTC+2 verano)
function jstToSpain(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  // JST es UTC+9, España en invierno UTC+1 (diferencia -8h), verano UTC+2 (-7h)
  const now = new Date();
  const month = now.getMonth() + 1;
  const isDST = month >= 3 && month <= 10; // aproximación horario verano
  const offset = isDST ? -8 : -9;
  let spainH = (h + offset + 24) % 24;
  return `${String(spainH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const DIAS = {
  'Mondays':    'Lunes',
  'Tuesdays':   'Martes',
  'Wednesdays': 'Miércoles',
  'Thursdays':  'Jueves',
  'Fridays':    'Viernes',
  'Saturdays':  'Sábado',
  'Sundays':    'Domingo',
  'Unknown':    'Sin fecha',
};

const DIA_ORDER = ['Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays','Sundays','Unknown'];

export default function CalendarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['calendario'],
    queryFn: () => jikanAPI.getCalendario().then(r => r.data),
    enabled: !!user
  });

  if (loading || !user) return null;

  const animes = data?.data || [];

  // Agrupar por día de emisión
  const porDia = DIA_ORDER.reduce((acc, dia) => {
    const items = animes.filter(a => a.dia_emision === dia);
    if (items.length > 0) acc[dia] = items;
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center gap-3 mb-8">
          <Tv size={22} className="text-rose-500" />
          <h1 className="text-2xl font-black text-white">Calendario de emisiones</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="text-rose-500 animate-spin" />
          </div>
        ) : animes.length === 0 ? (
          <div className="text-center py-20">
            <Tv size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No tienes animes en emisión</p>
            <p className="text-gray-700 text-sm mt-1">Añade animes a tu lista "Watching" para verlos aquí</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(porDia).map(([dia, items]) => (
              <div key={dia}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-white font-bold">{DIAS[dia]}</h2>
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-gray-600 text-xs">{items.length} anime{items.length > 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map(anime => (
                    <div key={anime.mal_id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex gap-3 p-3 hover:border-gray-700 transition-colors">
                      <img
                        src={anime.imagen}
                        alt={anime.titulo}
                        className="w-14 h-20 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-sm font-semibold line-clamp-2 leading-tight mb-2">{anime.titulo}</h3>
                        {anime.hora_emision && (
                          <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                            <Clock size={11} />
                            <span>{jstToSpain(anime.hora_emision)} (España)</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                          <Tv size={11} />
                          <span>{anime.episodios_vistos}/{anime.episodios_totales || '?'} eps</span>
                        </div>
                        {anime.score && (
                          <div className="inline-flex items-center gap-1 bg-yellow-400/10 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-lg">
                            ★ {anime.score}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}