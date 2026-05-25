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

  if (loading) return <div className="text-center mt-10 font-bold text-2xl">Generando Nota...</div>;
  if (!venta) return <div className="text-center mt-10 text-2xl">Venta no encontrada.</div>;

  const folioVenta = venta.id.split('-')[0].toUpperCase();

  return (
    <div className="w-full max-w-[21cm] mx-auto bg-white text-black font-sans print:w-[21cm]">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0.5cm; size: letter portrait; }
          body { -webkit-print-color-adjust: exact; }
          .print-hidden { display: none !important; }
          .hoja-completa { height: 25.5cm !important; }
        }
      `}} />

      {/* BOTONES AUXILIARES */}
      <div className="mb-4 flex gap-4 print-hidden p-4">
        <button onClick={() => router.push('/admin/refacciones/venta')} className="border px-6 py-2 rounded">⬅️ Nueva Venta</button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-8 py-2 rounded font-bold">🖨️ Imprimir Ticket</button>
      </div>

      {/* RECUADRO ESTIRADO A LA HOJA */}
      <div className="border-4 border-black p-8 hoja-completa flex flex-col relative space-y-6">
        
        {/* ENCABEZADO */}
        <div className="text-center border-b-2 border-black pb-4">
          <h1 className="text-5xl font-black uppercase tracking-wider leading-none">MOVILPLACE</h1>
          <p className="text-lg font-bold uppercase tracking-widest mt-3 bg-black text-white inline-block px-6 py-1">Nota de Refacciones</p>
          <p className="text-base text-gray-700 mt-2">Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia (Soriana Hiper)</p>
          <div className="flex justify-center gap-6 text-sm font-bold mt-2 text-gray-600">
            <span>Ventas: 686 176 4066</span> | <span>Reparaciones: 686 172 0406</span> | <span>Desbloqueos: 686 168 7729</span>
          </div>
        </div>

        {/* FOLIO Y FECHA */}
        <div className="flex justify-between items-center text-lg font-bold font-mono">
          <p className="text-2xl">FOLIO: <span className="text-emerald-700">#R-{folioVenta}</span></p>
          <p>{new Date(venta.created_at).toLocaleDateString()} {new Date(venta.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>

        {/* DETALLE DE LA REFACCIÓN */}
        <div className="border-t-2 border-b-2 border-dashed border-black py-6 flex-grow">
          <table className="w-full text-lg font-mono">
            <thead>
              <tr className="border-b-2 border-black text-left font-bold">
                <th className="pb-3 w-20">CANT</th>
                <th className="pb-3">PIEZA / REFACCIÓN</th>
                <th className="pb-3 text-right">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold text-xl">
                <td className="pt-4 align-top">{venta.cantidad}x</td>
                <td className="pt-4 leading-tight">
                  {venta.inventario?.nombre} <br/>
                  <span className="text-base font-normal text-gray-500">SKU: {venta.inventario?.sku} | {venta.inventario?.calidad || 'Calidad Original'}</span>
                </td>
                <td className="pt-4 text-right align-top">${venta.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* MÉTODO DE PAGO */}
        <div className="text-base bg-gray-50 border border-gray-300 p-4 flex justify-end items-center">
            <span className="text-base text-gray-500 uppercase font-bold mr-6">Método de Pago:</span>
            <span className="font-bold border-2 border-black px-6 py-2 bg-white text-lg">{venta.metodo_pago}</span>
        </div>

        {/* TOTALES */}
        <div className="flex justify-end text-xl font-bold font-mono">
          <div className="w-64 border-2 border-black flex justify-between p-4 bg-gray-100 text-2xl">
            <span>TOTAL:</span><span>${venta.total}</span>
          </div>
        </div>

        {/* POLÍTICAS DE GARANTÍA */}
        <div className="text-sm border-2 border-black p-4 space-y-2 text-justify font-medium bg-red-50/30">
          <p className="font-bold text-center border-b border-black pb-2 uppercase mb-2 text-red-900 text-base">Términos de Garantía en Refacciones</p>
          <p>• Es <span className="font-bold underline">OBLIGATORIO</span> probar la refacción conectándola superficialmente antes de instalarla por completo.</p>
          <p>• La garantía queda <span className="font-bold">TOTALMENTE ANULADA</span> si la pieza presenta: micas protectoras removidas, sellos de garantía rotos, rastros de pegamento, soldadura, flexores rasgados, rayones o displays estrellados.</p>
          <p>• Componentes electrónicos sensibles (centros de carga, ICs, micrófonos, baterías soldadas) NO aplican para garantía por riesgo de mala instalación.</p>
          <p>• No se hacen devoluciones en efectivo, únicamente cambio físico por defecto de fábrica en piezas que cumplan los requisitos.</p>
          <p>• Plazo máximo para reclamación: <span className="font-bold">5 días</span> naturales presentando este comprobante y la pieza en su empaque original.</p>
        </div>

        {/* --- QR Y FIRMAS (mt-auto los empuja al final) --- */}
        <div className="mt-auto pt-6 border-t-2 border-dashed border-gray-300">
          <div className="grid grid-cols-2 gap-6 items-center">
            <div className="flex gap-4 justify-center">
               <div className="text-center">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" className="w-28 h-28" onLoad={() => setQrsCargados(prev => prev + 1)}/>
                  <p className="text-[10px] font-bold mt-2">ENCUESTA SATISFACCIÓN</p>
               </div>
               <div className="text-center">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" className="w-28 h-28" onLoad={() => setQrsCargados(prev => prev + 1)}/>
                  <p className="text-[10px] font-bold mt-2">CALIFÍCANOS GOOGLE</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center text-sm font-bold">
              <div><div className="border-b-2 border-black h-16"></div>Acepto Garantía</div>
              <div><div className="border-b-2 border-black h-16"></div>Entregó MovilPlace</div>
            </div>
          </div>
          <p className="text-xl font-black uppercase text-center pt-6">¡Gracias por su compra!</p>
        </div>
      </div>
    </div>
  );
}