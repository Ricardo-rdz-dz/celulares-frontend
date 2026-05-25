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
    <div className="p-4 md:p-6 max-w-3xl w-full mx-auto bg-white text-black font-sans bg-transparent print:p-0 print:max-w-full">
      
      {/* ✨ MAGIA CSS: Forzamos la altura máxima a 24cm para la hoja tamaño carta */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 1cm; size: letter portrait; }
          body { padding: 0; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .contenedor-hoja { 
            height: 24cm !important; 
            max-height: 24cm !important;
            overflow: hidden; 
            page-break-inside: avoid; 
          }
        }
      `}} />

      {/* BOTONES AUXILIARES */}
      <div className="mb-4 flex justify-between items-center border-b pb-4 print:hidden">
        <button onClick={() => router.push('/admin/pos')} className="border px-4 py-2 rounded hover:bg-slate-50 font-medium">
          ⬅️ Nueva Venta
        </button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-emerald-700">
          🖨️ Imprimir Ticket
        </button>
      </div>

      {/* RECUADRO PRINCIPAL: Aplicamos 'contenedor-hoja' para limitar a 24cm y flex-col para estirar */}
      <div className="border-2 border-black p-5 flex flex-col contenedor-hoja relative space-y-4 min-h-[80vh]">
        
        {/* ENCABEZADO */}
        <div className="text-center border-b-2 border-black pb-3">
          <h1 className="text-3xl font-black uppercase tracking-widest mb-1">MOVILPLACE</h1>
          <p className="text-sm font-bold uppercase tracking-widest bg-black text-white inline-block px-4 py-1">Comprobante de Compra</p>
          <p className="text-xs text-gray-700 leading-tight mt-2">
            Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia<br/>
            Centro comercial Soriana Hiper
          </p>
          <div className="flex justify-center gap-4 text-xs font-bold mt-2 text-gray-800">
            <span>Ventas: 686 176 4066</span> | <span>Reparaciones: 686 172 0406</span>
          </div>
        </div>

        {/* FOLIO Y FECHA */}
        <div className="flex justify-between items-center text-sm font-bold font-mono">
          <p className="text-lg">FOLIO: <span className="text-emerald-600">#V-{folioVenta}</span></p>
          <p>{new Date(venta.created_at).toLocaleDateString()} {new Date(venta.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>

        {/* DETALLE DEL PRODUCTO VENDIDO */}
        <div className="border-2 border-black py-2">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b-2 border-black text-left font-bold">
                <th className="pb-2 pl-3 w-16">CANT</th>
                <th className="pb-2">DESCRIPCIÓN / ARTÍCULO</th>
                <th className="pb-2 pr-3 text-right">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold">
                <td className="pt-3 pl-3 align-top text-base">{venta.cantidad}x</td>
                <td className="pt-3 leading-snug">
                  {venta.inventario?.nombre} <br/>
                  <span className="text-xs font-normal text-gray-500">SKU: {venta.inventario?.sku}</span>
                </td>
                <td className="pt-3 pr-3 text-right align-top text-base">${venta.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* INCLUYE / EXTRAS */}
        <div className="text-sm bg-gray-50 border-2 border-gray-200 p-3 leading-tight flex justify-between items-center">
          <div>
            <span className="font-bold text-blue-800 uppercase block text-xs mb-1">El equipo incluye:</span>
            <p className="font-mono font-bold text-gray-700">{venta.detalles_regalo_accesorios || 'Ninguno'}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs text-gray-500 uppercase block mb-1">Método de Pago</span>
            <span className="font-bold border-2 border-black px-3 py-1 bg-white text-sm">{venta.metodo_pago}</span>
          </div>
        </div>

        {/* TOTALES */}
        <div className="flex justify-end text-sm font-bold font-mono">
          <div className="w-56 border-2 border-black flex justify-between p-2 bg-gray-100 text-lg">
            <span>TOTAL:</span><span>${venta.total}</span>
          </div>
        </div>

        {/* CLÁUSULAS DE GARANTÍA PARA VENTAS */}
        <div className="text-xs border-2 border-black p-3 space-y-1.5 text-justify font-medium">
          <p className="font-bold text-center border-b-2 border-gray-300 pb-1.5 uppercase mb-1.5 text-sm">Políticas de Garantía de Venta</p>
          <p>• Los equipos cuentan con <span className="font-bold">30 días de garantía</span> exclusivamente contra defectos de fábrica a partir de la fecha de esta nota.</p>
          <p>• <span className="font-bold underline">La garantía queda ANULADA</span> si el equipo presenta golpes, raspones, humedad, pantallas estrelladas, alteraciones de software o por arrepentimiento del cliente.</p>
          <p>• Para artículos de electrónica o accesorios (cables, micas, fundas), NO aplican cambios ni devoluciones. Solicita que se revisen al momento de la compra.</p>
          <p>• Es estrictamente indispensable presentar este comprobante original para validar cualquier garantía. Sin nota, no hay garantía.</p>
          <p>• No se hace devolución de dinero, se realizan solo cambios por otro equipo igual u otro modelo.</p>
          <p>• En caso de requerir garantía, el cliente debe primero comunicarse con nosotros para después acudir a nuestras instalaciones para que un técnico revise el equipo y determine si aplica la garantía o no.</p>
        </div>

        {/* --- SECCIÓN DE CÓDIGOS QR MANTENIENDO EL TAMAÑO DE w-20 h-20 --- */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 border-2 border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
            <p className="font-black text-[10px] tracking-wide mb-1.5">¡VALORAMOS TU OPINIÓN!</p>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" 
              alt="QR Encuesta" 
              className="w-20 h-20"
              onLoad={() => setQrsCargados(prev => prev + 1)}
            />
            <p className="text-[9px] text-gray-500 leading-none mt-1.5 font-bold">Escanea la encuesta</p>
          </div>

          <div className="p-3 border-2 border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
            <p className="font-black text-[10px] tracking-wide mb-1.5">⭐⭐⭐⭐⭐ RESEÑA</p>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" 
              alt="QR Google Maps" 
              className="w-20 h-20"
              onLoad={() => setQrsCargados(prev => prev + 1)}
            />
            <p className="text-[9px] text-gray-500 leading-none mt-1.5 font-bold">Déjanos 5 estrellas en Google</p>
          </div>
        </div>

        {/* FIRMAS Y AGRADECIMIENTO (mt-auto empuja esto al fondo del límite de 24cm) */}
        <div className="pt-2 flex flex-col mt-auto">
          <div className="grid grid-cols-2 gap-10 text-center mb-4">
            <div>
              <div className="border-b-2 border-black w-full h-8"></div>
              <p className="text-xs font-bold mt-1.5 uppercase">Firma Cliente</p>
            </div>
            <div>
              <div className="border-b-2 border-black w-full h-8"></div>
              <p className="text-xs font-bold mt-1.5 uppercase">Entregó MovilPlace</p>
            </div>
          </div>

          <div className="text-center pt-2 border-t-2 border-dashed border-gray-300">
            <p className="text-sm font-black uppercase tracking-widest leading-none">¡Gracias por tu compra!</p>
          </div>
        </div>

      </div>
    </div>
  );
}