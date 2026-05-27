//ticket final de la venta
//NOTA DE VENTA DE ARTICULOS - FORMATO DE TALONARIO FISICO

// Este diseño es para imprimir una nota de venta física que se le entrega al cliente al comprar un artículo.

// Contiene toda la información relevante de la venta, cliente, producto, condiciones y cláusulas legales.

// El diseño está optimizado para impresión en papel tamaño ticket o similar, con márgenes adecuados y sin elementos innecesarios.

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
    // ✨ CAMBIO: Ahora espera a que carguen los 3 QRs
    if (venta && qrsCargados >= 3) {
      setTimeout(() => {
        window.print();
      }, 300); 
    }
  }, [venta, qrsCargados]);

  if (loading) return <div className="text-center mt-10 font-bold text-xl">Generando Nota de Venta...</div>;
  if (!venta) return <div className="text-center mt-10 text-xl">Venta no encontrada.</div>;

  const folioVenta = venta.id.split('-')[0].toUpperCase();

  return (
    <div className="w-full max-w-[21cm] mx-auto bg-white text-black font-sans print:w-[21cm] print:h-[28cm]">
      
      {/* MAGIA CSS PARA LLENAR LA HOJA */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 1cm; size: letter portrait; }
          body { -webkit-print-color-adjust: exact; }
          .print-hidden { display: none !important; }
        }
      `}} />

      {/* BOTONES AUXILIARES */}
      <div className="mb-3 flex justify-between items-center border-b pb-1 print-hidden">
        <button onClick={() => router.push('/admin/pos')} className="border px-4 py-2 rounded hover:bg-slate-50 font-medium">
          ⬅️ Nueva Venta
        </button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-emerald-700">
          🖨️ Imprimir Ticket
        </button>
      </div>

      {/* RECUADRO QUE SE ESTIRA PARA LLENAR LA HOJA (Flexbox) */}
      <div className="border-2 border-black p-6 flex flex-col min-h-[25cm] relative">
        
        {/* ENCABEZADO */}
        <div className="text-center border-b border-black pb-3 mb-2">
          <h1 className="text-4xl font-black uppercase tracking-wider leading-none">MOVILPLACE</h1>
          <p className="text-sm font-bold uppercase tracking-widest mt-2 bg-black text-white inline-block px-4 py-1">Comprobante de Compra</p>
          <p className="text-sm text-gray-700 leading-tight mt-2">
            Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia (Soriana Hiper)
          </p>
          <div className="flex justify-center gap-4 text-xs font-bold mt-2 text-gray-600">
            <span>Ventas: 686 176 4066</span> | <span>Reparaciones: 686 172 0406</span> | <span>Desbloqueos: 686 168 7729</span>
          </div>
        </div>

        {/* FOLIO Y FECHA */}
        <div className="flex justify-between items-center text-sm font-bold font-mono">
          <p className="text-lg">FOLIO: <span className="text-emerald-600">#V-{folioVenta}</span></p>
          <p className="text-lg">{new Date(venta.created_at).toLocaleDateString()} {new Date(venta.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>

        {/* DETALLE DEL PRODUCTO VENDIDO */}
        <div className="border-t-2 border-b-2 border-dashed border-black py-4 flex-grow">
          <table className="w-full text-base font-mono">
            <thead>
              <tr className="border-b-2 border-black text-left font-bold">
                <th className="pb-2 w-20">CANT</th>
                <th className="pb-2">DESCRIPCIÓN</th>
                <th className="pb-2 text-right">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold text-lg">
                <td className="pt-4 align-top">{venta.cantidad}x</td>
                <td className="pt-4 leading-tight">
                  {venta.inventario?.nombre} <br/>
                  <span className="text-sm font-normal text-gray-500">SKU: {venta.inventario?.sku}</span>
                </td>
                <td className="pt-4 text-right align-top">${venta.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* INCLUYE / EXTRAS */}
        <div className="text-base bg-gray-50 border border-gray-300 p-4 leading-tight flex justify-between items-center mb-2">
          <div>
            <span className="font-bold text-blue-800 uppercase block text-sm">Incluye:</span>
            <p className="font-mono font-bold text-gray-700">{venta.detalles_regalo_accesorios || 'Ninguno'}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs text-gray-400 uppercase block">Pago</span>
            <span className="font-bold border-2 border-black px-4 py-1 bg-white text-base">{venta.metodo_pago}</span>
          </div>
        </div>

        {/* TOTALES */}
        <div className="flex justify-end text-lg font-bold font-mono mb-4">
          <div className="w-56 border-2 border-black flex justify-between p-3 bg-gray-100">
            <span>TOTAL:</span><span>${venta.total}</span>
          </div>
        </div>

        {/* CLÁUSULAS DE GARANTÍA PARA VENTAS */}
        <div className="text-xs border border-black p-3 space-y-1 text-justify font-medium">
          <p className="font-bold text-center border-b border-gray-300 pb-1 uppercase mb-1">Políticas de Garantía de Venta</p>
          <p>• Los equipos cuentan con <span className="font-bold">30 días de garantía</span> exclusivamente contra defectos de fábrica a partir de la fecha de esta nota.</p>
          <p>• <span className="font-bold underline">La garantía queda ANULADA</span> si el equipo presenta golpes, raspones, humedad, pantallas estrelladas, alteraciones de software o por arrepentimiento del cliente.</p>
          <p>• Para artículos de electrónica o accesorios (cables, micas, fundas), NO aplican cambios ni devoluciones. Solicita que se revisen al momento de la compra.</p>
          <p>• Es estrictamente indispensable presentar este comprobante original para validar cualquier garantía. Sin nota, no hay garantía.</p>
          <p>• No se hace devolución de dinero, se realizan solo cambios por otro equipo igual u otro modelo.</p>
          <p>• En caso de requerir garantía, el cliente debe primero comunicarse con nosotros para después acudir a nuestras instalaciones para que un técnico revise el equipo y determine si aplica la garantía o no.</p>
        </div>

        {/* --- SECCIÓN DE CÓDIGOS QR Y FIRMAS --- */}
        <div className="mt-auto pt-6 border-t-2 border-dashed border-gray-300">
            {/* ✨ CAMBIO: Grid a 3 columnas */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
                <p className="font-black text-[10px] tracking-wide mb-1">¡VALORAMOS TU OPINIÓN!</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" className="w-16 h-16" onLoad={() => setQrsCargados(prev => prev + 1)}/>
                <p className="text-[9px] text-gray-500 mt-1">Escanea la encuesta</p>
              </div>

              {/* ✨ NUEVO: VIP QR */}
              <div className="p-2 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
                <p className="font-black text-[10px] tracking-wide mb-1">Canal Exclusivo WhatsApp - OFERTAS VIP</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://whatsapp.com/channel/0029VbCp9NLFMqrVPF1ZLA0W" className="w-16 h-16" onLoad={() => setQrsCargados(prev => prev + 1)}/>
                <p className="text-[9px] text-gray-500 mt-1">Únete a nuestro Canal</p>
              </div>

              <div className="p-2 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
                <p className="font-black text-[10px] tracking-wide mb-1">⭐⭐⭐⭐⭐ RESEÑA</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" className="w-16 h-16" onLoad={() => setQrsCargados(prev => prev + 1)}/>
                <p className="text-[9px] text-gray-500 mt-1">Déjanos 5 estrellas en Google</p>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-2 gap-10 text-center">
              <div>
                <div className="border-b-2 border-black w-full h-8"></div>
                <p className="text-xs font-bold mt-1 uppercase tracking-tighter">Firma Cliente</p>
              </div>
              <div>
                <div className="border-b-2 border-black w-full h-8"></div>
                <p className="text-xs font-bold mt-1 uppercase tracking-tighter">Entregó MovilPlace</p>
              </div>
            </div>
            <p className="text-sm font-black uppercase tracking-wider text-center pt-4">¡Gracias por tu compra!</p>
        </div>

      </div>
    </div>
  );
}