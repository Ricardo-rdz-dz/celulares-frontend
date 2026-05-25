'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VentasRefacciones() {
  const router = useRouter();
  const [refacciones, setRefacciones] = useState<any[]>([]);
  const [filtradas, setFiltradas] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  // Control de la pieza seleccionada para vender
  const [seleccionada, setSeleccionada] = useState<any>(null);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [cantidad, setCantidad] = useState(1);
  const [procesando, setProcesando] = useState(false);

  // Cargar las piezas disponibles
  const cargarCatalogo = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refacciones`);
      const data = await res.json();
      // Solo mostramos las que tienen stock mayor a 0 para la venta
      const conStock = data.filter((p: any) => p.cantidad > 0);
      setRefacciones(conStock);
      setFiltradas(conStock);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarCatalogo();
  }, []);

  // Buscador en tiempo real
  useEffect(() => {
    const resultado = refacciones.filter(pieza => 
      pieza.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (pieza.descripcion && pieza.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );
    setFiltradas(resultado);
  }, [busqueda, refacciones]);

  // Ejecutar el cobro
  const finalizarVenta = async () => {
    if (!seleccionada) return;
    setProcesando(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refacciones/vender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refaccion_id: seleccionada.id,
          cantidad,
          metodo_pago: metodoPago
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Al igual que en el POS de equipos, mandamos directo a imprimir el ticket generado
        router.push(`/admin/refacciones/ticket/${data.venta_id}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión al procesar la venta.');
    }
    setProcesando(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6 text-white flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
      
      {/* SECCIÓN IZQUIERDA: CATÁLOGO VISUAL */}
      <div className="flex-1">
        <div className="mb-6">
          <button onClick={() => router.push('/admin')} className="text-slate-400 hover:text-white font-bold transition mb-2 block">
            ⬅️ Volver al Panel
          </button>
          <h2 className="text-3xl font-black uppercase tracking-wider">🛒 Venta de Refacciones</h2>
          <p className="text-slate-400 text-sm mt-1">Selecciona una refacción del catálogo para proceder con la nota de venta comercial.</p>
        </div>

        {/* Buscador de repuestos */}
        <div className="mb-6">
          <input 
            type="text"
            placeholder="🔍 Escribe para buscar... Ej: Pantalla, iPhone, Batería"
            className="w-full bg-slate-800 border-2 border-slate-700 focus:border-blue-500 rounded-2xl p-4 font-bold outline-none transition-colors text-white"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center text-slate-400 font-bold py-10">Cargando catálogo de venta...</div>
        ) : filtradas.length === 0 ? (
          <div className="text-center text-slate-500 font-bold py-10 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
            No se encontraron refacciones disponibles con ese nombre.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtradas.map((pieza) => (
              <div 
                key={pieza.id}
                onClick={() => { setSeleccionada(pieza); setCantidad(1); }}
                className={`bg-slate-800 border-2 rounded-2xl overflow-hidden shadow-md cursor-pointer transition-all flex flex-col justify-between ${seleccionada?.id === pieza.id ? 'border-blue-500 ring-4 ring-blue-500/20 scale-[0.98]' : 'border-slate-700 hover:border-slate-500'}`}
              >
                {/* Mini Imagen */}
                <div className="w-full h-36 bg-slate-950 relative flex items-center justify-center text-slate-600">
                  {pieza.imagen_url ? (
                    <img src={pieza.imagen_url} alt={pieza.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-mono">Sin foto</span>
                  )}
                  <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Stock: {pieza.cantidad} pz
                  </span>
                </div>

                {/* Info Breve */}
                <div className="p-3 bg-slate-800 flex-1 flex flex-col justify-between">
                  <h4 className="font-black text-sm text-white line-clamp-1">{pieza.nombre}</h4>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">Precio público</span>
                    <span className="text-base font-mono font-black text-emerald-400">${parseFloat(pieza.precio_venta).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN DERECHA: PANEL DE COBRO (Fijo a un lado) */}
      <div className="w-full lg:w-96 bg-white text-slate-800 p-6 rounded-3xl shadow-2xl h-fit sticky top-12 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-black uppercase tracking-wide text-slate-700 border-b pb-3 mb-4">Detalle de Salida</h3>
          
          {seleccionada ? (
            <div className="space-y-4">
              {/* Resumen del Item */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-0.5">Artículo Seleccionado</span>
                <p className="font-black text-slate-800 text-base leading-tight">{seleccionada.nombre}</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">Precio unitario: ${seleccionada.precio_venta}</p>
              </div>

              {/* Selector de Cantidad */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Cantidad a vender</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black px-3 py-1 rounded-lg transition"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-lg w-8 text-center">{cantidad}</span>
                  <button 
                    onClick={() => setCantidad(prev => Math.min(seleccionada.cantidad, prev + 1))}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black px-3 py-1 rounded-lg transition"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-400 font-medium">(Máx. {seleccionada.cantidad})</span>
                </div>
              </div>

              {/* Selector de Método de Pago */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Método de Pago</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none cursor-pointer text-sm"
                  value={metodoPago}
                  onChange={e => setMetodoPago(e.target.value)}
                >
                  <option value="Efectivo">💵 Efectivo</option>
                  <option value="Transferencia">📱 Transferencia</option>
                  <option value="Tarjeta">💳 Tarjeta (Terminal)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-medium text-sm">
              👈 Haz clic en cualquier refacción del catálogo para cargar los datos de cobro.
            </div>
          )}
        </div>

        {/* Totalizador y Botón de Acción */}
        {seleccionada && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-500">TOTAL A COBRAR:</span>
              <span className="text-2xl font-mono font-black text-emerald-600">
                ${(seleccionada.precio_venta * cantidad).toFixed(2)}
              </span>
            </div>
            
            <button
              onClick={finalizarVenta}
              disabled={procesando}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 rounded-xl uppercase tracking-wider transition-all text-center text-sm shadow-md shadow-emerald-500/20"
            >
              {procesando ? 'Procesando...' : 'Confirmar Venta y Ticket'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}