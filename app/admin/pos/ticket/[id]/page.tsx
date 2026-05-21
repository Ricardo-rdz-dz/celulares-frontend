'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

// ✨ NOTA: Los paréntesis quedan completamente vacíos
export default function NotaDeVenta() {
  const router = useRouter();
  const params = useParams(); // ✨ Atrapamos los parámetros de la URL
  const id = params?.id;      // ✨ Sacamos el ID exacto

  const [venta, setVenta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✨ FRENO DE MANO: Si aún no lee el ID de la URL, nos esperamos
    if (!id) return;

    const fetchVenta = async () => {
      try {
        // Usamos el "id" limpio que sacamos de useParams
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ventas/${id}`); 
        const data = await res.json();
        setVenta(data);
      } catch (error) {
        console.error("Error cargando venta:", error);
      }
      setLoading(false);
    };
    fetchVenta();
  }, [id]); // ✨ Dependemos del "id" limpio

  if (loading) return <div className="text-center mt-20 font-bold text-white">Generando Nota de Venta...</div>;
  if (!venta) return <div className="text-center mt-20 text-white">Venta no encontrada.</div>;

  // Extraemos el folio corto (primeros 6 caracteres del ID)
  const folioVenta = venta.id.split('-')[0].toUpperCase();

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white text-black font-sans text-xs bg-transparent">
      
      {/* MAGIA CSS PARA LA IMPRESORA */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; }
          body { padding: 1cm; }
        }
      `}} />

      {/* BOTONES AUXILIARES */}
      <div className="mb-6 flex justify-between items-center border-b pb-4 print:hidden">
        <button onClick={() => router.push('/admin/pos')} className="border px-3 py-1.5 rounded hover:bg-slate-50 font-medium">
          ⬅️ Nueva Venta
        </button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-4 py-1.5 rounded font-bold shadow hover:bg-emerald-700">
          🖨️ Imprimir Ticket
        </button>
      </div>

      {/* RECUADRO DE DISEÑO DE NOTA DE VENTA */}
      <div className="border border-black p-6 space-y-4 relative">
        
        {/* ENCABEZADO */}
        <div className="text-center border-b-2 border-black pb-4 mb-2">
          <h1 className="text-3xl font-black uppercase tracking-widest">MOVILPLACE</h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 bg-black text-white inline-block px-4 py-0.5">Comprobante de Compra</p>
          <p className="text-[10px] text-gray-700 leading-tight mt-2">
            Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia<br/>
            Centro comercial Soriana Hiper
          </p>
          <div className="flex justify-center gap-3 text-[10px] font-bold mt-2 text-gray-800">
            <span>Ventas: 686 176 4066</span> | 
            <span>Reparaciones: 686 172 0406</span>
          </div>
        </div>

        {/* FOLIO Y FECHA */}
        <div className="flex justify-between items-center text-xs font-bold font-mono">
          <p className="text-sm">FOLIO: <span className="text-emerald-600">#V-{folioVenta}</span></p>
          <p>FECHA: {new Date(venta.created_at).toLocaleDateString()} {new Date(venta.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>

        {/* DETALLE DEL PRODUCTO VENDIDO */}
        <div className="border-t border-b border-dashed border-gray-400 py-3">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="pb-1">CANT</th>
                <th className="pb-1">DESCRIPCIÓN / ARTÍCULO</th>
                <th className="pb-1 text-right">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold">
                <td className="pt-2 align-top">{venta.cantidad}x</td>
                <td className="pt-2">
                  {venta.inventario?.nombre} <br/>
                  <span className="text-[9px] font-normal text-gray-600">SKU: {venta.inventario?.sku}</span>
                </td>
                <td className="pt-2 text-right">${venta.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* INCLUYE / EXTRAS */}
        <div className="text-[10px] bg-gray-50 border border-gray-300 p-2 leading-tight flex justify-between items-center">
          <div>
            <span className="font-bold block mb-1 uppercase text-blue-800">El equipo incluye:</span>
            <p className="font-mono font-bold">{venta.detalles_regalo_accesorios}</p>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-gray-500 uppercase">Método de Pago</span>
            <span className="font-black border border-black px-2 py-0.5 bg-white">{venta.metodo_pago}</span>
          </div>
        </div>

        {/* TOTALES */}
        <div className="flex justify-end text-sm font-bold font-mono">
          <div className="w-48 border border-black divide-y divide-black">
            <div className="flex justify-between p-2 bg-gray-200 text-lg">
              <span>TOTAL:</span><span>${venta.total}</span>
            </div>
          </div>
        </div>

        {/* CLÁUSULAS DE GARANTÍA PARA VENTAS */}
        <div className="text-[9px] border border-black p-2 mt-4 space-y-1 text-justify font-medium">
          <p className="font-bold text-center border-b border-gray-300 pb-1 mb-1 uppercase">Políticas de Garantía de Venta</p>
          <p>• Los equipos cuentan con <span className="font-bold">30 días de garantía</span> exclusivamente contra defectos de fábrica a partir de la fecha de esta nota.</p>
          <p>• <span className="font-bold underline">La garantía queda ANULADA</span> si el equipo presenta golpes, raspones, humedad, displays estrellados, alteraciones de software o por arrepentimiento del cliente.</p>
          <p>• Para artículos de electrónica o accesorios (cables, micas, fundas), NO aplican cambios ni devoluciones. Solicita que se revisen al momento de la compra.</p>
          <p>• Es estrictamente indispensable presentar este comprobante original para validar cualquier garantía. Sin nota, no hay garantía.</p>
           <p>• No se hace devolución de dinero, se realizan solo cambios por otro equipo igual u otro modelo.</p>
            <p>• En caso de requerir garantía, el cliente debe acudir a nuestras instalaciones para que un técnico revise el equipo y determine si aplica la garantía.</p>
        </div>

        {/* FIRMAS */}
        <div className="pt-12 grid grid-cols-2 gap-10 text-center">
          <div>
            <div className="border-b border-black w-full mx-auto h-12"></div>
            <p className="text-[10px] font-bold mt-1 uppercase">Firma de Conformidad (Cliente)</p>
          </div>
          <div>
            <div className="border-b border-black w-full mx-auto h-12"></div>
            <p className="text-[10px] font-bold mt-1 uppercase">Entregado por (MovilPlace)</p>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs font-black uppercase tracking-widest">¡Gracias por su compra!</p>
        </div>

      </div>
    </div>
  );
}