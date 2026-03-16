'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const ANIME_IMAGES = [
  'https://myanimelist.net/images/anime/1171/109222.jpg', // jujustu
  'https://cdn.myanimelist.net/images/anime/1208/94745l.jpg', // fullmetal
  'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg', // kimetsu
   'https://myanimelist.net/images/anime/1258/126929.jpg', // blue lock
  'https://myanimelist.net/images/anime/5/20871.jpg', // one piece 
  'https://myanimelist.net/images/anime/1500/139931.jpg', // shangrila
  'https://cdn.myanimelist.net/images/anime/1517/100633l.jpg',//
  'https://cdn.myanimelist.net/images/anime/1079/138100l.jpg', // death note
  'https://cdn.myanimelist.net/images/anime/1337/99013l.jpg' // hunter
 

];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', contraseña: '', fecha_nacimiento: '' });

  const { login, register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.contraseña);
        toast.success('¡Bienvenido de vuelta!');
        router.push('/');
      } else {
        await register(form);
        toast.success('Cuenta creada, ahora inicia sesión');
        setIsLogin(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Algo salió mal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo: mosaico + texto ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-end">

        {/* Mosaico estático 3x3 */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[3px] bg-gray-950">
          {ANIME_IMAGES.map((src, i) => (
            <div key={i} className="overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-gray-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-gray-950" />

        {/* Texto sobre el mosaico */}
        <div className="relative z-10 p-12 pb-16">
          <div className="w-10 h-0.5 bg-red-500 mb-5" />
          <h2 className="text-4xl font-black text-white leading-tight mb-4 tracking-tight">
            Todo tu anime.<br />
            <span className="text-rose-500">Un solo lugar.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Sigue tus series, puntúa lo que ves y descubre qué ver después.
          </p>
        </div>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="w-full lg:w-1/2 bg-gray-950 flex items-center justify-center px-8 py-12 relative">

        {/* Glows */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-900/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Anime<span className="text-rose-500">Fav</span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Tu lista de anime, a tu manera</p>
          </div>

          {/* Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

            {/* Tabs */}
            <div className="flex mb-8 bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  isLogin ? 'bg-rose-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  !isLogin ? 'bg-rose-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder="Tu nombre"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
                <input
                  type="password"
                  name="contraseña"
                  value={form.contraseña}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Fecha de nacimiento <span className="text-gray-600">(opcional)</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={form.fecha_nacimiento}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors mt-2"
              >
                {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}