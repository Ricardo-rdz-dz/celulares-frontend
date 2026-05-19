'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function NotaImpresion() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTicket(data.ticket);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [id]);

  // Ejecutar la impresión del navegador en cuanto los datos estén listos
  useEffect(() => {
    if (ticket) {
      setTimeout(() => {
        window.print();
      }, 500); // Pequeño delay para asegurar que el texto se renderice bien
    }
  }, [ticket]);

  if (loading) return <div className="p-6 text-center text-sm">Preparando documento de impresión...</div>;
  if (!ticket) return <div className="p-6 text-center text-sm">No se encontró el ticket.</div>;

  const folio = String(ticket.folio || ticket.id).slice(0, 6).toUpperCase();
  const saldoRestante = (ticket.costo_total || 0) - (ticket.anticipo || 0);

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white text-black font-sans text-xs bg-transparent">
      
      {/* BOTÓN AUXILIAR (Oculto al imprimir) */}
      <div className="mb-6 flex justify-between items-center border-b pb-4 print:hidden">
        <button onClick={() => router.push(`/admin/ticket/${id}`)} className="border px-3 py-1.5 rounded hover:bg-slate-50 font-medium">
          ⬅️ Volver a Gestión
        </button>
        <button onClick={() => window.print()} className="bg-slate-950 text-white px-4 py-1.5 rounded font-bold">
          🖨️ Lanzar Impresión
        </button>
      </div>

      {/* RECUADRO DE DISEÑO DE NOTA */}
      <div className="border border-black p-6 space-y-6">
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-start border-b border-black pb-4">
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase">MOVILPLACE</h1>
            <p className="text-[10px] text-gray-600 mt-0.5">Servicio Técnico Especializado en Celulares</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold">ORDEN DE SERVICIO</h2>
            <p className="text-base font-black font-mono">FOLIO: #{folio}</p>
            <p className="text-[10px] text-gray-500 mt-1">Fecha: {new Date(ticket.created_at).toLocaleDateString()} {new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </div>

        {/* SECCIÓN 1: DATOS DEL CLIENTE */}
        <div>
          <h3 className="font-bold border-b border-gray-300 pb-0.5 mb-2 uppercase tracking-wider text-[10px] text-gray-500">1. Datos del Cliente</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500 text-xs block">Nombre Completo</span> <span className="font-semibold">{ticket.clientes?.nombre}</span></div>
            <div><span className="text-gray-500 text-xs block">Teléfono de Contacto</span> <span className="font-mono font-semibold">{ticket.clientes?.telefono}</span></div>
          </div>
        </div>

        {/* SECCIÓN 2: DATOS DEL EQUIPO */}
        <div>
          <h3 className="font-bold border-b border-gray-300 pb-0.5 mb-2 uppercase tracking-wider text-[10px] text-gray-500">2. Especificaciones del Equipo</h3>
          <div className="grid grid-cols-3 gap-3">
            <div><span className="text-gray-400 block">Marca / Modelo</span> <span className="font-bold">{ticket.equipos?.marca} {ticket.equipos?.modelo}</span></div>
            <div><span className="text-gray-400 block">IMEI / Serie</span> <span className="font-mono">{ticket.equipos?.imei_o_serie || 'N/A'}</span></div>
            <div><span className="text-gray-400 block">PIN / Patrón</span> <span className="font-mono font-semibold">{ticket.equipos?.password_equipo || 'N/A'}</span></div>
          </div>
          <div className="mt-2 bg-gray-50 p-2 border border-gray-200 rounded">
            <span className="text-gray-500 block font-medium">Detalles Estéticos de Recepción:</span>
            <p className="italic text-gray-700">{ticket.equipos?.detalles_esteticos || 'Sin detalles registrados'}</p>
          </div>
        </div>

        {/* SECCIÓN 3: DETALLE DEL SERVICIO Y FINANZAS */}
        <div>
          <h3 className="font-bold border-b border-gray-300 pb-0.5 mb-2 uppercase tracking-wider text-[10px] text-gray-500">3. Diagnóstico y Control de Caja</h3>
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1 bg-gray-50 p-2 border border-gray-200 rounded">
              <span className="text-gray-500 block font-medium">Falla Reportada:</span>
              <p className="font-semibold text-gray-800">{ticket.falla_reportada}</p>
            </div>
            <div className="w-48 border border-black divide-y divide-gray-200 text-xs font-mono">
              <div className="flex justify-between p-1.5"><span>Costo Total:</span><span className="font-bold">${ticket.costo_total || 0}</span></div>
              <div className="flex justify-between p-1.5 bg-gray-50"><span>Anticipo:</span><span className="font-bold text-green-700">-${ticket.anticipo || 0}</span></div>
              <div className="flex justify-between p-1.5 font-bold text-sm bg-gray-100"><span>Resta pagar:</span><span>${saldoRestante}</span></div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: PÁRRAFO DE CLÁUSULAS (Esencial para notas físicas) */}
        <div className="text-[9px] text-gray-500 leading-tight border border-dashed p-3 space-y-1">
          <p className="font-bold text-black uppercase">Términos del Servicio Técnico:</p>
          <p>1. Todo equipo se recibe para revisión y diagnóstico. MovilPlace no se hace responsable por fallas ocultas no reportadas al momento de la recepción.</p>
          <p>2. Transcurridos 30 días naturales a partir de la fecha de aviso de entrega, si el equipo no es reclamado, la empresa no se hace responsable por la integridad del mismo.</p>
        </div>

        {/* SECCIÓN 5: FIRMAS EN RECONOCIMIENTO */}
        <div className="pt-8 grid grid-cols-2 gap-12 text-center">
          <div>
            <div className="border-b border-black w-44 mx-auto h-12"></div>
            <p className="text-[10px] font-bold mt-1 text-gray-700">Firma del Cliente</p>
            <p className="text-[8px] text-gray-400">Acepto los términos de recepción</p>
          </div>
          <div>
            <div className="border-b border-black w-44 mx-auto h-12"></div>
            <p className="text-[10px] font-bold mt-1 text-gray-700">Firma Técnico Receptor</p>
            <p className="text-[8px] text-gray-400">Equipo verificado y guardado</p>
          </div>
        </div>

      </div>

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
        }
      `}</style>

    </div>
  );
}