'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    // Verificamos la memoria solo una vez al montar el componente
    const sesion = localStorage.getItem('usuarioActivo');
    
    if (!sesion) {
      router.replace('/'); 
    } else {
      setAutorizado(true);
    }
  }, []); // <-- El truco está aquí, los corchetes vacíos evitan el bucle

  if (!autorizado) {
    // Pantalla de carga suave en lo que verifica
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return <>{children}</>;
}