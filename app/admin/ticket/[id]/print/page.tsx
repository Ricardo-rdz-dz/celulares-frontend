// nota ticket venta final
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

  if (loading) return <div className="text-center mt-10 font-bold text-2xl">Generando Nota...</div>;
  if (!venta) return <div className="text-center mt-10 text-2xl">Venta no encontrada.</div>;

  const folioVenta = venta.id.split('-')[0].toUpperCase();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white text-black font-sans print:p-0">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0.5cm; size: letter portrait; }
          .print-hidden { display: none !important; }
          .hoja-completa { height: 26cm !important; }
        }
      `}} />

      <div className="mb-4 print-hidden">
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold text-xl">🖨️ Imprimir Ticket Completo</button>
      </div>

      {/* Recuadro que estira el contenido a toda la hoja */}
      <div className="border-4 border-black p-8 hoja-completa flex flex-col justify-between">
        
        {/* ENCABEZADO GRANDE */}
        <div className="text-center border-b-4 border-black pb-4">
          <h1 className="text-6xl font-black uppercase tracking-tight">MOVILPLACE</h1>
          <p className="text-2xl font-bold uppercase mt-2 bg-black text-white inline-block px-6 py-1">Comprobante de Compra</p>
          <p className="text-lg mt-3">Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia (Soriana Hiper)</p>
          <p className="text-lg font-bold mt-1">Ventas: 686 176 4066 | Reparaciones: 686 172 0406</p>
        </div>

        {/* DATOS DE VENTA */}
        <div className="flex justify-between text-2xl font-bold mt-4">
          <p>FOLIO: <span className="text-emerald-700">#V-{folioVenta}</span></p>
          <p>{new Date(venta.created_at).toLocaleDateString()}</p>
        </div>

        {/* TABLA DE PRODUCTOS (Expandida) */}
        <div className="border-y-4 border-black py-6 my-4">
          <table className="w-full text-xl">
            <thead>
              <tr className="border-b-2 border-black text-left">
                <th className="py-3">CANT</th>
                <th className="py-3">DESCRIPCIÓN</th>
                <th className="py-3 text-right">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-bold text-2xl">
                <td className="py-6">{venta.cantidad}x</td>
                <td className="py-6">{venta.inventario?.nombre} <br/><span className="text-lg font-normal text-gray-600">SKU: {venta.inventario?.sku}</span></td>
                <td className="py-6 text-right">${venta.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TOTAL Y DETALLES */}
        <div className="flex justify-between items-center text-3xl font-black bg-gray-100 p-6 border-2 border-black">
          <span>TOTAL A PAGAR:</span>
          <span>${venta.total}</span>
        </div>

        {/* GARANTÍAS (Fuente legible) */}
        <div className="text-base border-2 border-black p-4 text-justify leading-snug">
          <p className="font-bold text-center text-lg uppercase mb-2">Políticas de Garantía</p>
          <p>• 30 días de garantía contra defectos de fábrica. No aplica en golpes, humedad, pantalla rota o software alterado.</p>
          <p>• Indispensable presentar este ticket original. No hay devoluciones de dinero, solo cambios físicos.</p>
        </div>

        {/* QR Y FIRMAS ABAJO */}
        <div className="grid grid-cols-2 gap-8 items-end mt-auto">
          <div className="flex gap-4">
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://forms.gle/TdJQcXYvyqJias5p6" className="w-28 h-28" onLoad={() => setQrsCargados(prev => prev + 1)}/>
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" className="w-28 h-28" onLoad={() => setQrsCargados(prev => prev + 1)}/>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center text-sm font-bold">
            <div><div className="border-b-2 border-black h-16"></div>Firma Cliente</div>
            <div><div className="border-b-2 border-black h-16"></div>MovilPlace</div>
          </div>
        </div>

      </div>
    </div>
  );
}