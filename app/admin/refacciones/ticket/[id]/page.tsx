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
       // ✨ Apuntamos al nuevo endpoint específico de lectura de refacciones
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

  if (loading) return <div className="text-center mt-10 font-bold text-white">Generando Nota de Refacciones...</div>;
  if (!venta) return <div className="text-center mt-10 text-white">Venta no encontrada.</div>;

  const folioVenta = venta.id.split('-')[0].toUpperCase();

  return (
    <div className="p-2 max-w-xl mx-auto bg-white text-black font-sans text-[11px] bg-transparent">
      
      {/* MAGIA CSS COMPACTA PARA IMPRESIÓN */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: auto; }
          body { padding: 0.3cm; font-size: 10px; }
          .print\\:hidden { display: none !important; }
        }
      `}} />

      {/* BOTONES AUXILIARES */}
      <div className="mb-3 flex justify-between items-center border-b pb-1 print:hidden">
        <button onClick={() => router.push('/admin/refacciones/venta')} className="border px-2.5 py-1 rounded hover:bg-slate-50 font-medium text-xs">
          ⬅️ Nueva Venta
        </button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-3 py-1 rounded font-bold shadow hover:bg-emerald-700 text-xs">
          🖨️ Imprimir Ticket
        </button>
      </div>

      {/* RECUADRO DE DISEÑO ULTRA COMPACTO */}
      <div className="border border-black p-3 space-y-2 relative">
        
        {/* ENCABEZADO */}
        <div className="text-center border-b border-black pb-1.5 mb-0.5">
          <h1 className="text-2xl font-black uppercase tracking-wider leading-none">MOVILPLACE</h1>
          <p className="text-[9px] font-bold uppercase tracking-widest mt-1 bg-black text-white inline-block px-3 py-0.5">Nota de Refacciones</p>
          <p className="text-[9px] text-gray-700 leading-tight mt-1">
            Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia (Soriana Hiper)
          </p>
          <div className="flex justify-center gap-2 text-[8px] font-bold mt-0.5 text-gray-600">
            <span>Ventas: 686 176 4066</span> | <span>Reparaciones: 686 172 0406</span>
          </div>
        </div>

        {/* FOLIO Y FECHA */}
        <div className="flex justify-between items-center text-[10px] font-bold font-mono">
          <p>FOLIO: <span className="text-emerald-600">#R-{folioVenta}</span></p>
          <p>{new Date(venta.created_at).toLocaleDateString()} {new Date(venta.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>

        {/* DETALLE DE LA REFACCIÓN VENDIDA */}
        <div className="border-t border-b border-dashed border-black py-1">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="border-b border-black text-left font-bold">
                <th className="pb-0.5 w-12">CANT</th>
                <th className="pb-0.5">PIEZA / REFACCIÓN</th>
                <th className="pb-0.5 text-right">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold">
                <td className="pt-0.5 align-top">{venta.cantidad}x</td>
                <td className="pt-0.5 leading-tight">
                  {venta.inventario?.nombre} <br/>
                  <span className="text-[8px] font-normal text-gray-500">SKU: {venta.inventario?.sku} | {venta.inventario?.calidad || 'Calidad Original'}</span>
                </td>
                <td className="pt-0.5 text-right align-top">${venta.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* MÉTODO DE PAGO (Simplificado para refacciones) */}
        <div className="text-[9px] bg-gray-50 border border-gray-200 p-1.5 leading-tight flex justify-end items-center">
          <div className="text-right shrink-0 flex items-center gap-2">
            <span className="text-[8px] text-gray-500 uppercase font-bold">Método de Pago:</span>
            <span className="font-bold border border-black px-1.5 py-0.2 bg-white text-[9px]">{venta.metodo_pago}</span>
          </div>
        </div>

        {/* TOTALES */}
        <div className="flex justify-end text-xs font-bold font-mono">
          <div className="w-36 border border-black flex justify-between p-1 bg-gray-100 text-sm">
            <span>TOTAL:</span><span>${venta.total}</span>
          </div>
        </div>

        {/* CLÁUSULAS DE GARANTÍA ESTRICTAS PARA REFACCIONES */}
        <div className="text-[8px] border border-black p-1.5 space-y-0.5 text-justify leading-tight font-medium bg-red-50/30">
          <p className="font-bold text-center border-b border-gray-300 pb-0.5 uppercase mb-0.5 text-red-800">Términos de Garantía en Refacciones</p>
          <p>• Es <span className="font-bold underline">OBLIGATORIO</span> probar la refacción conectándola superficialmente antes de instalarla por completo.</p>
          <p>• La garantía queda <span className="font-bold">TOTALMENTE ANULADA</span> si la pieza presenta: micas protectoras removidas, sellos de garantía rotos, rastros de pegamento, soldadura, flexores rasgados, rayones o displays estrellados.</p>
          <p>• Componentes electrónicos sensibles (centros de carga, ICs, micrófonos, baterías soldadas) NO aplican para garantía por riesgo de mala instalación.</p>
          <p>• No se hacen devoluciones en efectivo, únicamente cambio físico por defecto de fábrica en piezas que cumplan los requisitos.</p>
          <p>• Plazo máximo para reclamación: <span className="font-bold">5 días</span> naturales presentando este comprobante y la pieza en su empaque original.</p>
        </div>

        {/* --- SECCIÓN DE CÓDIGOS QR --- */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="p-1.5 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
            <p className="font-black text-[8px] tracking-wide mb-0.5">¡VALORAMOS TU OPINIÓN!</p>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" 
              alt="QR Encuesta" 
              className="w-20 h-20"
              onLoad={() => setQrsCargados(prev => prev + 1)}
            />
            <p className="text-[7px] text-gray-500 leading-none mt-0.5">Escanea la encuesta</p>
          </div>

          <div className="p-1.5 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
            <p className="font-black text-[8px] tracking-wide mb-0.5">⭐⭐⭐⭐⭐ RESEÑA</p>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" 
              alt="QR Google Maps" 
              className="w-20 h-20"
              onLoad={() => setQrsCargados(prev => prev + 1)}
            />
            <p className="text-[7px] text-gray-500 leading-none mt-0.5">Déjanos 5 estrellas en Google</p>
          </div>
        </div>

        {/* FIRMAS */}
        <div className="pt-2 grid grid-cols-2 gap-6 text-center">
          <div>
            <div className="border-b border-black w-full h-4"></div>
            <p className="text-[8px] font-bold mt-0.5 uppercase tracking-tighter">Acepto Condiciones y Garantía</p>
          </div>
          <div>
            <div className="border-b border-black w-full h-4"></div>
            <p className="text-[8px] font-bold mt-0.5 uppercase tracking-tighter">Entregó MovilPlace</p>
          </div>
        </div>

        <div className="text-center pt-0.5 border-t border-dashed border-gray-300">
          <p className="text-[10px] font-black uppercase tracking-wider leading-none">¡Gracias por su compra!</p>
        </div>

      </div>
    </div>
  );
}