//ticket final de la venta
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
    <div className="w-full max-w-[21cm] mx-auto bg-white text-black font-sans print:w-[21cm] print:h-[27.9cm] print:p-[0.5cm]">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: letter portrait; }
          body { -webkit-print-color-adjust: exact; }
          .print-hidden { display: none !important; }
        }
      `}} />

      {/* BOTONES */}
      <div className="mb-4 flex gap-4 print-hidden">
        <button onClick={() => router.push('/admin/pos')} className="border px-4 py-2 rounded">⬅️ Nueva Venta</button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-2 rounded font-bold">🖨️ Imprimir</button>
      </div>

      {/* CONTENEDOR TAMAÑO CARTA */}
      <div className="border-2 border-black p-4 h-[26.5cm] flex flex-col relative text-[10pt]">
        
        {/* ENCABEZADO */}
        <div className="text-center border-b-2 border-black pb-2">
          <h1 className="text-3xl font-black uppercase">MOVILPLACE</h1>
          <p className="text-[10pt] font-bold uppercase bg-black text-white inline-block px-4">Comprobante de Compra</p>
          <p className="text-[9pt] mt-1">Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia (Soriana Hiper)</p>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="mt-2 space-y-3">
          <div className="flex justify-between font-bold">
            <p>FOLIO: <span className="text-emerald-700">#V-{folioVenta}</span></p>
            <p>{new Date(venta.created_at).toLocaleDateString()}</p>
          </div>

          <table className="w-full border-t border-b border-black">
            <thead><tr className="text-left font-bold border-b border-black"><th>CANT</th><th>DESCRIPCIÓN</th><th className="text-right">TOTAL</th></tr></thead>
            <tbody><tr><td>{venta.cantidad}x</td><td>{venta.inventario?.nombre}<br/><span className="text-[8pt] text-gray-500">SKU: {venta.inventario?.sku}</span></td><td className="text-right">${venta.total}</td></tr></tbody>
          </table>

          <div className="bg-gray-100 p-2 text-[9pt] border border-gray-300">
            <strong>Incluye:</strong> {venta.detalles_regalo_accesorios || 'Ninguno'} | <strong>Pago:</strong> {venta.metodo_pago}
          </div>

          <div className="text-right text-lg font-bold">TOTAL: ${venta.total}</div>
        </div>

        {/* ZONA INFERIOR FIJA (Firmas + QR) */}
        <div className="mt-auto border-t-2 border-black pt-4">
          <div className="grid grid-cols-2 gap-4 items-center">
            {/* QRs */}
            <div className="flex gap-2">
              <div className="text-center"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" className="w-16 h-16" onLoad={() => setQrsCargados(prev => prev + 1)}/></div>
              <div className="text-center"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" className="w-16 h-16" onLoad={() => setQrsCargados(prev => prev + 1)}/></div>
            </div>
            {/* FIRMAS */}
            <div className="grid grid-cols-2 gap-4 text-center text-[8pt]">
              <div><div className="border-b border-black h-8"></div>Firma Cliente</div>
              <div><div className="border-b border-black h-8"></div>MovilPlace</div>
            </div>
          </div>
          <p className="text-center font-black uppercase mt-2">¡Gracias por tu compra!</p>
        </div>
      </div>
    </div>
  );
}