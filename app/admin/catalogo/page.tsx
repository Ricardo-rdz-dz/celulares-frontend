'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✨ 1. Importamos el router

export default function AdminCatalogo() {
  const router = useRouter(); // ✨ 2. Inicializamos el router

  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario nuevo item
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [reparacion, setReparacion] = useState('');
  const [precio, setPrecio] = useState('');

  const cargarCatalogo = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalogo`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setCatalogo(data.catalogo || []);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargarCatalogo();
  }, []);

  const agregarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marca || !modelo || !reparacion || !precio) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalogo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marca, modelo, tipo_reparacion: reparacion, precio: Number(precio) })
      });
      if (res.ok) {
        alert('✨ Agregado con éxito');
        setReparacion('');
        setPrecio('');
        cargarCatalogo();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cambiarEstadoItem = async (id: string, activoActual: boolean) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalogo/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !activoActual })
      });
      cargarCatalogo();
    } catch (err) {
      console.error(err);
    }
  };

  const eliminarItem = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este precio por completo?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalogo/${id}`, { method: 'DELETE' });
      if (res.ok) cargarCatalogo();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* ✨ 3. ENCABEZADO CON BOTÓN DE REGRESO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-black text-slate-800 uppercase">⚙️ Catálogo de Precios</h1>
          
          <button 
            onClick={() => router.push('/admin')}
            className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <span>⬅️</span> Volver al Panel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FORMULARIO DE ALTA */}
          <form onSubmit={agregarItem} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 h-fit">
            <h2 className="font-bold text-slate-700 mb-4 border-b pb-2 uppercase text-sm">Nuevo Registro</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">MARCA</label>
                <input type="text" placeholder="Ej. Apple, Samsung" value={marca} onChange={(e) => setMarca(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-slate-800" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">MODELO</label>
                <input type="text" placeholder="Ej. iPhone 13, Galaxy A54" value={modelo} onChange={(e) => setModelo(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-slate-800" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">TIPO DE REPARACIÓN</label>
                <input type="text" placeholder="Ej. Pantalla, Batería, Pin" value={reparacion} onChange={(e) => setReparacion(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-slate-800" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">PRECIO ($)</label>
                <input type="number" placeholder="0.00" value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-slate-800" required />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg mt-2 hover:bg-slate-800 transition-colors">
                ➕ Agregar al Catálogo
              </button>
            </div>
          </form>

          {/* TABLA DE PRECIOS */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 font-bold text-slate-700 border-b text-sm">Precios Vigentes en Base de Datos</div>
            {loading ? (
              <div className="p-10 text-center text-gray-400">Cargando catálogo...</div>
            ) : (
              <div className="overflow-y-auto max-h-[500px]">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white border-b text-slate-400 uppercase font-bold text-xs tracking-wider">
                      <th className="p-3">Equipo</th>
                      <th className="p-3">Servicio</th>
                      <th className="p-3">Precio</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-slate-700">
                    {catalogo.map((item) => (
                      <tr key={item.id} className={`hover:bg-slate-50 ${!item.activo ? 'opacity-40' : ''}`}>
                        <td className="p-3 font-bold">{item.marca} <span className="text-slate-500 font-normal">{item.modelo}</span></td>
                        <td className="p-3">{item.tipo_reparacion}</td>
                        <td className="p-3 font-black text-slate-900">${item.precio}</td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => cambiarEstadoItem(item.id, item.activo)} className={`px-2 py-1 rounded text-xs font-bold ${item.activo ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                            {item.activo ? 'Pausar' : 'Activar'}
                          </button>
                          <button onClick={() => eliminarItem(item.id)} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                            Borrar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {catalogo.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-400">El catálogo está vacío. Agrega el primer servicio a la izquierda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}