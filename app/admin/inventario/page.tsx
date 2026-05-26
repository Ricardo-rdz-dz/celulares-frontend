'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InventarioDashboard() {
  const router = useRouter();
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<'REFACCION' | 'DISPOSITIVO'>('REFACCION');
  
  // Estados para el formulario modal (✨ Se agregó descripcion)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '', sku: '', tipo: 'REFACCION', cantidad: '0', stock_minimo: '3', precio_compra: '0', precio_venta: '0', descripcion: ''
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
    setForm({ nombre: '', sku: '', tipo: filtroTipo, cantidad: '0', stock_minimo: '3', precio_compra: '0', precio_venta: '0', descripcion: '' });
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
      descripcion: p.descripcion || '' // ✨ Carga la descripción si existe
    });
    setModalAbierto(true);
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
          precio_venta: parseFloat(form.precio_venta)
          // La descripción ya va incluida dentro de ...form como texto
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
                            {p.nombre}
                            {esAlertaStock && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-black uppercase rounded-full tracking-widest animate-pulse" title="Resurtido Requerido">
                                ⚠️ STOCK BAJO
                              </span>
                            )}
                          </div>
                          {/* Pequeño indicador visual si tiene descripción */}
                          {p.descripcion && (
                            <span className="text-[10px] text-slate-400 font-normal truncate max-w-[200px]">
                              📝 {p.descripcion}
                            </span>
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

        {/* MODAL CRUD (Crear/Editar) */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-fadeIn">
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

                {/* ✨ NUEVO: Campo de Descripción */}
                <div className="border-t pt-3 border-slate-100">
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">Descripción Detallada (Opcional)</label>
                  <textarea 
                    rows={4} 
                    value={form.descripcion} 
                    onChange={e => setForm({...form, descripcion: e.target.value})} 
                    placeholder="Describe el estado del equipo, estética, si incluye cargador original, detalles de garantía..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium outline-none text-sm focus:bg-white resize-y" 
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-normal">Este texto será visible para tus clientes en la tienda web al hacer clic en el equipo.</p>
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
                  <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm">Guardar Cambios</button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}