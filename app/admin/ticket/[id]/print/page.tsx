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

  // Cálculos de saldo (Ajusta 'ticket.costo_total' si en tu BD se llama distinto, ej: 'ticket.precio')
  const costoTotal = parseFloat(ticket.costo_total || ticket.precio || 0);
  const anticipo = parseFloat(ticket.anticipo || 0);
  const saldoPagado = costoTotal - anticipo;

  const folio = ticket.id.toString().substring(0, 8).toUpperCase();

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

      {/* BOTONES DE ACCIÓN */}
      <div className="mb-3 flex justify-between items-center border-b pb-1 print:hidden">
        <button onClick={() => router.push('/admin')} className="border px-2.5 py-1 rounded hover:bg-slate-50 font-medium text-xs">
          ⬅️ Volver al Panel
        </button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-3 py-1 rounded font-bold shadow hover:bg-emerald-700 text-xs">
          🖨️ Imprimir Recibo Final
        </button>
      </div>

      {/* RECUADRO DE DISEÑO ULTRA COMPACTO */}
      <div className="border border-black p-3 space-y-2 relative">
        
        {/* ENCABEZADO */}
        <div className="text-center border-b border-black pb-1.5 mb-0.5">
          <h1 className="text-2xl font-black uppercase tracking-wider leading-none">MOVILPLACE</h1>
          <p className="text-[9px] font-bold uppercase tracking-widest mt-1 bg-black text-white inline-block px-3 py-0.5">Comprobante de Compra</p>
          <p className="text-[9px] text-gray-700 leading-tight mt-1">
            Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia (Soriana Hiper)
          </p>
          <div className="flex justify-center gap-2 text-[8px] font-bold mt-0.5 text-gray-600">
            <span>Ventas: 686 176 4066</span> | <span>Reparaciones: 686 172 0406</span>
          </div>
        </div>

        {/* FOLIO Y FECHA */}
        <div className="flex justify-between items-center text-[10px] font-bold font-mono">
          <p>FOLIO: <span className="text-emerald-600">#V-{folio}</span></p>
          <p>FECHA ENTREGA: {new Date().toLocaleDateString()}</p>
        </div>

        {/* DATOS DEL CLIENTE */}
        <div className="border-t border-b border-dashed border-black py-1 text-xs">
          <p><strong>CLIENTE:</strong> {ticket.clientes?.nombre.toUpperCase()}</p>
          <p><strong>TELÉFONO:</strong> {ticket.clientes?.telefono}</p>
        </div>

        {/* DETALLES DEL SERVICIO */}
        <div className="border-b border-dashed border-black pb-1.5 text-xs">
          <p className="mb-0.5"><strong>EQUIPO:</strong> {ticket.equipos?.marca} {ticket.equipos?.modelo}</p>
          <p className="mb-0.5"><strong>MOTIVO DE INGRESO:</strong> {ticket.falla_reportada.toUpperCase()}</p>
          <p className="mt-1 font-bold">TRABAJO REALIZADO / NOTAS:</p>
          <p className="pl-1 text-[10px] italic uppercase text-gray-700">{ticket.diagnostico || 'MANTENIMIENTO Y REPARACIÓN GENERAL'}</p>
        </div>

        {/* DESGLOSE DE COBROS */}
        <div className="border-b border-black pb-1.5">
          <div className="flex justify-between text-xs mb-0.5">
            <span>COSTO TOTAL DEL SERVICIO:</span>
            <span>${costoTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mb-0.5 text-gray-600">
            <span>ANTICIPO RECIBIDO:</span>
            <span>-${anticipo.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black text-sm mt-1 pt-1 border-t border-black border-dashed">
            <span>SALDO LIQUIDADO:</span>
            <span>${saldoPagado > 0 ? saldoPagado.toFixed(2) : '0.00'}</span>
          </div>
        </div>

        {/* POLÍTICAS DE GARANTÍA */}
        <div className="text-[8px] border border-black p-1.5 space-y-0.5 text-justify leading-tight font-medium bg-gray-50">
          <p className="font-bold text-center border-b border-gray-300 pb-0.5 uppercase mb-0.5">Políticas de Garantía</p>
          <p>• La garantía aplica <strong>únicamente</strong> sobre la refacción instalada o el trabajo específico realizado descrito en este recibo.</p>
          <p>• <strong>NO hay garantía</strong> en equipos que presenten humedad posterior, golpes, caídas o que hayan sido abiertos por terceros.</p>
          <p>• Es indispensable presentar este recibo (físico o digital) para hacer válida cualquier reclamación.</p>
        </div>

        {/* --- SECCIÓN DE CÓDIGOS QR REINTEGRADOS A SU TAMAÑO ORIGINAL (`w-20 h-20`) --- */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="p-1.5 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
            <p className="font-black text-[8px] tracking-wide mb-0.5">¡AYÚDANOS A MEJORAR!</p>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" 
              alt="QR Encuesta" 
              className="w-20 h-20"
              onLoad={() => setQrsCargados(prev => prev + 1)}
            />
            <p className="text-[7px] text-gray-500 leading-none mt-0.5">Escanea la encuesta</p>
          </div>

          <div className="p-1.5 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
            <p className="font-black text-[8px] tracking-wide mb-0.5">⭐⭐⭐⭐⭐ CALIFÍCANOS</p>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" 
              alt="QR Google Maps" 
              className="w-20 h-20"
              onLoad={() => setQrsCargados(prev => prev + 1)}
            />
            <p className="text-[7px] text-gray-500 leading-none mt-0.5">Apóyanos con una reseña</p>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-dashed border-gray-300">
          <p className="text-[10px] font-black uppercase tracking-wider leading-none">¡Gracias por tu preferencia!</p>
          <p className="text-[9px] text-gray-600 mt-0.5">MovilPlace - Siempre conectados</p>
        </div>

      </div>

      {/* ESTILOS CSS EXCLUSIVOS PARA IMPRESIÓN */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}