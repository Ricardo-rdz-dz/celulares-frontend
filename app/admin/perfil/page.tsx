'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PerfilUsuario() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState(''); // Se deja vacío a menos que se quiera cambiar
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    const userRaw = localStorage.getItem('movilplace_user');
    if (userRaw) {
      const u = JSON.parse(userRaw);
      setUsuario(u);
      setNombre(u.nombre);
      setCorreo(u.correo);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Actualizar el almacenamiento local con los nuevos datos
        localStorage.setItem('movilplace_user', JSON.stringify(data.usuario));
        setMensaje({ tipo: 'success', texto: 'Perfil actualizado correctamente.' });
        setPassword(''); // Limpiamos el campo de password por seguridad
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al actualizar.' });
      }
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'error', texto: 'Error de red al intentar guardar.' });
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) return <div className="p-10 text-center text-sm font-medium text-slate-400">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans text-slate-800 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Cabecera */}
        <div className="px-8 py-5 border-b border-slate-200 bg-white flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">Mi Perfil de Usuario</h2>
            <p className="text-xs text-slate-400 mt-0.5">Gestiona tus credenciales de acceso al sistema</p>
          </div>
          <button 
            onClick={() => router.push('/admin')} 
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded transition-all"
          >
            Volver al Panel
          </button>
        </div>

        {/* Notificaciones */}
        {mensaje.texto && (
          <div className={`mx-8 mt-6 p-3 rounded-lg text-xs font-bold text-center border ${
            mensaje.tipo === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario Conciso */}
        <form onSubmit={handleGuardar} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nombre Completo</label>
            <input 
              type="text" 
              required 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Cambiar Contraseña</label>
            <p className="text-[11px] text-slate-400 mb-2">Deja este campo en blanco si no deseas modificar tu contraseña actual</p>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Escribe la nueva contraseña solo si deseas cambiarla"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 rounded text-slate-600">
              Rol: {usuario.rol}
            </span>
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}