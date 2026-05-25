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
    <div className="p-8 max-w-2xl mx-auto bg-white text-black font-sans text-xs bg-transparent">
      
      {/* ✨ MAGIA CSS PARA LIMPIAR LA IMPRESIÓN DE ENCABEZADOS Y URLS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Esto elimina los textos de URL, fecha y título del navegador */
          @page { margin: 0; }
          /* Esto le devuelve un margen interno seguro al diseño para que no se pegue al borde del papel */
          body { padding: 1cm; }
        }
      `}} />

      {/* BOTÓN AUXILIAR (Oculto al imprimir) */}
      <div className="mb-6 flex justify-between items-center border-b pb-4 print:hidden">
        <button onClick={() => router.push(`/admin/ticket/${id}`)} className="border px-3 py-1.5 rounded hover:bg-slate-50 font-medium">
          ⬅️ Volver a Gestión
        </button>
        <button onClick={() => window.print()} className="bg-slate-950 text-white px-4 py-1.5 rounded font-bold">
          🖨️ Lanzar Impresión
        </button>
      </div>

      {/* RECUADRO DE DISEÑO DE NOTA FÍSICA (TIPO TALONARIO) */}
      <div className="border border-black p-6 space-y-4 relative">
        
        {/* ENCABEZADO: TIPO TICKET ACTUAL */}
        <div className="text-center border-b-2 border-black pb-4 mb-2">
          <h1 className="text-3xl font-black uppercase tracking-widest">MOVILPLACE</h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1">Nota de Servicio</p>
          <p className="text-[10px] text-gray-700 leading-tight mt-2">
            Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia<br/>
            Centro comercial Soriana Hiper
          </p>
          <div className="flex justify-center gap-3 text-[10px] font-bold mt-2 text-gray-800">
            <span>Reparaciones: 686 172 0406</span> | 
            <span>Desbloqueos: 686 168 7729</span> | 
            <span>Ventas: 686 176 4066</span>
          </div>
        </div>

        {/* FOLIO Y FECHA */}
        <div className="flex justify-between items-center text-xs font-bold font-mono">
          <p className="text-sm">FOLIO: <span className="text-red-600">#{folio}</span></p>
          <p>FECHA: {new Date(ticket.created_at).toLocaleDateString()} {new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>

        {/* DATOS DEL CLIENTE Y EQUIPO EN FORMATO COMPACTO */}
        <div className="border border-black p-2 grid grid-cols-2 gap-2 text-[11px]">
          <div><span className="font-bold">Cliente:</span> {ticket.clientes?.nombre}</div>
          <div><span className="font-bold">Teléfono:</span> {ticket.clientes?.telefono}</div>
          <div><span className="font-bold">Marca:</span> {ticket.equipos?.marca}</div>
          <div><span className="font-bold">Modelo:</span> {ticket.equipos?.modelo}</div>
          <div><span className="font-bold">IMEI/Serie:</span> {ticket.equipos?.imei_o_serie || 'N/A'}</div>
          <div><span className="font-bold">Contraseña/PIN:</span> {ticket.equipos?.pin_desbloqueo || 'N/A'}</div>
        </div>

        {/* CONDICIONES ESTÉTICAS Y DE RECEPCIÓN (La cadena compilada en el paso 1) */}
        <div className="text-[10px] bg-gray-50 border border-gray-300 p-2 leading-tight">
          <span className="font-bold block mb-1">CONDICIONES DE RECEPCIÓN:</span>
          {/* Aquí se imprimirá todo el texto con los SÍ/NO de los accesorios y el color */}
          <p className="font-mono">{ticket.equipos?.detalles_esteticos || 'No se registraron condiciones.'}</p>
        </div>

        {/* PROBLEMA Y DINERO */}
        <div className="flex gap-4 items-stretch">
          <div className="flex-1 border border-black p-2 text-xs">
            <span className="font-bold block mb-1 uppercase">Problema Reportado:</span>
            <p>{ticket.falla_reportada}</p>
          </div>
          
          <div className="w-40 border border-black divide-y divide-black text-xs font-bold font-mono">
            <div className="flex justify-between p-1.5">
              <span>TOTAL:</span><span>${ticket.costo_total || 0}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-gray-100">
              <span>ANTICIPO:</span><span>${ticket.anticipo || 0}</span>
            </div>
            <div className="flex justify-between p-1.5 text-sm bg-gray-200">
              <span>RESTA:</span><span>${saldoRestante}</span>
            </div>
          </div>
        </div>

        {/* CLÁUSULAS LEGALES EXACTAS */}
        <div className="text-[9px] border border-black p-2 mt-4 space-y-1 text-justify font-medium">
          <p>• Usted tiene un máximo de 15 días para recoger su equipo, de lo contrario pasará a ser propiedad de la empresa.</p>
          <p>• Teléfonos golpeados y mojados no tienen garantía.</p>
          <p>• Garantía de 15 días sobre la misma falla.</p>
          <p>• Toda revisión tiene un costo de $100.00 MXN.</p>
          <p className="font-bold text-center mt-1 uppercase underline">Recuerde retirar su memoria SD y tarjeta SIM.</p>
        </div>

        {/* ZONA DE PROMOCIÓN DE REFERIDOS */}
        {ticket.clientes?.codigo_referido && (
          <div className="p-2 border border-black border-dashed bg-gray-100 text-center">
            <p className="text-[10px] font-bold uppercase mb-1">🎁 ¡Gana Saldo a Favor!</p>
            <p className="text-[9px] text-gray-700 leading-tight">Comparte este código con un amigo. Él recibe un descuento y tú ganas saldo en tu próxima visita:</p>
            <p className="text-sm font-black font-mono tracking-widest mt-1 bg-white border border-black inline-block px-3 py-0.5">
              {ticket.clientes.codigo_referido}
            </p>
          </div>
        )}

        {/* FIRMAS */}
        <div className="pt-10 grid grid-cols-2 gap-10 text-center">
          <div>
            <div className="border-b border-black w-full mx-auto h-12"></div>
            <p className="text-[10px] font-bold mt-1 uppercase">Firma Cliente Satisfecho</p>
          </div>
          <div>
            <div className="border-b border-black w-full mx-auto h-12"></div>
            <p className="text-[10px] font-bold mt-1 uppercase">Firma del Asesor</p>
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