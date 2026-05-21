'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PuntoDeVenta() {
  const router = useRouter();
  
  // Estados
  const [skuBusqueda, setSkuBusqueda] = useState('');
  const [producto, setProducto] = useState<any>(null);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Datos de la Venta
  const [formVenta, setFormVenta] = useState({
    metodo_pago: 'Efectivo',
    detalles_extras: 'Caja original y cargador.', // Un texto por defecto para ahorrar tiempo
    cantidad: 1
  });

  // Función que se dispara al presionar Enter (o al usar el escáner)
  const buscarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuBusqueda) return;
    
    setErrorBusqueda('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventario/sku/${skuBusqueda}`);
      const data = await res.json();
      
      if (data.encontrado) {
        setProducto(data.producto);
      } else {
        setProducto(null);
        setErrorBusqueda('❌ No se encontró ningún artículo con ese código.');
      }
    } catch (err) {
      console.error(err);
      setErrorBusqueda('Error de conexión al buscar.');
    }
  };

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
      
      if (res.ok) {
        if (res.ok) {
        // ✨ En vez de solo limpiar la pantalla, saltamos al ticket de impresión
        router.push(`/admin/pos/ticket/${data.venta_id}`);
      } else {
        alert(`Error: ${data.error}`);
      }
        alert('✅ Venta procesada con éxito. Stock descontado.');
        // Aquí en el futuro enlazaremos la impresión de la Nota de Venta
        setProducto(null);
        setSkuBusqueda('');
        setFormVenta({ metodo_pago: 'Efectivo', detalles_extras: 'Caja original y cargador.', cantidad: 1 });
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error al procesar la venta.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-12 px-6">
      
      <div className="max-w-3xl w-full mb-6 flex justify-between">
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

      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
        
        {/* BUSCADOR (Preparado para Escáner) */}
        <form onSubmit={buscarProducto} className="mb-8 border-b-2 border-slate-100 pb-8">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Escanea o ingresa el Código (SKU)</label>
          <div className="flex gap-3">
            <input 
              type="text" autoFocus
              placeholder="Ej. M-001"
              className="flex-1 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-xl p-4 font-mono font-bold text-xl outline-none uppercase"
              value={skuBusqueda}
              onChange={e => setSkuBusqueda(e.target.value.toUpperCase())}
            />
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 rounded-xl transition-colors">
              Buscar
            </button>
          </div>
          {errorBusqueda && <p className="text-red-500 font-bold text-sm mt-3 animate-pulse">{errorBusqueda}</p>}
        </form>

        {/* ÁREA DE VENTA (Solo aparece si se encuentra el producto) */}
        {producto && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Tarjeta del Producto */}
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 flex justify-between items-center">
              <div>
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">{producto.tipo}</p>
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