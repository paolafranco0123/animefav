'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Users, Star, MessageSquare, Trash2, Shield, ShieldOff, Loader2, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function ModalConfirm({ mensaje, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-bold mb-2">¿Estás segura?</h3>
        <p className="text-gray-400 text-sm mb-6">{mensaje}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('dashboard');
  const [confirmModal, setConfirmModal] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) router.push('/');
  }, [user, loading, router]);

  const { data: dashboard } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then(r => r.data),
    enabled: !!user && user.rol === 'admin'
  });

  const { data: usuarios } = useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: () => adminAPI.getUsuarios().then(r => r.data),
    enabled: !!user && user.rol === 'admin' && tab === 'usuarios'
  });

  const { data: resenias } = useQuery({
    queryKey: ['admin-resenias'],
    queryFn: () => adminAPI.getResenias().then(r => r.data),
    enabled: !!user && user.rol === 'admin' && tab === 'resenias'
  });

  const { data: estadisticas } = useQuery({
    queryKey: ['admin-estadisticas'],
    queryFn: () => adminAPI.getEstadisticas().then(r => r.data),
    enabled: !!user && user.rol === 'admin' && tab === 'estadisticas'
  });

  const deleteUsuarioMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteUsuario(id),
    onSuccess: () => {
      toast.success('Usuario eliminado');
      queryClient.invalidateQueries(['admin-usuarios']);
    },
    onError: (e) => toast.error(e?.response?.data?.error || 'Error al eliminar')
  });

  const updateRolMutation = useMutation({
    mutationFn: ({ id, rol }) => adminAPI.updateRol(id, rol),
    onSuccess: () => {
      toast.success('Rol actualizado');
      queryClient.invalidateQueries(['admin-usuarios']);
    },
    onError: () => toast.error('Error al actualizar rol')
  });

  const deleteReseniaMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteResenia(id),
    onSuccess: () => {
      toast.success('Reseña eliminada');
      queryClient.invalidateQueries(['admin-resenias']);
    },
    onError: () => toast.error('Error al eliminar reseña')
  });

  if (loading || !user) return null;
  if (user.rol !== 'admin') return null;

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'resenias', label: 'Reseñas', icon: MessageSquare },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart2 },
  ];

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center gap-3 mb-8">
          <Shield size={24} className="text-rose-500" />
          <h1 className="text-2xl font-black text-white">Panel de Administración</h1>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                tab === id
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === 'dashboard' && dashboard && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Usuarios', value: dashboard.total_usuarios, icon: Users, color: 'text-blue-400' },
                { label: 'Reseñas', value: dashboard.total_resenias, icon: MessageSquare, color: 'text-green-400' },
                { label: 'Puntuaciones', value: dashboard.total_puntuaciones, icon: Star, color: 'text-yellow-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className={color} />
                    <span className="text-gray-500 text-xs">{label}</span>
                  </div>
                  <p className="text-3xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
            {dashboard.registros_por_dia?.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-white font-bold mb-4 text-sm">Registros últimos 7 días</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dashboard.registros_por_dia}>
                    <XAxis dataKey="fecha" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }} />
                    <Bar dataKey="total" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Usuarios */}
       {tab === 'usuarios' && (
  <div className="space-y-4">
    <input
      value={busqueda}
      onChange={e => setBusqueda(e.target.value)}
      placeholder="Buscar por nombre o email..."
      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-rose-500/50"
    />
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left text-gray-500 text-xs font-medium px-5 py-3">Usuario</th>
            <th className="text-left text-gray-500 text-xs font-medium px-5 py-3">Email</th>
            <th className="text-left text-gray-500 text-xs font-medium px-5 py-3">Rol</th>
            <th className="text-left text-gray-500 text-xs font-medium px-5 py-3">Listas</th>
            <th className="text-left text-gray-500 text-xs font-medium px-5 py-3">Puntuaciones</th>
            <th className="text-left text-gray-500 text-xs font-medium px-5 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios
            ?.filter(u =>
              u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
              u.email.toLowerCase().includes(busqueda.toLowerCase())
            )
            .map(u => (
              <tr key={u.id_usuario} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.nombre} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-rose-600/20 flex items-center justify-center">
                        <Users size={14} className="text-rose-400" />
                      </div>
                    )}
                    <span className="text-white text-sm font-medium">{u.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-400 text-sm">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-lg border ${
                    u.rol === 'admin'
                      ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                      : 'text-gray-400 border-gray-700 bg-gray-800'
                  }`}>
                    {u.rol}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-sm">{u.total_listas}</td>
                <td className="px-5 py-3 text-gray-400 text-sm">{u.total_puntuaciones}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateRolMutation.mutate({
                        id: u.id_usuario,
                        rol: u.rol === 'admin' ? 'user' : 'admin'
                      })}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-900/10 transition-colors"
                      title={u.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                    >
                      {u.rol === 'admin' ? <ShieldOff size={14} /> : <Shield size={14} />}
                    </button>
                    <button
                      onClick={() => setConfirmModal({
                        mensaje: `Se eliminará al usuario "${u.nombre}" permanentemente.`,
                        onConfirm: () => {
                          deleteUsuarioMutation.mutate(u.id_usuario);
                          setConfirmModal(null);
                        }
                      })}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/10 transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
)}
        

        {/* Reseñas */}
        {tab === 'resenias' && (
          <div className="space-y-3">
            {resenias?.map(r => (
              <div key={r.id_resenia} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-rose-400 text-xs font-medium">{r.autor}</span>
                      <span className="text-gray-600 text-xs">sobre</span>
                      <span className="text-white text-xs font-medium">{r.anime}</span>
                      <span className="text-gray-600 text-xs ml-auto">
                        {new Date(r.fecha).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{r.texto}</p>
                  </div>
                  <button
                    onClick={() => setConfirmModal({
                      mensaje: 'Se eliminará esta reseña permanentemente.',
                      onConfirm: () => {
                        deleteReseniaMutation.mutate(r.id_resenia);
                        setConfirmModal(null);
                      }
                    })}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/10 transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {resenias?.length === 0 && (
              <div className="text-center py-12 text-gray-600">No hay reseñas todavía</div>
            )}
          </div>
        )}

        {/* Estadísticas */}
        {tab === 'estadisticas' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4 text-sm">Animes más añadidos a listas</h2>
              {estadisticas?.animes_populares?.length > 0 ? (
                <div className="space-y-3">
                  {estadisticas.animes_populares.map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {a.imagen_portada && (
                        <img src={a.imagen_portada} alt={a.titulo} className="w-8 h-10 object-cover rounded shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{a.titulo}</p>
                        <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-rose-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, (a.veces_en_listas / (estadisticas.animes_populares[0]?.veces_en_listas || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs shrink-0">{a.veces_en_listas} listas</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No hay datos suficientes todavía</p>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4 text-sm">Mejor puntuados por usuarios</h2>
              {estadisticas?.puntuaciones_promedio?.length > 0 ? (
                <div className="space-y-2">
                  {estadisticas.puntuaciones_promedio.map((a, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                      <span className="text-white text-sm">{a.titulo}</span>
                      <div className="flex items-center gap-2">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 text-sm font-bold">{a.promedio}</span>
                        <span className="text-gray-600 text-xs">({a.total_votos} votos)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No hay puntuaciones todavía</p>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4 text-sm">Usuarios más activos</h2>
              {estadisticas?.usuarios_activos?.length > 0 ? (
                <div className="space-y-3">
                  {estadisticas.usuarios_activos.map((u, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.nombre} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-rose-600/20 flex items-center justify-center">
                          <Users size={14} className="text-rose-400" />
                        </div>
                      )}
                      <span className="text-white text-sm flex-1">{u.nombre}</span>
                      <span className="text-gray-400 text-xs">{u.animes_en_listas} animes</span>
                      <span className="text-gray-600 text-xs">·</span>
                      <span className="text-gray-400 text-xs">{u.puntuaciones} puntuaciones</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No hay usuarios activos todavía</p>
              )}
            </div>
          </div>
        )}

      </div>

      {confirmModal && (
        <ModalConfirm
          mensaje={confirmModal.mensaje}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </main>
  );
}