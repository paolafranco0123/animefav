'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { statsAPI, puntuacionesAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, Tv, Star, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';

const COLORS = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs">
        <p className="text-gray-400">{label}</p>
        <p className="text-white font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function StatsPage() {
  const { user, loading } = useAuth();
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

  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 size={32} className="text-rose-500 animate-spin" />
    </div>
  );

  const resumen = stats?.resumen || {};
  const animesPorLista = stats?.animes_por_lista || [];
  const generosFavoritos = stats?.generos_favoritos || [];
  const distribucionPuntuaciones = stats?.distribucion_puntuaciones || [];
  const actividadMensual = stats?.actividad_mensual || [];

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <h1 className="text-2xl font-black text-white mb-8">Estadísticas</h1>

        {/* Cards resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Tv, label: 'Animes totales', value: resumen.total_animes || 0, color: 'text-blue-400' },
            { icon: TrendingUp, label: 'Episodios vistos', value: resumen.total_episodios || 0, color: 'text-purple-400' },
            { icon: Clock, label: 'Tiempo invertido', value: `${resumen.tiempo_invertido?.dias || 0}d`, sub: `${resumen.tiempo_invertido?.horas || 0} horas`, color: 'text-rose-400' },
            { icon: Star, label: 'Puntuación media', value: resumen.puntuacion_media || '—', sub: `${resumen.total_puntuados || 0} animes puntuados`, color: 'text-yellow-400' },
          ].map(({ icon: Icon, label, value, color, sub }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gray-800">
                  <Icon size={18} className={color} />
                </div>
                <span className="text-gray-400 text-sm">{label}</span>
              </div>
              <p className="text-3xl font-black text-white">{value}</p>
              {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Animes por lista */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-5">Animes por lista</h2>
            {animesPorLista.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8">Sin datos aún</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={animesPorLista} barCategoryGap="30%">
                  <XAxis dataKey="nombre" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {animesPorLista.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Géneros favoritos */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-5">Géneros favoritos</h2>
            {generosFavoritos.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8">Sin datos aún</p>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={generosFavoritos} dataKey="total" nameKey="nombre" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {generosFavoritos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
  {generosFavoritos.map((g, i) => {
    const totalGeneros = generosFavoritos.reduce((acc, x) => acc + x.total, 0);
    const pct = Math.round((g.total / totalGeneros) * 100);
    return (
      <div key={g.nombre} className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
        <span className="text-gray-400 text-xs truncate flex-1">{g.nombre}</span>
        <span className="text-gray-500 text-xs">{pct}%</span>
      </div>
    );
  })}
</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Distribución de puntuaciones */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-5">Distribución de puntuaciones</h2>
            {distribucionPuntuaciones.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8">Sin puntuaciones aún</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distribucionPuntuaciones} barCategoryGap="20%">
                  <XAxis dataKey="valor" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="total" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Actividad mensual */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-5">Actividad mensual</h2>
            {actividadMensual.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8">Sin actividad aún</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={actividadMensual.slice().reverse()} barCategoryGap="20%">
                  <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="animes_añadidos" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Mis puntuaciones con portada */}
        {misRatings?.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-5">Mis puntuaciones ({misRatings.length})</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3">
              {misRatings.map(r => (
                <Link key={r.id_puntuacion} href={`/anime/${r.id_anime}`}>
                  <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-rose-500/30 transition-all">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img src={r.imagen_portada} alt={r.titulo} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 to-transparent p-1.5">
                        <div className="flex items-center gap-0.5 justify-center bg-yellow-400/20 border border-yellow-400/30 rounded-lg py-0.5">
                          <Star size={9} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 text-xs font-black">{r.valor}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <p className="text-white text-xs font-semibold line-clamp-1 leading-tight">{r.titulo}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}