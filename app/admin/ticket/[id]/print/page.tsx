// nota ticket venta final
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function PrintTicketFinal({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;
  const router = useRouter(); 

  const [ticket, setTicket] = useState<any>(null);
  const [qrsCargados, setQrsCargados] = useState(0);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}`);
        const data = await res.json();
        setTicket(data.ticket);
      } catch (error) {
        console.error('Error al cargar ticket para imprimir:', error);
      }
    };
    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    if (ticket && qrsCargados >= 2) {
      setTimeout(() => {
        window.print();
      }, 300); 
    }
  }, [ticket, qrsCargados]);

  if (!ticket) return <div className="p-10 text-center font-mono text-black">Generando recibo final...</div>;

  const costoTotal = parseFloat(ticket.costo_total || ticket.precio || 0);
  const anticipo = parseFloat(ticket.anticipo || 0);
  const saldoPagado = costoTotal - anticipo;

  return (
    <div className="p-4 max-w-xl mx-auto bg-white text-black font-sans bg-transparent print:p-0">
      
      {/* MAGIA CSS PARA HOJA COMPLETA */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 1cm; size: letter portrait; }
          body { padding: 0; }
          .print-hidden { display: none !important; }
          .hoja-completa { height: 26cm !important; }
        }
      `}} />

      {/* BOTONES */}
      <div className="mb-4 flex gap-4 print-hidden">
        <button onClick={() => router.push('/admin')} className="border px-4 py-2 rounded">⬅️ Volver</button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-2 rounded font-bold">🖨️ Imprimir Recibo</button>
      </div>

      {/* CONTENEDOR TAMAÑO CARTA */}
      <div className="border-2 border-black p-5 hoja-completa flex flex-col relative space-y-4">
        
        {/* ENCABEZADO */}
        <div className="text-center border-b-2 border-black pb-3">
          <h1 className="text-4xl font-black uppercase tracking-wider">MovilPlace</h1>
          <p className="text-sm font-bold uppercase tracking-widest mt-1 bg-black text-white inline-block px-4 py-1">Recibo de Servicio Final</p>
          <p className="text-xs text-gray-700 mt-2">Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia (Soriana Hiper)</p>
        </div>

        {/* DATOS TICKET */}
        <div className="flex justify-between font-bold text-sm">
          <p>FOLIO: #{ticket.id.toString().substring(0, 8).toUpperCase()}</p>
          <p>FECHA: {new Date().toLocaleDateString()}</p>
        </div>

        {/* DATOS CLIENTE Y EQUIPO */}
        <div className="border-2 border-black p-3 text-sm space-y-1">
          <p><strong>CLIENTE:</strong> {ticket.clientes?.nombre.toUpperCase()}</p>
          <p><strong>EQUIPO:</strong> {ticket.equipos?.marca} {ticket.equipos?.modelo}</p>
          <p><strong>MOTIVO:</strong> {ticket.falla_reportada.toUpperCase()}</p>
          <p><strong>TRABAJO REALIZADO:</strong> <span className="italic uppercase">{ticket.diagnostico || 'Mantenimiento y reparación'}</span></p>
        </div>

        {/* PAGOS */}
        <div className="border-2 border-black p-3 text-sm font-bold">
          <div className="flex justify-between"><span>TOTAL:</span> <span>${costoTotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-600"><span>ANTICIPO:</span> <span>-${anticipo.toFixed(2)}</span></div>
          <div className="flex justify-between text-lg border-t border-black mt-2 pt-1"><span>SALDO LIQUIDADO:</span> <span>${saldoPagado > 0 ? saldoPagado.toFixed(2) : '0.00'}</span></div>
        </div>

        {/* GARANTÍA */}
        <div className="text-xs border-2 border-black p-3 text-justify">
          <p className="font-bold text-center uppercase mb-1">Políticas de Garantía</p>
          <p>• Garantía válida únicamente sobre el trabajo realizado descrito en este recibo. No aplica en equipos mojados, golpeados o intervenidos por terceros. Indispensable presentar este recibo.</p>
        </div>

        {/* QRS Y FIRMAS (mt-auto los empuja al final) */}
        <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t-2 border-black">
          <div className="flex gap-2 justify-center">
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" className="w-20 h-20" onLoad={() => setQrsCargados(prev => prev + 1)}/>
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" className="w-20 h-20" onLoad={() => setQrsCargados(prev => prev + 1)}/>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
            <div><div className="border-b border-black h-12"></div>Firma Cliente</div>
            <div><div className="border-b border-black h-12"></div>Firma Asesor</div>
          </div>
        </div>

        <p className="text-center font-black uppercase text-lg">¡Gracias por tu preferencia!</p>
      </div>
    </div>
  );
}