'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      // Guardar el token y los datos del usuario en el navegador
      localStorage.setItem('movilplace_token', data.token);
      localStorage.setItem('movilplace_user', JSON.stringify(data.usuario));

      // Redirigir al panel administrativo principal
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        
        {/* LOGO Y ENCABEZADO */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black tracking-wide uppercase text-slate-900">
            MOVIL<span className="text-red-600">PLACE</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
            Control de Acceso Interno
          </p>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-lg text-center">
            ⚠️ {error}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="nombre@movilplace.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg text-sm transition-all shadow-sm disabled:opacity-50 mt-2"
          >
            {cargando ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>

      </div>
    </div>
  );
}