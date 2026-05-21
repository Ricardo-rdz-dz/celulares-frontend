'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HistorialVentas() {
  const router = useRouter();
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ventas`);
        const data = await res.json();
        setVentas(data);
      } catch (error) {
        console.error("Error cargando historial de ventas:", error);
      }
      setLoading(false);
    };
    cargarHistorial();
  }, []);

  if (loading) return <div className="text-center mt-20 font-bold text-white text-lg">Cargando historial de ventas...</div>;

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6">
      
      {/* Encabezado */}
      <div className="max-w-6xl w-full mx-auto mb-6 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <button onClick={() => router.push('/admin/pos')} className="text-slate-400 hover:text-white font-bold transition">
            ⬅️ Volver al POS
          </button>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">📋 Registro de Ventas</h2>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl">
          <p className="text-xs text-slate-400 uppercase font-bold">Total de operaciones</p>
          <p className="text-xl font-mono font-black text-emerald-400 text-right">{ventas.length}</p>
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="max-w-6xl w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {ventas.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold">
            No se ha registrado ninguna venta todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest">
                  <th className="p-4">Folio</th>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Artículo / SKU</th>
                  <th className="p-4">Paquete / Regalos</th>
                  <th className="p-4">Pago</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {ventas.map((venta) => {
                  const dateObj = new Date(venta.created_at);
                  const fecha = dateObj.toLocaleDateString();
                  const hora = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const folioCorto = venta.id.split('-')[0].toUpperCase();

                  return (
                    <tr key={venta.id} className="hover:bg-slate-50 transition-colors">
                      {/* Folio */}
                      <td className="p-4 font-mono font-bold text-blue-600">
                        #V-{folioCorto}
                      </td>
                      {/* Fecha y Hora */}
                      <td className="p-4 leading-tight">
                        <span className="block font-bold">{fecha}</span>
                        <span className="text-xs text-slate-400 font-mono">{hora}</span>
                      </td>
                      {/* Artículo */}
                      <td className="p-4 leading-tight">
                        <span className="block font-black text-slate-800">{venta.inventario?.nombre || 'Artículo eliminado'}</span>
                        <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">SKU: {venta.inventario?.sku || 'N/A'}</span>
                      </td>
                      {/* Detalles / Accesorios */}
                      <td className="p-4 text-xs font-mono text-slate-500 max-w-xs truncate" title={venta.detalles_regalo_accesorios}>
                        {venta.detalles_regalo_accesorios || 'Sin accesorios'}
                      </td>
                      {/* Método de Pago */}
                      <td className="p-4">
                        <span className="inline-block text-xs font-bold border rounded-md px-2 py-0.5 bg-slate-50">
                          {venta.metodo_pago}
                        </span>
                      </td>
                      {/* Total */}
                      <td className="p-4 text-right font-mono font-black text-emerald-600 text-base">
                        ${parseFloat(venta.total).toFixed(2)}
                      </td>
                      {/* Acciones */}
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => router.push(`/admin/pos/ticket/${venta.id}`)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                        >
                          🖨️ Ver Ticket
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}