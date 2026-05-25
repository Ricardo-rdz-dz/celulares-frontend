'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function NotaDeVenta() {
  const router = useRouter();
  const params = useParams(); 
  const id = params?.id;      

  const [venta, setVenta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrsCargados, setQrsCargados] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchVenta = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ventas/${id}`); 
        const data = await res.json();
        setVenta(data);
      } catch (error) {
        console.error("Error cargando venta:", error);
      }
      setLoading(false);
    };
    fetchVenta();
  }, [id]); 

  useEffect(() => {
    if (venta && qrsCargados >= 2) {
      setTimeout(() => {
        window.print();
      }, 300); 
    }
  }, [venta, qrsCargados]);

  if (loading) return <div className="text-center mt-10 font-bold text-white">Generando Nota de Venta...</div>;
  if (!venta) return <div className="text-center mt-10 text-white">Venta no encontrada.</div>;

  const folioVenta = venta.id.split('-')[0].toUpperCase();

  return (
    <div className="p-4 max-w-xl mx-auto bg-white text-black font-sans text-[11px] bg-transparent">
      
      {/* MAGIA CSS COMPACTA PARA IMPRESIÓN */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: auto; }
          body { padding: 0.4cm; font-size: 10px; }
          .print\\:hidden { display: none !important; }
        }
      `}} />

      {/* BOTONES AUXILIARES */}
      <div className="mb-4 flex justify-between items-center border-b pb-2 print:hidden">
        <button onClick={() => router.push('/admin/pos')} className="border px-2.5 py-1 rounded hover:bg-slate-50 font-medium text-xs">
          ⬅️ Nueva Venta
        </button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-3 py-1 rounded font-bold shadow hover:bg-emerald-700 text-xs">
          🖨️ Imprimir Ticket
        </button>
      </div>

      {/* RECUADRO DE DISEÑO ULTRA COMPACTO */}
      <div className="border border-black p-4 space-y-3 relative">
        
        {/* ENCABEZADO */}
        <div className="text-center border-b border-black pb-2 mb-1">
          <h1 className="text-2xl font-black uppercase tracking-wider leading-none">MOVILPLACE</h1>
          <p className="text-[9px] font-bold uppercase tracking-widest mt-1 bg-black text-white inline-block px-3 py-0.5">Comprobante de Compra</p>
          <p className="text-[9px] text-gray-700 leading-tight mt-1.5">
            Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia (Soriana Hiper)
          </p>
          <div className="flex justify-center gap-2 text-[8px] font-bold mt-1 text-gray-600">
            <span>Ventas: 686 176 4066</span> | <span>Reparaciones: 686 172 0406</span>
          </div>
        </div>

        {/* FOLIO Y FECHA */}
        <div className="flex justify-between items-center text-[10px] font-bold font-mono">
          <p>FOLIO: <span className="text-emerald-600">#V-{folioVenta}</span></p>
          <p>{new Date(venta.created_at).toLocaleDateString()} {new Date(venta.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>

        {/* DETALLE DEL PRODUCTO VENDIDO */}
        <div className="border-t border-b border-dashed border-black py-1.5">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="border-b border-black text-left font-bold">
                <th className="pb-0.5 w-12">CANT</th>
                <th className="pb-0.5">DESCRIPCIÓN</th>
                <th className="pb-0.5 text-right">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold">
                <td className="pt-1 align-top">{venta.cantidad}x</td>
                <td className="pt-1 leading-tight">
                  {venta.inventario?.nombre} <br/>
                  <span className="text-[8px] font-normal text-gray-500">SKU: {venta.inventario?.sku}</span>
                </td>
                <td className="pt-1 text-right align-top">${venta.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* INCLUYE / EXTRAS */}
        <div className="text-[9px] bg-gray-50 border border-gray-200 p-1.5 leading-tight flex justify-between items-center">
          <div>
            <span className="font-bold text-blue-800 uppercase block text-[8px]">Incluye:</span>
            <p className="font-mono font-bold text-gray-700">{venta.detalles_regalo_accesorios || 'Ninguno'}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[8px] text-gray-400 uppercase block">Pago</span>
            <span className="font-bold border border-black px-1.5 py-0.2 bg-white text-[9px]">{venta.metodo_pago}</span>
          </div>
        </div>

        {/* TOTALES */}
        <div className="flex justify-end text-xs font-bold font-mono">
          <div className="w-36 border border-black flex justify-between p-1 bg-gray-100 text-sm">
            <span>TOTAL:</span><span>${venta.total}</span>
          </div>
        </div>
{/* CLÁUSULAS DE GARANTÍA PARA VENTAS */}
        <div className="text-[9px] border border-black p-2 mt-4 space-y-1 text-justify font-medium">
          <p className="font-bold text-center border-b border-gray-300 pb-1 mb-1 uppercase">Políticas de Garantía de Venta</p>
          <p>• Los equipos cuentan con <span className="font-bold">30 días de garantía</span> exclusivamente contra defectos de fábrica a partir de la fecha de esta nota.</p>
          <p>• <span className="font-bold underline">La garantía queda ANULADA</span> si el equipo presenta golpes, raspones, humedad, pantallas estrelladas, alteraciones de software o por arrepentimiento del cliente.</p>
          <p>• Para artículos de electrónica o accesorios (cables, micas, fundas), NO aplican cambios ni devoluciones. Solicita que se revisen al momento de la compra.</p>
          <p>• Es estrictamente indispensable presentar este comprobante original para validar cualquier garantía. Sin nota, no hay garantía.</p>
          <p>• No se hace devolución de dinero, se realizan solo cambios por otro equipo igual u otro modelo.</p>
          <p>• En caso de requerir garantía, el cliente debe primero comunicarse con nosotros para después acudir a nuestras instalaciones para que un técnico revise el equipo y determine si aplica la garantía o no.</p>
        </div>

        {/* --- SECCIÓN DE CÓDIGOS QR COMPACTOS --- */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="p-1 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
            <p className="font-black text-[8px] tracking-wide">¡VALORAMOS TU OPINIÓN!</p>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://forms.gle/TdJQcXYvyqJias5p6" 
              alt="QR Encuesta" 
              className="w-12 h-12 my-0.5"
              onLoad={() => setQrsCargados(prev => prev + 1)}
            />
            <p className="text-[7px] text-gray-500 leading-none">Escanea la encuesta</p>
          </div>

          <div className="p-1 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
            <p className="font-black text-[8px] tracking-wide">⭐⭐⭐⭐⭐ RESEÑA</p>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" 
              alt="QR Google Maps" 
              className="w-12 h-12 my-0.5"
              onLoad={() => setQrsCargados(prev => prev + 1)}
            />
            <p className="text-[7px] text-gray-500 leading-none">Déjanos 5 estrellas en Google</p>
          </div>
        </div>

        {/* FIRMAS APRETADAS */}
        <div className="pt-4 grid grid-cols-2 gap-6 text-center">
          <div>
            <div className="border-b border-black w-full h-6"></div>
            <p className="text-[8px] font-bold mt-0.5 uppercase tracking-tighter">Firma Cliente</p>
          </div>
          <div>
            <div className="border-b border-black w-full h-6"></div>
            <p className="text-[8px] font-bold mt-0.5 uppercase tracking-tighter">Entregó MovilPlace</p>
          </div>
        </div>

        <div className="text-center pt-1 border-t border-dashed border-gray-300">
          <p className="text-[10px] font-black uppercase tracking-wider">¡Gracias por tu compra!</p>
        </div>

      </div>
    </div>
  );
}