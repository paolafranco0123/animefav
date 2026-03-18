'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { statsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, Tv, Star, TrendingUp, Loader2, User, Mail, Calendar } from 'lucide-react';

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

  if (loading || !user) return null;

  const resumen = stats?.resumen || {};
  const animesPorLista = stats?.animes_por_lista || [];
  const generosFavoritos = stats?.generos_favoritos || [];
  const distribucionPuntuaciones = stats?.distribucion_puntuaciones || [];

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Perfil */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-rose-600/20 border-2 border-rose-500/30 flex items-center justify-center shrink-0">
              <User size={28} className="text-rose-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-white">{user.nombre}</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <Mail size={13} /> {user.email}
                </span>
              </div>
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="text-gray-600 hover:text-rose-400 text-sm transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="text-rose-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Cards resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

            {/* Gráficas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Animes por lista */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-white font-bold text-sm mb-5">Animes por lista</h2>
                {animesPorLista.length === 0 ? (
                  <p className="text-gray-600 text-xs text-center py-8">Sin datos aún</p>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={animesPorLista} barCategoryGap="30%">
                      <XAxis dataKey="nombre" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {animesPorLista.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Géneros favoritos */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-white font-bold text-sm mb-5">Géneros favoritos</h2>
                {generosFavoritos.length === 0 ? (
                  <p className="text-gray-600 text-xs text-center py-8">Sin datos aún</p>
                ) : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="50%" height={160}>
                      <PieChart>
                        <Pie data={generosFavoritos} dataKey="total" nameKey="nombre" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                          {generosFavoritos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5">
                      {generosFavoritos.map((g, i) => (
                        <div key={g.nombre} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-gray-400 text-xs truncate flex-1">{g.nombre}</span>
                          <span className="text-white text-xs font-bold">{g.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Distribución puntuaciones */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-sm mb-5">Distribución de puntuaciones</h2>
              {distribucionPuntuaciones.length === 0 ? (
                <p className="text-gray-600 text-xs text-center py-8">No has puntuado ningún anime aún</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={distribucionPuntuaciones} barCategoryGap="20%">
                    <XAxis dataKey="valor" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}