'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CatalogoRefacciones() {
  const router = useRouter();
  const [refacciones, setRefacciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Campos del Formulario
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio_venta: '',
    precio_costo: '',
    cantidad: '1'
  });
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  // Cargar refacciones
  const cargarRefacciones = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refacciones`);
      const data = await res.json();
      setRefacciones(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarRefacciones();
  }, []);

  // Procesar la foto tomada por el celular
  const procesarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Guardar refacción
  const guardarRefaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.precio_venta) return alert('Nombre y Precio de venta son obligatorios.');
    setSubiendo(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refacciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          imagenBase64: fotoBase64
        })
      });

      if (res.ok) {
        setForm({ nombre: '', descripcion: '', precio_venta: '', precio_costo: '', cantidad: '1' });
        setFotoBase64(null);
        setMostrarForm(false);
        cargarRefacciones();
      } else {
        alert('Error al guardar la pieza');
      }
    } catch (error) {
      console.error(error);
    }
    setSubiendo(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6 text-white">
      
      {/* Encabezado */}
      <div className="max-w-6xl w-full mx-auto mb-8 flex justify-between items-center">
        <div>
          <button onClick={() => router.push('/admin')} className="text-slate-400 hover:text-white font-bold transition mb-2 block">
            ⬅️ Volver al Panel
          </button>
          <h2 className="text-3xl font-black uppercase tracking-wider">🛠️ Catálogo de Refacciones</h2>
        </div>
        <button 
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
        >
          {mostrarForm ? '✖️ Cerrar Registro' : '➕ Agregar Refacción'}
        </button>
      </div>

      {/* FORMULARIO DE REGISTRO (Plegable) */}
      {mostrarForm && (
        <div className="max-w-2xl mx-auto bg-white text-slate-800 p-6 rounded-2xl shadow-xl mb-10 transition-all">
          <h3 className="text-xl font-black mb-4 uppercase tracking-wide text-slate-700">Nueva Pieza de Taller</h3>
          <form onSubmit={guardarRefaccion} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Nombre de la refacción</label>
                <input type="text" placeholder="Ej. Pantalla iPhone 13 Pro Max" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold outline-none" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Cantidad en stock</label>
                <input type="number" placeholder="1" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold outline-none" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1">Descripción / Notas técnicas</label>
              <textarea rows={2} placeholder="Ej. Calidad OLED Incell, compatible con modelo A2643." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium outline-none resize-none" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Precio Costo (Proveedor)</label>
                <input type="number" step="0.01" placeholder="$ Costo" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold outline-none text-red-600" value={form.precio_costo} onChange={e => setForm({...form, precio_costo: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Precio Venta (Público)</label>
                <input type="number" step="0.01" placeholder="$ Venta" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold outline-none text-emerald-600" value={form.precio_venta} onChange={e => setForm({...form, precio_venta: e.target.value})} />
              </div>
            </div>

            {/* CAPTURA DE FOTO CON EL CELULAR */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
              <label className="cursor-pointer block">
                <span className="block text-sm font-bold text-blue-600 mb-1">📸 Tomar Foto o Subir Archivo</span>
                <span className="text-xs text-slate-400 block mb-2">Usa la cámara de tu teléfono para capturar la refacción</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={procesarFoto} />
              </label>
              {fotoBase64 && (
                <div className="mt-3 relative w-32 h-32 mx-auto border rounded-lg overflow-hidden shadow">
                  <img src={fotoBase64} alt="Previsualización" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button type="submit" disabled={subiendo} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-black py-4 rounded-xl uppercase tracking-wider transition-colors shadow">
              {subiendo ? 'Guardando en Inventario...' : 'Guardar Refacción'}
            </button>
          </form>
        </div>
      )}

      {/* RENDERIZADO DEL CATÁLOGO (VISTA DE TARJETAS) */}
      {loading ? (
        <div className="text-center font-bold text-lg text-slate-400 mt-10">Cargando catálogo...</div>
      ) : refacciones.length === 0 ? (
        <div className="text-center text-slate-500 font-bold p-10">No hay refacciones registradas en este momento.</div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {refacciones.map((pieza) => (
            <div key={pieza.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-slate-500 transition-all">
              
              {/* Contenedor de la Foto */}
              <div className="w-full h-48 bg-slate-900 relative flex items-center justify-center text-slate-600">
                {pieza.imagen_url ? (
                  <img src={pieza.imagen_url} alt={pieza.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-mono">Sin foto real</span>
                )}
                <span className={`absolute top-3 right-3 text-xs font-black px-2.5 py-1 rounded-full ${pieza.cantidad > 0 ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                  {pieza.cantidad > 0 ? `${pieza.cantidad} disponibles` : 'Agotado'}
                </span>
              </div>

              {/* Contenido / Textos */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-black text-lg text-white leading-tight truncate" title={pieza.nombre}>{pieza.nombre}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 h-8 font-medium">{pieza.descripcion || 'Sin descripción adicional.'}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Público</span>
                    <span className="text-xl font-mono font-black text-emerald-400">${parseFloat(pieza.precio_venta).toFixed(2)}</span>
                  </div>
                  {pieza.precio_costo && (
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Costo</span>
                      <span className="text-sm font-mono font-bold text-slate-400">${parseFloat(pieza.precio_costo).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}