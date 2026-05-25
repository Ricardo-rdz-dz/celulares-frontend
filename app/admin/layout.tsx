'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const sesion = localStorage.getItem('usuarioActivo');
    if (!sesion) {
      router.replace('/'); 
    } else {
      setAutorizado(true);
    }
  }, [router]);

  if (!autorizado) {
    // Pantalla vacía o de carga rápida para que no se asome nada del sistema
    return <div className="min-h-screen bg-slate-900"></div>;
  }

  return <>{children}</>;
}