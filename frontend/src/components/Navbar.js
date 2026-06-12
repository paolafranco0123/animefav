'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Search, List, BarChart2, Calendar, User, LogOut, Menu, X, Home } from 'lucide-react';

const NAV_LINKS = [
  { href: '/',         label: 'Inicio',     icon: Home },
  { href: '/search',   label: 'Buscar',     icon: Search },
  { href: '/lists',    label: 'Listas',     icon: List },
  { href: '/stats',    label: 'Stats',      icon: BarChart2 },
  { href: '/calendar', label: 'Calendario', icon: Calendar },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="text-xl font-black tracking-tight shrink-0">
            <span className="text-white">Anime</span>
            <span className="text-rose-500">Fav</span>
          </Link>

          {/* Links desktop — iconos + texto */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-rose-600/15 text-rose-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Derecha desktop */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === '/profile'
                      ? 'bg-rose-600/15 text-rose-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {user.avatar ? (
  <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
) : (
  <User size={15} />
)}
<span className="font-medium max-w-[80px] truncate">{user.nombre}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/10 transition-colors"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Botón menú móvil */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-400 hover:text-white p-2">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-rose-600/15 text-rose-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <div className="border-t border-gray-800 pt-2 mt-2">
            {user ? (
              <>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5">
  {user.avatar ? (
    <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
  ) : (
    <User size={16} />
  )}
  {user.nombre}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-400 w-full">
                  <LogOut size={16} />Cerrar sesión
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center bg-rose-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}