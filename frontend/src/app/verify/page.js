'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    fetch(`http://localhost:3001/api/users/verify/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.message) {
          setStatus('success');
          setTimeout(() => router.push('/login'), 3000);
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-black mb-8">
          <span className="text-white">Anime</span>
          <span className="text-rose-500">Fav</span>
        </h1>

        {status === 'loading' && (
          <>
            <Loader2 size={48} className="text-rose-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Verificando tu cuenta...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">¡Cuenta verificada!</h2>
            <p className="text-gray-400 text-sm mb-6">Tu cuenta ha sido verificada correctamente. Redirigiendo al login...</p>
            <Link href="/login" className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-6 py-3 rounded-xl transition-colors inline-block">
              Ir al login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} className="text-rose-500 mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">Enlace inválido</h2>
            <p className="text-gray-400 text-sm mb-6">El enlace de verificación no es válido o ya ha sido usado.</p>
            <Link href="/login" className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-6 py-3 rounded-xl transition-colors inline-block">
              Volver al login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}