'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    // ✨ CAMBIO AQUÍ: Ahora busca tu token real
    const token = localStorage.getItem('movilplace_token');
    
    if (!token) {
      router.replace('/'); // (O usa '/login' si esa es la ruta de tu inicio de sesión)
    } else {
      setAutorizado(true);
    }
  }, []); 

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return <>{children}</>;
}