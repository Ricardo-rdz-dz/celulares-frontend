'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CatalogoRefacciones() {
  const router = useRouter();
  const [refacciones, setRefacciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Listas predefinidas para los selectores
  const tiposRefaccion = [
    "Pantalla", "Batería", "Bocina", "Puerto de carga", "Cámara", "Cámara frontal", 
    "Face ID", "Micrófono", "Bocina superior frontal", "Botón de power", 
    "Bandeja de SIM", "Botones de volumen", "Flex botón de power", 
    "Flex botones de volumen", "Vibrador", "Huella digital", "Flash", "Housing", "Otro"
  ];

  const marcasPopulares = [
    "Apple", "Samsung", "Motorola", "Xiaomi", "Huawei", "Honor", "Oppo", "Vivo", "Genérico", "Otra"
  ];

  const calidadesRefaccion = [
    "Pieza Original Nueva", "Pieza Original Usada", "Calidad Original", 
    "Calidad OLED", "Calidad INCELL", "Pieza Genérica", 
    "Nuevo", "Usado", "No funciona", "Otro"
  ];

  // Campos separados visualmente, pero se unirán al guardar
  const [form, setForm] = useState({
    tipo_pieza: 'Pantalla', 
    marca: 'Apple',
    modelo: '',  
    descripcion_select: 'Pieza Original Nueva',
    descripcion_manual: '',
    precio_venta: '',
    precio_costo: '',
    cantidad: '1'
  });
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const cargarRefacciones = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refacciones`);
      const data = await res.json();
      setRefacciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarRefacciones();
  }, []);

  const procesarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const guardarRefaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.modelo || !form.precio_venta) {
      return alert('El modelo y el precio de venta son obligatorios.');
    }
    
    setSubiendo(true);

    // ✨ EL TRUCO ESTÁ AQUÍ: Unimos Tipo + Marca + Modelo en una sola frase
    const nombreFinal = `${form.tipo_pieza} ${form.marca !== 'Otra' && form.marca !== 'Genérico' ? form.marca : ''} ${form.modelo}`.trim().replace(/\s+/g, ' ');
    
    const descripcionFinal = form.descripcion_select === 'Otro' ? form.descripcion_manual : form.descripcion_select;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refacciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreFinal, // Se manda como si fuera un solo campo a tu BD
          descripcion: descripcionFinal,
          precio_venta: form.precio_venta,
          precio_costo: form.precio_costo,
          cantidad: form.cantidad,
          imagenBase64: fotoBase64
        })
      });

      if (res.ok) {
        setForm({ 
          tipo_pieza: 'Pantalla', marca: 'Apple', modelo: '', 
          descripcion_select: 'Pieza Original Nueva', descripcion_manual: '', 
          precio_venta: '', precio_costo: '', cantidad: '1' 
        });
        setFotoBase64(null);
        setMostrarForm(false);
        cargarRefacciones();
      } else {
        alert('Error al guardar la pieza en el servidor.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión.');
    }
    setSubiendo(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6 text-white">
      
      <div className="max-w-6xl w-full mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={() => router.push('/admin')} className="text-slate-400 hover:text-white font-bold transition mb-2 block">
            ⬅️ Volver al Panel
          </button>
          <h2 className="text-3xl font-black uppercase tracking-wider">🛠️ Alta de Refacciones</h2>
        </div>
        <button 
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg w-full sm:w-auto"
        >
          {mostrarForm ? '✖️ Cerrar Formulario' : '➕ Registrar Pieza'}
        </button>
      </div>

      {mostrarForm && (
        <div className="max-w-2xl mx-auto bg-white text-slate-800 p-6 rounded-3xl shadow-xl mb-10 transition-all">
          <h3 className="text-xl font-black mb-4 uppercase tracking-wide text-slate-700 border-b-2 border-slate-100 pb-3">Nueva Pieza de Taller</h3>
          
          <form onSubmit={guardarRefaccion} className="space-y-5">
            
            {/* Fila 1: Tipo, Marca y Modelo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              {/* TIPO */}
              <div>
                <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">1. Qué es</label>
                <select 
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-slate-700 outline-none cursor-pointer text-sm"
                  value={form.tipo_pieza} 
                  onChange={e => setForm({...form, tipo_pieza: e.target.value})}
                >
                  {tiposRefaccion.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              
              {/* MARCA */}
              <div>
                <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">2. Marca</label>
                <select 
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-slate-700 outline-none cursor-pointer text-sm"
                  value={form.marca} 
                  onChange={e => setForm({...form, marca: e.target.value})}
                >
                  {marcasPopulares.map(marca => (
                    <option key={marca} value={marca}>{marca}</option>
                  ))}
                </select>
              </div>

              {/* MODELO */}
              <div>
                <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">3. Modelo</label>
                <input 
                  type="text" 
                  placeholder="Ej. 13 Pro Max" 
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold outline-none text-sm" 
                  value={form.modelo} 
                  onChange={e => setForm({...form, modelo: e.target.value})} 
                />
              </div>
            </div>

            {/* Fila 2: Descripción Dinámica */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1">Condición / Calidad</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-700 outline-none cursor-pointer mb-2"
                value={form.descripcion_select} 
                onChange={e => setForm({...form, descripcion_select: e.target.value})}
              >
                {calidadesRefaccion.map(calidad => (
                  <option key={calidad} value={calidad}>{calidad}</option>
                ))}
              </select>

              {form.descripcion_select === 'Otro' && (
                <textarea 
                  rows={2} 
                  placeholder="Escribe la descripción personalizada aquí..." 
                  className="w-full bg-slate-50 border-2 border-blue-200 p-3 rounded-xl font-medium outline-none resize-none animate-fadeIn" 
                  value={form.descripcion_manual} 
                  onChange={e => setForm({...form, descripcion_manual: e.target.value})} 
                  autoFocus
                />
              )}
            </div>

            {/* Fila 3: Precios y Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Costo (Prov.)</label>
                <input type="number" step="0.01" placeholder="$" className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold outline-none text-red-600" value={form.precio_costo} onChange={e => setForm({...form, precio_costo: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Precio Público</label>
                <input type="number" step="0.01" placeholder="$" className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold outline-none text-emerald-600" value={form.precio_venta} onChange={e => setForm({...form, precio_venta: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Stock</label>
                <input type="number" placeholder="1" className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold outline-none" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} />
              </div>
            </div>

            {/* CAPTURA DE FOTO CON EL CELULAR */}
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors rounded-xl p-4 text-center bg-slate-50 group">
              <label className="cursor-pointer block">
                <span className="block text-sm font-bold text-blue-600 mb-1 group-hover:text-blue-700">📸 Tomar Foto o Subir Archivo</span>
                <span className="text-xs text-slate-400 block mb-2">Usa la cámara de tu teléfono para capturar la refacción</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={procesarFoto} />
              </label>
              {fotoBase64 && (
                <div className="mt-3 relative w-32 h-32 mx-auto border-4 border-white rounded-lg overflow-hidden shadow-lg">
                  <img src={fotoBase64} alt="Previsualización" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button type="submit" disabled={subiendo} className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-black py-4 rounded-xl uppercase tracking-wider transition-colors shadow-lg">
              {subiendo ? 'Guardando en Almacén...' : 'Guardar Refacción'}
            </button>
          </form>
        </div>
      )}

      {/* RENDERIZADO DEL CATÁLOGO (VISTA DE TARJETAS) */}
      {loading ? (
        <div className="text-center font-bold text-lg text-slate-400 mt-10">Cargando catálogo...</div>
      ) : refacciones.length === 0 ? (
        <div className="text-center text-slate-500 font-bold p-10 bg-slate-800/50 rounded-2xl max-w-2xl mx-auto border border-dashed border-slate-700 mt-8">
          No hay refacciones registradas en este momento. Despliega el formulario para añadir la primera.
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {refacciones.map((pieza) => (
            <div key={pieza.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-slate-500 transition-all group">
              
              <div className="w-full h-48 bg-slate-900 relative flex items-center justify-center text-slate-600 overflow-hidden">
                {pieza.imagen_url ? (
                  <img src={pieza.imagen_url} alt={pieza.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <span className="text-xs font-mono">Sin foto real</span>
                )}
                <span className={`absolute top-3 right-3 text-xs font-black px-2.5 py-1 rounded-full shadow-sm ${pieza.cantidad > 0 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                  {pieza.cantidad > 0 ? `${pieza.cantidad} pz` : 'Agotado'}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-black text-base text-white leading-tight mb-1" title={pieza.nombre}>{pieza.nombre}</h3>
                  <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">{pieza.descripcion || 'Sin descripción'}</p>
                </div>

                <div className="flex justify-between items-end pt-3 border-t border-slate-700/50 mt-2">
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