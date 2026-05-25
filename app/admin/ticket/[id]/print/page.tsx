// recibo final de reparacion 
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
    <div className="p-2 md:p-6 max-w-4xl w-full mx-auto bg-white text-black font-sans bg-transparent print:p-0">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 1cm; size: letter portrait; }
          body { padding: 0; -webkit-print-color-adjust: exact; }
          .print-hidden { display: none !important; }
          .hoja-completa { height: 26cm !important; }
        }
      `}} />

      {/* BOTONES DE ACCIÓN */}
      <div className="mb-4 flex gap-4 print-hidden">
        <button onClick={() => router.push('/admin')} className="border px-4 py-2 rounded">⬅️ Volver</button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-2 rounded font-bold">🖨️ Imprimir Recibo Completo</button>
      </div>

      {/* CONTENEDOR TAMAÑO CARTA */}
      <div className="border-2 border-black p-6 hoja-completa flex flex-col relative space-y-4">
        
        {/* ENCABEZADO */}
        <div className="text-center border-b-2 border-black pb-3">
          <h1 className="text-4xl font-black uppercase tracking-wider">MovilPlace</h1>
          <p className="text-sm font-bold uppercase tracking-widest mt-1 bg-black text-white inline-block px-4 py-1">Recibo de Servicio Final</p>
          <p className="text-xs text-gray-700 mt-2">Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia (Soriana Hiper)</p>
        </div>

        {/* DATOS TICKET */}
        <div className="flex justify-between font-bold text-sm border-b border-black pb-2">
          <p>FOLIO: #{ticket.id.toString().substring(0, 8).toUpperCase()}</p>
          <p>FECHA ENTREGA: {new Date().toLocaleDateString()}</p>
        </div>

        {/* DATOS CLIENTE Y EQUIPO */}
        <div className="border border-black p-4 text-sm grid grid-cols-2 gap-4">
          <p><strong>CLIENTE:</strong> {ticket.clientes?.nombre.toUpperCase()}</p>
          <p><strong>TELÉFONO:</strong> {ticket.clientes?.telefono}</p>
          <p><strong>EQUIPO:</strong> {ticket.equipos?.marca} {ticket.equipos?.modelo}</p>
          <p><strong>FALLA REPORTADA:</strong> {ticket.falla_reportada.toUpperCase()}</p>
          <div className="col-span-2">
            <p><strong>TRABAJO REALIZADO:</strong></p>
            <p className="italic text-gray-800">{ticket.diagnostico || 'Mantenimiento y reparación general'}</p>
          </div>
        </div>

        {/* PAGOS */}
        <div className="border-2 border-black p-4 text-sm font-bold bg-gray-50">
          <div className="flex justify-between mb-1"><span>COSTO TOTAL DEL SERVICIO:</span> <span>${costoTotal.toFixed(2)}</span></div>
          <div className="flex justify-between mb-1 text-gray-600"><span>ANTICIPO RECIBIDO:</span> <span>-${anticipo.toFixed(2)}</span></div>
          <div className="flex justify-between text-lg border-t-2 border-black mt-2 pt-2"><span>SALDO LIQUIDADO:</span> <span>${saldoPagado > 0 ? saldoPagado.toFixed(2) : '0.00'}</span></div>
        </div>

        {/* POLÍTICAS DE GARANTÍA DETALLADAS */}
        <div className="text-xs border-2 border-black p-4 text-justify space-y-2">
          <p className="font-bold text-center uppercase border-b border-black pb-2 mb-2">Políticas de Garantía</p>
          <p>• Se otorga una garantía de <strong>15 días</strong> sobre la reparación realizada a partir de la fecha de entrega.</p>
          <p>• La garantía queda <strong>totalmente anulada</strong> si el dispositivo presenta signos de humedad, golpes, pantallas quebradas, rayones o cualquier daño físico posterior a la entrega.</p>
          <p>• Usted cuenta con un plazo máximo de <strong>15 días</strong> naturales para recoger su dispositivo una vez notificado que está listo. Pasado este tiempo, MovilPlace ya no se hace responsable por el dispositivo.</p>
          <p>• Es indispensable presentar este recibo original (físico o digital) para hacer válida cualquier reclamación.</p>
        </div>

        {/* QRS Y FIRMAS (mt-auto los empuja al final de la hoja) */}
        <div className="grid grid-cols-2 gap-6 mt-auto pt-4 border-t-2 border-black">
          
          <div className="flex gap-4 items-center">
            <div className="text-center">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" className="w-20 h-20" onLoad={() => setQrsCargados(prev => prev + 1)}/>
              <p className="text-[9px] font-bold mt-1">ENCUESTA DE SATISFACCIÓN</p>
            </div>
            <div className="text-center">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" className="w-20 h-20" onLoad={() => setQrsCargados(prev => prev + 1)}/>
              <p className="text-[9px] font-bold mt-1">CALIFÍCANOS EN GOOGLE</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center text-[10px] font-bold">
            <div><div className="border-b-2 border-black h-16"></div>Firma Cliente</div>
            <div><div className="border-b-2 border-black h-16"></div>Firma Asesor</div>
          </div>
        </div>

        <p className="text-center font-black uppercase text-xl">¡Gracias por su preferencia!</p>
      </div>
    </div>
  );
}