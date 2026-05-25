// NOTA DE VENTA DE REFACCIONES - FORMATO DE TALONARIO FISICO
// Este diseño es para imprimir una nota de venta física que se le entrega al cliente al comprar una refacción. 
// Contiene toda la información relevante de la venta, cliente, producto, condiciones y cláusulas legales.
// El diseño está optimizado para impresión en papel tamaño ticket o similar, con márgenes adecuados y sin elementos innecesarios.   
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function NotaVentaRefacciones() {
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refacciones/ventas/${id}`); 
        const data = await res.json();
        setVenta(data);
      } catch (error) {
        console.error("Error cargando venta de refacción:", error);
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

  if (loading) return <div className="text-center mt-10 font-bold text-xl">Generando Nota de Refacciones...</div>;
  if (!venta) return <div className="text-center mt-10 text-xl">Venta no encontrada.</div>;

  const folioVenta = venta.id.split('-')[0].toUpperCase();

  return (
    <div className="w-full max-w-[21cm] mx-auto bg-white text-black font-sans print:w-[21cm]">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: letter portrait; margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
          .print-hidden { display: none !important; }
          .hoja-final { height: 25.5cm !important; }
        }
      `}} />

      {/* BOTONES AUXILIARES */}
      <div className="mb-2 flex gap-4 print-hidden p-2">
        <button onClick={() => router.push('/admin/refacciones/venta')} className="border px-4 py-2 rounded">⬅️ Nueva Venta</button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-2 rounded font-bold">🖨️ Imprimir Ticket</button>
      </div>

      {/* RECUADRO CON LÍMITE DE HOJA */}
      <div className="border-2 border-black p-4 hoja-final flex flex-col relative space-y-3">
        
        {/* ENCABEZADO */}
        <div className="text-center border-b-2 border-black pb-2">
          <h1 className="text-3xl font-black uppercase tracking-wider leading-none">MOVILPLACE</h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 bg-black text-white inline-block px-3 py-0.5">Nota de Refacciones</p>
          <p className="text-xs text-gray-700 leading-tight mt-1">
            Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia (Soriana Hiper)
          </p>
          <div className="flex justify-center gap-2 text-[10px] font-bold mt-1 text-gray-600">
            <span>Ventas: 686 176 4066</span> | <span>Reparaciones: 686 172 0406</span> | <span>Desbloqueos: 686 168 7729</span>
          </div>
        </div>

        {/* FOLIO Y FECHA */}
        <div className="flex justify-between items-center text-sm font-bold font-mono">
          <p className="text-base">FOLIO: <span className="text-emerald-700">#R-{folioVenta}</span></p>
          <p>{new Date(venta.created_at).toLocaleDateString()} {new Date(venta.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>

        {/* DETALLE DE LA REFACCIÓN VENDIDA */}
        <div className="border-t-2 border-b-2 border-dashed border-black py-3 flex-grow">
          <table className="w-full text-base font-mono">
            <thead>
              <tr className="border-b-2 border-black text-left font-bold">
                <th className="pb-2 w-16">CANT</th>
                <th className="pb-2">PIEZA / REFACCIÓN</th>
                <th className="pb-2 text-right">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold text-lg">
                <td className="pt-3 align-top">{venta.cantidad}x</td>
                <td className="pt-3 leading-tight">
                  {venta.inventario?.nombre} <br/>
                  <span className="text-sm font-normal text-gray-500">SKU: {venta.inventario?.sku} | {venta.inventario?.calidad || 'Calidad Original'}</span>
                </td>
                <td className="pt-3 text-right align-top">${venta.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* MÉTODO DE PAGO */}
        <div className="text-sm bg-gray-50 border border-gray-300 p-2 flex justify-end items-center">
            <span className="text-sm text-gray-500 uppercase font-bold mr-4">Método de Pago:</span>
            <span className="font-bold border-2 border-black px-4 py-1 bg-white text-sm">{venta.metodo_pago}</span>
        </div>

        {/* TOTALES */}
        <div className="flex justify-end text-lg font-bold font-mono">
          <div className="w-56 border-2 border-black flex justify-between p-3 bg-gray-100 text-xl">
            <span>TOTAL:</span><span>${venta.total}</span>
          </div>
        </div>

        {/* CLÁUSULAS DE GARANTÍA */}
        <div className="text-xs border-2 border-black p-3 space-y-1.5 text-justify font-medium bg-red-50/30">
          <p className="font-bold text-center border-b border-black pb-1 uppercase mb-1 text-red-800 text-sm">Términos de Garantía en Refacciones</p>
          <p>• Es <span className="font-bold underline">OBLIGATORIO</span> probar la refacción conectándola superficialmente antes de instalarla por completo.</p>
          <p>• La garantía queda <span className="font-bold">TOTALMENTE ANULADA</span> si la pieza presenta: micas protectoras removidas, sellos de garantía rotos, rastros de pegamento, soldadura, flexores rasgados, rayones o displays estrellados.</p>
          <p>• Componentes electrónicos sensibles (centros de carga, ICs, micrófonos, baterías soldadas) NO aplican para garantía por riesgo de mala instalación.</p>
          <p>• No se hacen devoluciones en efectivo, únicamente cambio físico por defecto de fábrica en piezas que cumplan los requisitos.</p>
          <p>• Plazo máximo para reclamación: <span className="font-bold">5 días</span> naturales presentando este comprobante y la pieza en su empaque original.</p>
        </div>

        {/* QRs Y FIRMAS */}
        <div className="mt-auto pt-4 border-t-2 border-dashed border-gray-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-2 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
              <p className="font-black text-[10px] tracking-wide mb-1">¡VALORAMOS TU OPINIÓN!</p>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/6yTQxJsiXwCiA9iYA" className="w-16 h-16" onLoad={() => setQrsCargados(prev => prev + 1)}/>
              <p className="text-[9px] text-gray-500 mt-1">Escanea la encuesta</p>
            </div>
            <div className="p-2 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
              <p className="font-black text-[10px] tracking-wide mb-1">⭐⭐⭐⭐⭐ RESEÑA</p>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" className="w-16 h-16" onLoad={() => setQrsCargados(prev => prev + 1)}/>
              <p className="text-[9px] text-gray-500 mt-1">Déjanos 5 estrellas en Google</p>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="border-b-2 border-black w-full h-8"></div>
              <p className="text-xs font-bold mt-1 uppercase">Acepto Condiciones y Garantía</p>
            </div>
            <div>
              <div className="border-b-2 border-black w-full h-8"></div>
              <p className="text-xs font-bold mt-1 uppercase">Entregó MovilPlace</p>
            </div>
          </div>
          <p className="text-base font-black uppercase text-center pt-2">¡Gracias por su compra!</p>
        </div>
      </div>
    </div>
  );
}