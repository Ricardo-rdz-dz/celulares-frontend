'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PuntoDeVenta() {
  const router = useRouter();
  
  // Estados
  const [inventario, setInventario] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  
  // Datos de la Venta
  const [formVenta, setFormVenta] = useState({
    metodo_pago: 'Efectivo',
    detalles_extras: 'Caja original y cargador.',
    cantidad: 1
  });

  // 1. Cargar todo el inventario al abrir el Punto de Venta
  useEffect(() => {
    const cargarInventario = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventario`);
        const data = await res.json();
       // ✨ SOLUCIÓN 1: Le decimos que los datos vienen dentro de "productos"
        const listaProductos = data.productos || (Array.isArray(data) ? data : []);
        setInventario(listaProductos);
      } catch (err) {
        console.error("Error al cargar el inventario visual", err);
      }
      setCargandoCatalogo(false);
    };
    cargarInventario();
  }, []);

  const procesarVenta = async () => {
    if (!producto) return;
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: producto.id,
          cantidad: formVenta.cantidad,
          precio_unitario: producto.precio_venta,
          metodo_pago: formVenta.metodo_pago,
          detalles_regalo_accesorios: formVenta.detalles_extras
        })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        // Redirigimos directo a imprimir la nota de venta
        router.push(`/admin/pos/ticket/${data.venta_id}`);
      } else {
        alert(`Error al guardar: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al procesar la venta.');
    }
    setLoading(false);
  };

  // 2. Lógica para filtrar y agrupar el catálogo en tiempo real
  const inventarioFiltrado = inventario.filter(item => 
    item.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
    item.sku?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Orden exacto solicitado
  // ✨ SOLUCIÓN 2: Agregamos cómo se llaman realmente en tu BD para que no los oculte
  const categoriasOrdenadas = ['Celulares', 'Tablets', 'Smartwatch', 'Audífonos', 'Laptops', 'DISPOSITIVO', 'REFACCION'];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-12 px-6">
      
      {/* HEADER POS */}
      <div className="max-w-4xl w-full mb-6 flex justify-between items-center">
        <button onClick={() => router.push('/admin')} className="text-slate-400 hover:text-white font-bold transition">
          ⬅️ Volver al panel
        </button>
        <button 
          onClick={() => router.push('/admin/pos/historial')} 
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 transition"
        >
          📋 Ver Registro de Ventas
        </button>
        <h2 className="text-xl font-black text-white uppercase tracking-widest">🛒 Punto de Venta</h2>
      </div>

      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
        
        {/* BUSCADOR INTELIGENTE (Filtra la lista de abajo o acepta pistola de código de barras) */}
        {!producto && (
          <div className="mb-8 border-b-2 border-slate-100 pb-8">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Buscar artículo por Nombre o SKU
            </label>
            <input 
              type="text" autoFocus
              placeholder="Ej. iPhone 13 o SKU M-001"
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-xl p-4 font-bold text-xl outline-none"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        )}

        {/* =========================================================================
            VISTA 1: CATÁLOGO VISUAL AGRUPADO (Aparece si no hay producto seleccionado)
            ========================================================================= */}
        {!producto && (
          <div className="animate-fadeIn">
            {cargandoCatalogo ? (
              <div className="text-center text-slate-400 font-bold py-10">Cargando inventario para venta...</div>
            ) : inventarioFiltrado.length === 0 ? (
              <div className="text-center text-red-400 font-bold py-10">No se encontraron artículos con esa búsqueda.</div>
            ) : (
              // Agrupamos dinámicamente según el orden solicitado
              categoriasOrdenadas.map(categoria => {
                const itemsEnCategoria = inventarioFiltrado.filter(item => item.tipo?.toLowerCase() === categoria.toLowerCase());
                
                if (itemsEnCategoria.length === 0) return null; // Si no hay equipos en esta categoría, no la dibuja

                return (
                  <div key={categoria} className="mb-8">
                    <h3 className="font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">
                      {categoria}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {itemsEnCategoria.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => setProducto(item)}
                          className="border-2 border-slate-100 hover:border-blue-500 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-1 rounded-md font-bold block w-fit mb-2 group-hover:bg-blue-100 group-hover:text-blue-600">
                              SKU: {item.sku}
                            </span>
                            <h4 className="font-black text-slate-800 text-sm leading-tight">{item.nombre}</h4>
                          </div>
                          <div className="mt-4 flex justify-between items-end">
                            <span className={`text-xs font-bold ${item.cantidad > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              Stock: {item.cantidad}
                            </span>
                            <span className="font-black text-lg text-slate-800">${item.precio_venta}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {/* Agregamos una categoría "Otros" por si tienes artículos que no caben en las 5 principales */}
            {(() => {
              const otrosItems = inventarioFiltrado.filter(item => !categoriasOrdenadas.map(c => c.toLowerCase()).includes(item.tipo?.toLowerCase()));
              if (otrosItems.length === 0) return null;
              return (
                <div className="mb-8">
                  <h3 className="font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">Otros Artículos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {otrosItems.map(item => (
                      <div key={item.id} onClick={() => setProducto(item)} className="border-2 border-slate-100 hover:border-blue-500 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-1 rounded-md font-bold block w-fit mb-2">SKU: {item.sku}</span>
                          <h4 className="font-black text-slate-800 text-sm leading-tight">{item.nombre}</h4>
                        </div>
                        <div className="mt-4 flex justify-between items-end">
                          <span className={`text-xs font-bold ${item.cantidad > 0 ? 'text-emerald-500' : 'text-red-500'}`}>Stock: {item.cantidad}</span>
                          <span className="font-black text-lg text-slate-800">${item.precio_venta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* =========================================================================
            VISTA 2: ÁREA DE COBRO (Aparece cuando se selecciona un producto)
            ========================================================================= */}
        {producto && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Botón para cancelar selección y volver al catálogo */}
            <button 
              onClick={() => { setProducto(null); setBusqueda(''); }}
              className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              ✖️ Cancelar y elegir otro artículo
            </button>

            {/* Tarjeta del Producto Seleccionado */}
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 flex justify-between items-center">
              <div>
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">{producto.tipo} • SKU: {producto.sku}</p>
                <h3 className="text-2xl font-black text-slate-800">{producto.nombre}</h3>
                <p className="text-sm font-bold text-slate-500 mt-1">
                  Stock Disponible: <span className={producto.cantidad > 0 ? "text-emerald-600" : "text-red-600"}>{producto.cantidad} piezas</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-400 mb-1">Precio Unitario</p>
                <p className="text-3xl font-black text-emerald-500">${producto.precio_venta}</p>
              </div>
            </div>

            {/* Opciones Extra y Notas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-2">¿Qué incluye el equipo? / Regalos</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-xl p-3 font-bold text-slate-700 outline-none cursor-pointer text-sm"
                  value={formVenta.detalles_extras}
                  onChange={e => setFormVenta({...formVenta, detalles_extras: e.target.value})}
                >
                  <option value="Solo equipo (Sin accesorios)">Solo equipo (Sin accesorios)</option>
                  <option value="Caja">Caja</option>
                  <option value="Cargador">Cargador</option>
                  <option value="Caja y Cargador">Caja y Cargador</option>
                  <option value="Vidrio templado">Vidrio templado</option>
                  <option value="Caja y Vidrio templado">Caja y Vidrio templado</option>
                  <option value="Cargador y Vidrio templado">Cargador y Vidrio templado</option>
                  <option value="Caja, Cargador y Vidrio templado">Caja, Cargador y Vidrio templado</option>
                  <option value="Audífonos">Audífonos</option>
                  <option value="SmartWatch">SmartWatch</option>
                  <option value="Caja, Cargador y Audífonos">Caja, Cargador y Audífonos</option>
                  <option value="Caja, Cargador y SmartWatch">Caja, Cargador y SmartWatch</option>
                  <option value="Paquete Premium (Mica, Funda, Cargador)">Paquete Premium (Mica, Funda, Cargador)</option>
                </select>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase mb-2">Método de Pago</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-xl p-3 font-bold outline-none cursor-pointer text-sm"
                    value={formVenta.metodo_pago}
                    onChange={e => setFormVenta({...formVenta, metodo_pago: e.target.value})}
                  >
                    <option value="Efectivo">💵 Efectivo</option>
                    <option value="Transferencia">📱 Transferencia</option>
                    <option value="Tarjeta">💳 Tarjeta (Terminal)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* BOTÓN DE COBRO */}
            <div className="pt-4 mt-2 border-t-2 border-slate-100">
              <button 
                onClick={procesarVenta}
                disabled={loading || producto.cantidad < 1}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-black py-5 rounded-2xl text-xl uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-emerald-500/30 flex justify-between px-8"
              >
                <span>{loading ? 'Procesando...' : 'Cobrar Venta'}</span>
                <span>${(producto.precio_venta * formVenta.cantidad).toFixed(2)}</span>
              </button>
              {producto.cantidad < 1 && (
                <p className="text-center text-red-500 font-bold text-xs mt-3">No puedes vender este artículo porque el stock está en 0.</p>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}