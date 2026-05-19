'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CotizadorPublicoDinamico() {
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de selección del cliente
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [reparacion, setReparacion] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalogo`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        // Solo mostramos lo que esté marcado como activo: true
        const activos = (data.catalogo || []).filter((item: any) => item.activo);
        setCatalogo(activos);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  // 🧠 MAGIA DINÁMICA: Procesamos los datos de la base de datos en tiempo real
  const marcasDisponibles = Array.from(new Set(catalogo.map((item) => item.marca)));
  
  const modelosDisponibles = Array.from(
    new Set(catalogo.filter((item) => item.marca === marca).map((item) => item.modelo))
  );

  const reparacionesDisponibles = catalogo.filter(
    (item) => item.marca === marca && item.modelo === modelo
  );

  // Obtener el precio final buscando el item exacto
  const itemSeleccionado = reparacionesDisponibles.find((item) => item.tipo_reparacion === reparacion);
  const precioEstimado = itemSeleccionado ? itemSeleccionado.precio : null;

  const agendarPorWhatsApp = () => {
    if (!precioEstimado) return;
    const numeroTaller = '526861234567'; // Pon aquí el número de tu negocio
    const mensaje = `¡Hola MovilPlace! 👋 Me interesa agendar una reparación.\n\n📱 *Dispositivo:* ${marca} ${modelo}\n🛠️ *Reparación:* ${reparacion}\n💵 *Costo estimado:* $${precioEstimado} MXN\n\n¿Qué horarios tienen disponibles para dar de alta mi equipo?`;
    window.open(`https://wa.me/${numeroTaller}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <nav className="bg-slate-900 text-white py-4 px-6 shadow-md border-b-4 border-red-600">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black tracking-wide uppercase">Movil<span className="text-red-500">Place</span></h1>
          <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Cotizador Online</span>
        
        </div>
      </nav>
      

      <main className="max-w-md w-full mx-auto p-4 my-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cotiza tu Reparación</h2>
            <p className="text-slate-500 text-sm mt-1">Conoce el costo estimado de tu reparación al instante con datos reales de nuestro taller.</p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Sincronizando precios con el taller...</div>
          ) : (
            <div className="space-y-4">
              {/* MARCA */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1 tracking-wider">1. Marca del Equipo</label>
                <select value={marca} onChange={(e) => { setMarca(e.target.value); setModelo(''); setReparacion(''); }} className="w-full bg-slate-50 px-4 py-3 border border-gray-200 rounded-xl outline-none text-slate-800 font-medium appearance-none">
                  <option value="">-- Selecciona una marca --</option>
                  {marcasDisponibles.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* MODELO */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1 tracking-wider">2. Modelo exacto</label>
                <select value={modelo} onChange={(e) => { setModelo(e.target.value); setReparacion(''); }} disabled={!marca} className="w-full bg-slate-50 px-4 py-3 border border-gray-200 rounded-xl outline-none text-slate-800 font-medium appearance-none disabled:opacity-50">
                  <option value="">{marca ? '-- Selecciona el modelo --' : 'Primero elige una marca'}</option>
                  {modelosDisponibles.map((mod) => <option key={mod} value={mod}>{mod}</option>)}
                </select>
              </div>

              {/* REPARACIÓN */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1 tracking-wider">3. Falla o Refacción</label>
                <select value={reparacion} onChange={(e) => setReparacion(e.target.value)} disabled={!modelo} className="w-full bg-slate-50 px-4 py-3 border border-gray-200 rounded-xl outline-none text-slate-800 font-medium appearance-none disabled:opacity-50">
                  <option value="">{modelo ? '-- Selecciona el servicio --' : 'Primero elige el modelo'}</option>
                  {reparacionesDisponibles.map((item) => <option key={item.id} value={item.tipo_reparacion}>{item.tipo_reparacion}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* RESULTADO COMPLETO */}
          {precioEstimado !== null && (
            <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl text-center shadow-lg border-b-4 border-red-600">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Presupuesto Estimado</p>
              <p className="text-4xl font-black text-white">${precioEstimado} <span className="text-sm font-bold text-slate-400">MXN</span></p>
              <p className="text-[11px] text-slate-400 mt-2 leading-tight">*Precio incluye refacción instalada y garantía MovilPlace. El costo puede variar según las condiciones del chasis.</p>
              <button onClick={agendarPorWhatsApp} className="w-full mt-5 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
                <span>💬</span> Agendar esta reparación
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-4 text-[11px] text-slate-400 border-t border-gray-200 bg-white">
        &copy; {new Date().getFullYear()} MovilPlace &bull; Conectado al inventario en tiempo real.
      </footer>
    </div>
  );
}   