'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('movilplace_token');
    
    if (!token) {
      // ✨ CORRECCIÓN AQUÍ: Mandar al /login exacto, no a la raíz '/'
      router.replace('/login'); 
    } else {
      setAutorizado(true);
    }
  }, [router]); 

  if (!autorizado) {
    // Pantalla de espera oscura mientras procesa el redireccionamiento seguro
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return <>{children}</>;
}