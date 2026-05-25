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

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white text-black font-sans text-xs bg-transparent">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; }
          body { padding: 1cm; }
        }
      `}} />

      {/* BOTONES DE ACCIÓN */}
      <div className="mb-6 flex justify-between items-center border-b pb-4 print:hidden">
        <button onClick={() => router.push('/admin')} className="border px-3 py-1.5 rounded hover:bg-slate-50 font-medium">
          ⬅️ Volver al Panel
        </button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-4 py-1.5 rounded font-bold shadow hover:bg-emerald-700">
          🖨️ Imprimir Recibo Final
        </button>
      </div>

      {/* --- INICIO DEL DISEÑO DEL RECIBO FINAL --- */}
      
      {/* ENCABEZADO */}
      <h1 className="text-xl font-black text-center mb-1 uppercase tracking-wider">MovilPlace</h1>
      <p className="text-center text-[10px] mb-2 uppercase text-gray-700">Centro de Soluciones Móviles</p>
      <p className="text-center font-black text-sm border-b-2 border-t-2 border-black py-1.5 mb-4 uppercase tracking-widest">
        RECIBO DE SERVICIO
      </p>

      {/* DATOS DEL TICKET */}
      <div className="mb-4 text-xs flex justify-between">
        <div>
          <p><strong>FOLIO:</strong> #{ticket.id.toString().substring(0, 8).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p><strong>FECHA ENTREGA:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* DATOS DEL CLIENTE */}
      <div className="mb-4 border-b border-black border-dashed pb-2 text-xs">
        <p><strong>CLIENTE:</strong> {ticket.clientes?.nombre.toUpperCase()}</p>
        <p><strong>TELÉFONO:</strong> {ticket.clientes?.telefono}</p>
      </div>

      {/* DETALLES DEL SERVICIO */}
      <div className="mb-4 border-b border-black border-dashed pb-3 text-xs">
        <p className="mb-1"><strong>EQUIPO:</strong> {ticket.equipos?.marca} {ticket.equipos?.modelo}</p>
        {/* Mostramos la falla original como referencia y el diagnóstico/trabajo final si lo tienes */}
        <p className="mb-1"><strong>MOTIVO DE INGRESO:</strong> {ticket.falla_reportada.toUpperCase()}</p>
        <p className="mt-2 font-bold">TRABAJO REALIZADO / NOTAS:</p>
        <p className="pl-2 text-[10px] italic uppercase">{ticket.diagnostico || 'MANTENIMIENTO Y REPARACIÓN GENERAL'}</p>
      </div>

      {/* DESGLOSE DE COBROS */}
      <div className="mb-6 border-b-2 border-black pb-2">
        <p className="font-bold mb-2 text-center uppercase border-b border-gray-300 pb-1">Desglose de Pago</p>
        <div className="flex justify-between text-xs mb-1">
          <span>COSTO TOTAL DEL SERVICIO:</span>
          <span>${costoTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs mb-1 text-gray-600">
          <span>ANTICIPO RECIBIDO:</span>
          <span>-${anticipo.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-black text-sm mt-2 pt-2 border-t border-black border-dashed">
          <span>SALDO LIQUIDADO:</span>
          <span>${saldoPagado > 0 ? saldoPagado.toFixed(2) : '0.00'}</span>
        </div>
      </div>

      {/* POLÍTICAS DE GARANTÍA */}
      <div className="text-[9px] text-justify leading-tight mb-6 bg-gray-50 p-2 rounded border border-gray-200">
        <p className="font-bold mb-1 text-center uppercase border-b border-gray-300 pb-1">Políticas de Garantía</p>
        <p className="mb-1">• La garantía aplica <strong>únicamente</strong> sobre la refacción instalada o el trabajo específico realizado descrito en este recibo.</p>
        <p className="mb-1">• <strong>NO hay garantía</strong> en equipos que presenten humedad posterior, golpes, caídas o que hayan sido abiertos por terceros.</p>
        <p>• Es indispensable presentar este recibo (físico o digital) para hacer válida cualquier reclamación.</p>
      </div>

      {/* --- SECCIÓN DE CÓDIGOS QR --- */}
      <div className="my-6 space-y-3">
        
        {/* 1. ENCUESTA DE SERVICIO */}
        <div className="p-2 border border-black border-dashed rounded-lg text-center flex flex-col items-center">
          <p className="font-black text-[11px] mb-1 tracking-wide">¡AYÚDANOS A MEJORAR!</p>
          <p className="text-[9px] mb-2 leading-tight">Escanea y cuéntanos qué te pareció nuestro servicio:</p>
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" 
            alt="QR Encuesta" 
            className="w-20 h-20 mt-1 mb-2"
            onLoad={() => setQrsCargados(prev => prev + 1)}
          />
        </div>

        {/* 2. VALORACIÓN DE GOOGLE */}
        <div className="p-2 border border-black border-dashed rounded-lg text-center flex flex-col items-center">
          <p className="font-black text-[11px] mb-1 tracking-wide">⭐⭐⭐⭐⭐ CALIFÍCANOS</p>
          <p className="text-[9px] mb-2 leading-tight">¿Quedaste satisfecho con tu reparación? Apóyanos con una reseña:</p>
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" 
            alt="QR Google Maps" 
            className="w-20 h-20 mt-1 mb-2"
            onLoad={() => setQrsCargados(prev => prev + 1)}
          />
          <p className="text-[8px] text-gray-500 font-bold mt-1">¡Tus 5 estrellas nos ayudan a crecer!</p>
        </div>

      </div>

      <p className="text-center font-black mt-6 uppercase text-[12px] tracking-widest">¡Gracias por tu preferencia!</p>
      <p className="text-center text-[10px] mt-1 text-gray-600">MovilPlace - Siempre conectados</p>

      {/* ESTILOS CSS EXCLUSIVOS PARA IMPRESIÓN */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print\:hidden {
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