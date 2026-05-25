// NOTA DE RECEPCION DE EQUIPO PARA REPARACION - FORMATO DE TALONARIO FISICO
// Este diseño es para imprimir una nota física que se le entrega al cliente al dejar su equipo para reparación. 
// Contiene toda la información relevante del ticket, cliente, equipo, condiciones y cláusulas legales.
// El diseño está optimizado para impresión en papel tamaño carta o similar, con márgenes adecuados y sin elementos innecesarios.
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
    <div className="p-4 md:p-6 max-w-3xl w-full mx-auto bg-white text-black font-sans bg-transparent print:p-0 print:max-w-full">
      
      {/* ✨ MAGIA CSS PARA HOJA TAMAÑO CARTA EXACTA */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 1cm; size: letter portrait; }
          body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
        }
      `}} />

      {/* BOTÓN AUXILIAR (Oculto al imprimir) */}
      <div className="mb-4 flex justify-between items-center border-b pb-4 print:hidden">
        <button onClick={() => router.push(`/admin/ticket/${id}`)} className="border px-4 py-2 rounded hover:bg-slate-50 font-medium">
          ⬅️ Volver a Gestión
        </button>
        <button onClick={() => window.print()} className="bg-slate-950 text-white px-6 py-2 rounded font-bold">
          🖨️ Lanzar Impresión
        </button>
      </div>

      {/* RECUADRO DE DISEÑO DE NOTA FÍSICA (Abarca el 85% de la hoja para no saltar de página) */}
      <div className="border-2 border-black p-6 flex flex-col min-h-[85vh] space-y-4 relative">
        
        {/* ENCABEZADO: TIPO TICKET ACTUAL */}
        <div className="text-center border-b-2 border-black pb-4">
          <h1 className="text-3xl font-black uppercase tracking-widest mb-1">MOVILPLACE</h1>
          <p className="text-sm font-bold uppercase tracking-widest mt-1 bg-black text-white inline-block px-4 py-1">Nota de Servicio</p>
          <p className="text-xs text-gray-700 leading-tight mt-2">
            Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia<br/>
            Centro comercial Soriana Hiper
          </p>
          <div className="flex justify-center gap-4 text-xs font-bold mt-2 text-gray-800">
            <span>Reparaciones: 686 172 0406</span> | 
            <span>Desbloqueos: 686 168 7729</span> | 
            <span>Ventas: 686 176 4066</span>
          </div>
        </div>

        {/* FOLIO Y FECHA */}
        <div className="flex justify-between items-center text-sm font-bold font-mono">
          <p className="text-lg">FOLIO: <span className="text-red-600">#{folio}</span></p>
          <p>FECHA: {new Date(ticket.created_at).toLocaleDateString()} {new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>

        {/* DATOS DEL CLIENTE Y EQUIPO */}
        <div className="border-2 border-black p-3 grid grid-cols-2 gap-3 text-sm">
          <div><span className="font-bold">Cliente:</span> {ticket.clientes?.nombre}</div>
          <div><span className="font-bold">Teléfono:</span> {ticket.clientes?.telefono}</div>
          <div><span className="font-bold">Marca:</span> {ticket.equipos?.marca}</div>
          <div><span className="font-bold">Modelo:</span> {ticket.equipos?.modelo}</div>
          <div><span className="font-bold">IMEI/Serie:</span> {ticket.equipos?.imei_o_serie || 'N/A'}</div>
          <div><span className="font-bold">Contraseña/PIN:</span> {ticket.equipos?.pin_desbloqueo || 'N/A'}</div>
        </div>

        {/* CONDICIONES ESTÉTICAS Y DE RECEPCIÓN */}
        <div className="text-sm bg-gray-50 border-2 border-gray-300 p-3 leading-tight">
          <span className="font-bold block mb-1">CONDICIONES DE RECEPCIÓN:</span>
          <p className="font-mono">{ticket.equipos?.detalles_esteticos || 'No se registraron condiciones.'}</p>
        </div>

        {/* PROBLEMA Y DINERO */}
        <div className="flex gap-4 items-stretch">
          <div className="flex-1 border-2 border-black p-3 text-sm">
            <span className="font-bold block mb-1 uppercase">Problema Reportado:</span>
            <p>{ticket.falla_reportada}</p>
          </div>
          
          <div className="w-56 border-2 border-black divide-y-2 divide-black text-sm font-bold font-mono">
            <div className="flex justify-between p-2">
              <span>TOTAL:</span><span>${ticket.costo_total || 0}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-100">
              <span>ANTICIPO:</span><span>${ticket.anticipo || 0}</span>
            </div>
            <div className="flex justify-between p-2 text-base bg-gray-200">
              <span>RESTA:</span><span>${saldoRestante}</span>
            </div>
          </div>
        </div>

        {/* CLÁUSULAS LEGALES EXACTAS */}
        <div className="text-xs border-2 border-black p-3 space-y-1 text-justify font-medium">
          <p>• Usted tiene un máximo de 15 días para recoger su equipo, de lo contrario pasará a ser propiedad de la empresa.</p>
          <p>• Teléfonos golpeados y mojados no tienen garantía.</p>
          <p>• Garantía de 15 días sobre la misma falla.</p>
          <p>• Toda revisión tiene un costo de $100.00 MXN.</p>
          <p className="font-bold text-center mt-2 uppercase underline text-sm">Recuerde retirar su memoria SD y tarjeta SIM.</p>
        </div>

        {/* ZONA DE PROMOCIÓN DE REFERIDOS */}
        {ticket.clientes?.codigo_referido && (
          <div className="p-3 border-2 border-black border-dashed bg-gray-100 text-center">
            <p className="text-sm font-bold uppercase mb-1">🎁 ¡Gana Saldo a Favor!</p>
            <p className="text-xs text-gray-700 leading-tight">Comparte este código con un amigo. Él recibe un descuento y tú ganas saldo en tu próxima visita:</p>
            <p className="text-lg font-black font-mono tracking-widest mt-1 bg-white border-2 border-black inline-block px-4 py-1">
              {ticket.clientes.codigo_referido}
            </p>
          </div>
        )}

        {/* FIRMAS (mt-auto las empuja siempre hacia abajo de la hoja) */}
        <div className="pt-6 grid grid-cols-2 gap-10 text-center mt-auto">
          <div>
            <div className="border-b-2 border-black w-full mx-auto h-16"></div>
            <p className="text-xs font-bold mt-2 uppercase">Firma Cliente Satisfecho</p>
          </div>
          <div>
            <div className="border-b-2 border-black w-full mx-auto h-16"></div>
            <p className="text-xs font-bold mt-2 uppercase">Firma del Asesor</p>
          </div>
        </div>

      </div>
    </div>
  );
}