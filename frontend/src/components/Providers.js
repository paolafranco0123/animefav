'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { ReactQueryProvider } from '@/lib/queryClient';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export default function Providers({ children }) {
  const pathname = usePathname();
  const showNavbar = pathname !== '/login';

  return (
    <ReactQueryProvider>
      <AuthProvider>
        {showNavbar && <Navbar />}
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151'
            }
          }}
        />
      </AuthProvider>
    </ReactQueryProvider>
  );
}