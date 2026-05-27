'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InventarioDashboard() {
  const router = useRouter();
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<'REFACCION' | 'DISPOSITIVO'>('REFACCION');
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  
  // ✨ NUEVO ESTADO: Para controlar la animación de carga de la foto
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [form, setForm] = useState({
    nombre: '', sku: '', tipo: 'REFACCION', cantidad: '0', stock_minimo: '3', 
    precio_compra: '0', precio_venta: '0', descripcion: '',
    color: '', imei: '', numero_serie: '', imagen_url: ''
  });

  const cargarInventario = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventario`)
      .then(res => res.json())
      .then(data => {
        setProductos(data.productos || []);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const abrirModalCrear = () => {
    setEditandoId(null);
    setForm({ 
      nombre: '', sku: '', tipo: filtroTipo, cantidad: '0', stock_minimo: '3', 
      precio_compra: '0', precio_venta: '0', descripcion: '',
      color: '', imei: '', numero_serie: '', imagen_url: '' 
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (p: any) => {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre, 
      sku: p.sku || '', 
      tipo: p.tipo,
      cantidad: p.cantidad.toString(), 
      stock_minimo: p.stock_minimo.toString(),
      precio_compra: p.precio_compra.toString(), 
      precio_venta: p.precio_venta.toString(),
      descripcion: p.descripcion || '',
      color: p.color || '',              
      imei: p.imei || '',                
      numero_serie: p.numero_serie || '',
      imagen_url: p.imagen_url || ''     
    });
    setModalAbierto(true);
  };

  // ✨ NUEVA FUNCIÓN: Procesa el archivo, lo hace base64 y lo manda al endpoint de subida
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoFoto(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Data = reader.result as string;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64: base64Data,
            name: file.name,
            type: file.type
          })
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setForm(prev => ({ ...prev, imagen_url: data.url }));
        } else {
          alert('Error al subir la imagen al servidor');
        }
      } catch (err) {
        console.error("Error en la petición de subida:", err);
        alert('Error de conexión al subir la imagen.');
      } finally {
        setSubiendoFoto(false);
      }
    };
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editandoId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/inventario/${editandoId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/inventario`;
    
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cantidad: parseInt(form.cantidad),
          stock_minimo: parseInt(form.stock_minimo),
          precio_compra: parseFloat(form.precio_compra),
          precio_venta: parseFloat(form.precio_venta),
          color: form.tipo === 'DISPOSITIVO' ? form.color : null,
          imei: form.tipo === 'DISPOSITIVO' ? form.imei : null,
          numero_serie: form.tipo === 'DISPOSITIVO' ? form.numero_serie : null,
          imagen_url: form.tipo === 'DISPOSITIVO' ? form.imagen_url : null
        })
      });

      if (res.ok) {
        setModalAbierto(false);
        cargarInventario();
      } else {
        alert('Ocurrió un error al procesar el artículo.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este artículo del almacén?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventario/${id}`, { method: 'DELETE' });
      if (res.ok) cargarInventario();
    } catch (err) {
      console.error(err);
    }
  };

  const productosFiltrados = productos.filter(p => p.tipo === filtroTipo);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* CABECERA */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">📦 Gestión de Almacén</h1>
            <p className="text-xs text-slate-400 mt-0.5">Control de refacciones para taller y dispositivos de venta directa</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push('/admin')} className="text-xs font-bold border border-slate-200 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-all">
              Volver al Panel
            </button>
            <button onClick={abrirModalCrear} className="text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 px-4 py-2.5 rounded-lg transition-all shadow-sm">
              + Agregar Artículo
            </button>
          </div>
        </div>

        {/* SELECTOR DE CATEGORÍA DE STOCK */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setFiltroTipo('REFACCION')}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${filtroTipo === 'REFACCION' ? 'border-red-600 text-slate-900 bg-white rounded-t-lg' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            🔧 Refacciones para Reparación
          </button>
          <button 
            onClick={() => setFiltroTipo('DISPOSITIVO')}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${filtroTipo === 'DISPOSITIVO' ? 'border-blue-600 text-slate-900 bg-white rounded-t-lg' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            🛍️ Dispositivos para Venta
          </button>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-xs text-slate-400 animate-pulse font-medium">Sincronizando inventario con la base de datos...</div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-400">No hay artículos registrados en esta sección de stock.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Artículo</th>
                  <th className="p-4">SKU / Identificador</th>
                  <th className="p-4 text-center">Cantidad</th>
                  <th className="p-4 text-right">Costo Compra</th>
                  <th className="p-4 text-right">Precio Público</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {productosFiltrados.map((p) => {
                  const esAlertaStock = p.cantidad <= p.stock_minimo;
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${esAlertaStock ? 'bg-red-50/40' : ''}`}>
                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {p.tipo === 'DISPOSITIVO' && p.imagen_url && <span title="Tiene fotografía">🖼️</span>}
                            {p.nombre}
                            {esAlertaStock && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-black uppercase rounded-full tracking-widest animate-pulse">
                                ⚠️ STOCK BAJO
                              </span>
                            )}
                          </div>
                          {p.descripcion && (
                            <span className="text-[10px] text-slate-400 font-normal truncate max-w-[200px]">
                              📝 {p.descripcion}
                            </span>
                          )}
                          {p.tipo === 'DISPOSITIVO' && (
                            <div className="flex gap-2 text-[9px] font-mono text-blue-600 mt-1">
                              {p.color && <span>Color: {p.color}</span>}
                              {p.imei && <span>IMEI: {p.imei}</span>}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-500">{p.sku || 'N/A'}</td>
                      <td className={`p-4 text-center font-black text-sm ${esAlertaStock ? 'text-red-600' : 'text-slate-800'}`}>
                        {p.cantidad} <span className="text-[10px] text-slate-400 font-normal">/ min: {p.stock_minimo}</span>
                      </td>
                      <td className="p-4 text-right font-mono text-slate-600">${Number(p.precio_compra).toFixed(2)}</td>
                      <td className="p-4 text-right font-mono text-emerald-700 font-bold">${Number(p.precio_venta).toFixed(2)}</td>
                      <td className="p-4 text-center space-x-2">
                        <button onClick={() => abrirModalEditar(p)} className="text-slate-600 hover:text-slate-900 font-bold border px-2.5 py-1 rounded hover:bg-white bg-slate-50">Editar</button>
                        <button onClick={() => handleEliminar(p.id)} className="text-red-600 hover:text-red-900 font-bold border border-red-100 px-2.5 py-1 rounded hover:bg-red-50">Borrar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL CRUD */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-tight">{editandoId ? '✏️ Modificar Artículo' : '📦 Registrar en Almacén'}</h3>
                <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>
              
              <form onSubmit={handleGuardar} className="p-6 space-y-4 text-xs font-semibold max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Nombre del Producto / Refacción</label>
                  <input type="text" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej. Pantalla Original Moto G Play 2024" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium outline-none text-sm focus:bg-white" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 uppercase tracking-wider mb-1">SKU / Clave Interna</label>
                    <input type="text" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} placeholder="Opcional" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono outline-none text-sm focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-slate-500 uppercase tracking-wider mb-1">Clasificación</label>
                    <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold outline-none text-sm focus:bg-white">
                      <option value="REFACCION">🔧 Refacción (Taller)</option>
                      <option value="DISPOSITIVO">🛍️ Dispositivo (Venta)</option>
                    </select>
                  </div>
                </div>

                {/* DATOS ESPECÍFICOS DE DISPOSITIVOS */}
                {form.tipo === 'DISPOSITIVO' && (
                  <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-4 space-y-4 my-2">
                    <h4 className="font-black text-blue-600 uppercase tracking-widest text-[10px] mb-2 border-b border-blue-100 pb-1">📱 Especificaciones del Equipo</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Color</label>
                        <input type="text" value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="Ej. Negro Mate" className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium outline-none text-xs focus:border-blue-400" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">IMEI (15 dígitos)</label>
                        <input type="text" value={form.imei} onChange={e => setForm({...form, imei: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono outline-none text-xs focus:border-blue-400" />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Número de Serie</label>
                        <input type="text" value={form.numero_serie} onChange={e => setForm({...form, numero_serie: e.target.value})} placeholder="Opcional" className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono outline-none text-xs focus:border-blue-400" />
                      </div>
                    </div>

                    {/* ✨ ACTUALIZADO: CARGADOR DE IMAGEN NATIVO AL BUCKET */}
                    <div className="pt-2 border-t border-slate-200/60 mt-2">
                      <label className="block text-slate-500 uppercase tracking-wider mb-2 text-[10px]">Fotografía del Dispositivo</label>
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-500 transition-all inline-block">
                          {subiendoFoto ? '⏳ Subiendo a Supabase...' : '📁 Seleccionar Imagen'}
                          <input type="file" accept="image/*" disabled={subiendoFoto} className="hidden" onChange={handleFileChange} />
                        </label>
                        
                        {/* Pequeña miniatura de vista previa si ya se subió la imagen */}
                        {form.imagen_url && (
                          <div className="relative w-12 h-12 border rounded-lg overflow-hidden bg-white shadow-sm">
                            <img src={form.imagen_url} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-3 border-slate-100">
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Descripción Detallada (Opcional)</label>
                  <textarea rows={form.tipo === 'DISPOSITIVO' ? 2 : 4} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Describe el estado del equipo, estética, detalles de garantía..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium outline-none text-sm focus:bg-white resize-y" />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-3 border-slate-100">
                  <div>
                    <label className="block text-slate-500 uppercase tracking-wider mb-1">Cantidad Actual en Stock</label>
                    <input type="number" min="0" required value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-black outline-none focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-slate-500 uppercase tracking-wider mb-1">Stock Mínimo (Alerta)</label>
                    <input type="number" min="1" required value={form.stock_minimo} onChange={e => setForm({...form, stock_minimo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-black outline-none focus:bg-white" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t pt-3 border-slate-100">
                  <div>
                    <label className="block text-slate-500 uppercase tracking-wider mb-1">Costo de Compra ($)</label>
                    <input type="number" step="0.01" min="0" required value={form.precio_compra} onChange={e => setForm({...form, precio_compra: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-sm focus:bg-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 uppercase tracking-wider mb-1">Precio de Venta al Público ($)</label>
                    <input type="number" step="0.01" min="0" required value={form.precio_venta} onChange={e => setForm({...form, precio_venta: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-sm focus:bg-white outline-none text-emerald-700 font-bold" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 border rounded-lg text-slate-500 hover:bg-slate-50">Cancelar</button>
                  <button type="submit" disabled={subiendoFoto} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm disabled:opacity-50">Guardar Cambios</button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}