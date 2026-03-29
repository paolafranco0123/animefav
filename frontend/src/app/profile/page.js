'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { statsAPI, puntuacionesAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Clock, Tv, Star, TrendingUp, Loader2, User, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

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

  if (loading || !user) return null;

  const resumen = stats?.resumen || {};

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Perfil */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-rose-600/20 border-2 border-rose-500/30 flex items-center justify-center shrink-0">
              <User size={28} className="text-rose-400" />
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
    </main>
  );
}