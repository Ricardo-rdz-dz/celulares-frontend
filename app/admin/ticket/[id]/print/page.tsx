'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function PrintTicket({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;
  const router = useRouter(); // Necesario para el botón de volver

  const [ticket, setTicket] = useState<any>(null);
  // ✨ NUEVO ESTADO: Rastrea cuántas imágenes QR han cargado exitosamente
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

  // ✨ NUEVA LÓGICA DE IMPRESIÓN INTELIGENTE
  useEffect(() => {
    // Solo disparamos la impresión si el ticket existe Y los 2 QRs ya se descargaron
    if (ticket && qrsCargados >= 2) {
      setTimeout(() => {
        window.print();
      }, 300); // Pequeño margen de seguridad visual
    }
  }, [ticket, qrsCargados]);

  if (!ticket) return <div className="p-10 text-center font-mono text-black">Generando recibo...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white text-black font-sans text-xs bg-transparent">
      
      {/* ✨ MAGIA CSS PARA LIMPIAR LA IMPRESIÓN DEL RECIBO FINAL */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Elimina los textos de URL, fecha y título de la pestaña */
          @page { margin: 0; }
          /* Devuelve un espacio interno seguro para que el recibo no se pegue al ras del papel */
          body { padding: 1cm; }
        }
      `}} />

      {/* BOTONES DE ACCIÓN (Asegúrate de tener la clase print:hidden o similar para que no se impriman) */}
      <div className="mb-6 flex justify-between items-center border-b pb-4 print:hidden">
        <button onClick={() => router.push('/admin')} className="border px-3 py-1.5 rounded hover:bg-slate-50 font-medium">
          ⬅️ Volver al Panel
        </button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-4 py-1.5 rounded font-bold shadow hover:bg-emerald-700">
          🖨️ Imprimir Recibo Final
        </button>
      </div>

      {/* Aquí abajo continúa el diseño de tu recibo de entrega final... */}

      {/* --- INICIO DEL DISEÑO DEL TICKET --- */}
      
      {/* ENCABEZADO */}
      <h1 className="text-xl font-bold text-center mb-1 uppercase">MovilPlace</h1>
      <p className="text-center text-[10px] mb-2 uppercase">Centro de Soluciones Móviles</p>
      <p className="text-center font-bold border-b border-t border-black border-dashed py-1 mb-4">
        TICKET DE RECEPCIÓN
      </p>

      {/* DATOS DEL TICKET */}
      <div className="mb-4 text-xs">
        <p><strong>FOLIO:</strong> #{ticket.id.toString().substring(0, 8).toUpperCase()}</p>
        <p><strong>FECHA:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
      </div>

      {/* DATOS DEL CLIENTE */}
      <div className="mb-4 border-b border-black border-dashed pb-2 text-xs">
        <p><strong>CLIENTE:</strong> {ticket.clientes?.nombre.toUpperCase()}</p>
        <p><strong>TELÉFONO:</strong> {ticket.clientes?.telefono}</p>
      </div>

      {/* DATOS DEL EQUIPO */}
      <div className="mb-4 border-b border-black border-dashed pb-2 text-xs">
        <p><strong>EQUIPO:</strong> {ticket.equipos?.marca} {ticket.equipos?.modelo}</p>
        <p><strong>FALLA:</strong> {ticket.falla_reportada.toUpperCase()}</p>
        <p className="mt-2"><strong>CONDICIONES:</strong></p>
        <p className="pl-2 text-[10px] italic">{ticket.equipos?.detalles_esteticos || 'SIN DETALLES'}</p>
      </div>

      {/* COBROS */}
      <div className="mb-6 flex justify-between font-bold text-base border-b-2 border-black py-1">
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

      {/* --- SECCIÓN DE CÓDIGOS QR --- */}
      <div className="my-6 space-y-3">
        
        {/* 1. ENCUESTA DE SERVICIO */}
        <div className="p-2 border border-black border-dashed rounded-lg text-center bg-gray-50 flex flex-col items-center">
          <p className="font-bold text-[11px] mb-1">ENCUESTA DE SERVICIO</p>
          <p className="text-[9px] mb-2 leading-tight">Escanea y cuéntanos qué te pareció nuestro servicio:</p>
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" 
            alt="QR Encuesta" 
            className="w-20 h-20 mt-1 mb-2"
            onLoad={() => setQrsCargados(prev => prev + 1)} // ✨ Avisa cuando termina de cargar
          />
          <p className="text-[8px] text-gray-500">¡Tu opinión nos ayuda a mejorar!</p>
        </div>

        {/* 2. VALORACIÓN DE GOOGLE */}
        <div className="p-2 border border-black border-dashed rounded-lg text-center bg-gray-50 flex flex-col items-center">
          <p className="font-bold text-[11px] mb-1">⭐⭐⭐⭐⭐ CALIFÍCANOS</p>
          <p className="text-[9px] mb-2 leading-tight">¿Satisfecho con tu reparación? Apóyanos con una reseña:</p>
          
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" 
            alt="QR Google Maps" 
            className="w-20 h-20 mt-1 mb-2"
            onLoad={() => setQrsCargados(prev => prev + 1)} // ✨ Avisa cuando termina de cargar
          />
          <p className="text-[8px] text-gray-500">¡Nos ayuda muchísimo a crecer!</p>
        </div>

      </div>

      <p className="text-center font-bold mt-4 uppercase text-[12px]">¡Gracias por tu confianza!</p>
      <p className="text-center text-[10px] mt-1">Visítanos pronto</p>

      {/* ESTILOS CSS EXCLUSIVOS PARA IMPRESIÓN (Para asegurar que los fondos grises se impriman) */}
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