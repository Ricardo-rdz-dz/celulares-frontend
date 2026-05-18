'use client';

import { useEffect, useState, use } from 'react';

export default function PrintTicket({ params }: { params: Promise<{ id: string }> }) {
  // 1. Extraemos el ID correctamente para las versiones nuevas de Next.js
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        // 2. Usamos el ticketId que ya extraímos
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}`);
        const data = await res.json();
        setTicket(data.ticket);
        
        setTimeout(() => {
          window.print();
        }, 500);
      } catch (error) {
        console.error('Error al cargar ticket para imprimir:', error);
      }
    };
    fetchTicket();
  // 3. Le decimos al useEffect que vigile el ticketId
  }, [ticketId]);

  if (!ticket) return <div className="p-10 text-center font-mono text-black">Generando recibo...</div>;

  return (
    <div className="p-4 max-w-sm mx-auto text-black bg-white font-mono text-sm">
      
      {/* ENCABEZADO */}
      <h1 className="text-xl font-bold text-center mb-1 uppercase">Mi Taller de Reparación</h1>
      <p className="text-center text-[10px] mb-2 uppercase">Centro de Soluciones Móviles</p>
      <p className="text-center font-bold border-b border-t border-black border-dashed py-1 mb-4">
        TICKET DE RECEPCIÓN
      </p>

      {/* DATOS DEL TICKET */}
      <div className="mb-4">
        <p><strong>FOLIO:</strong> #{ticket.id.toString().substring(0, 8).toUpperCase()}</p>
        <p><strong>FECHA:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
      </div>

      {/* DATOS DEL CLIENTE */}
      <div className="mb-4 border-b border-black border-dashed pb-2">
        <p><strong>CLIENTE:</strong> {ticket.clientes?.nombre.toUpperCase()}</p>
        <p><strong>TELÉFONO:</strong> {ticket.clientes?.telefono}</p>
      </div>

      {/* DATOS DEL EQUIPO */}
      <div className="mb-4 border-b border-black border-dashed pb-2">
        <p><strong>EQUIPO:</strong> {ticket.equipos?.marca} {ticket.equipos?.modelo}</p>
        <p><strong>FALLA:</strong> {ticket.falla_reportada.toUpperCase()}</p>
        <p className="mt-2"><strong>CONDICIONES:</strong></p>
        <p className="pl-2 text-[12px] italic">{ticket.equipos?.detalles_esteticos || 'SIN DETALLES'}</p>
      </div>

      {/* COBROS */}
      <div className="mb-6 flex justify-between font-bold text-lg border-b-2 border-black py-1">
        <span>ANTICIPO:</span>
        <span>${ticket.anticipo}</span>
      </div>

      {/* TÉRMINOS Y CONDICIONES */}
      <div className="text-[9px] text-justify leading-tight mb-6">
        <p className="font-bold mb-1 text-center uppercase border-b border-black border-dotted">Términos y Condiciones</p>
        <p>• Equipos abandonados por más de 15 días ya no serán responsabilidad de MovilPlace.</p>
        <p>• No hay garantía en equipos mojados, golpeados o intervenidos por terceros.</p>
        <p>• Es obligatorio presentar este ticket para cualquier trámite.</p>
      </div>

     {/* ENCUESTA DE SERVICIO */}
      <div className="my-6 p-2 border border-black border-dashed rounded-lg text-center bg-gray-50 flex flex-col items-center">
        <p className="font-bold text-[12px] mb-1">⭐ ENCUESTA DE SERVICIO ⭐</p>
        <p className="text-[11px] mb-2">Escanea el código y cuéntanos qué te pareció nuestro servicio:</p>
        
        {/* Generador automático de QR */}
        <img 
          src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" 
          alt="QR Encuesta" 
          className="w-20 h-20 mt-1 mb-2"
        />
        
        <p className="text-[9px] text-gray-500">¡Tu opinión nos ayuda a mejorar!</p>
      </div>

      <p className="text-center font-bold mt-4 uppercase">¡Gracias por tu confianza!</p>
      <p className="text-center text-[9px] mt-1">Visítanos pronto</p>

    </div>
  );
}