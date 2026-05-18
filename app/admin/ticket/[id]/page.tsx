'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TicketDetail() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Cargar los datos del ticket
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}`)
      .then(res => res.json())
      .then(data => {
        setTicket(data.ticket);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [ticketId]);

  // Función para cambiar el estado
  const cambiarEstado = async (nuevoEstado: string) => {
    // Si la página tiene un estado de "Cargando", puedes activarlo aquí
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticket.id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        // Actualizamos la pantalla instantáneamente sin recargar
        setTicket({ ...ticket, estado: nuevoEstado });
        alert(`✅ Estado actualizado a ${nuevoEstado.replace('_', ' ')}`);
      } else {
        alert('❌ Error al actualizar el estado');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    }
  };
  // Función para abrir WhatsApp con un mensaje predeterminado
// Función para abrir WhatsApp con un mensaje predeterminado
 // 1. TU FUNCIÓN ORIGINAL: Para enviar el estatus actual del equipo
  const abrirWhatsApp = () => {
    try {
      const telefono = ticket.clientes?.telefono;
      if (!telefono) {
        alert('Este cliente no tiene un teléfono registrado.');
        return;
      }

      const telefonoStr = String(telefono);
      const numeroLimpio = telefonoStr.replace(/\D/g, '');
      const numeroConCodigo = numeroLimpio.startsWith('52') ? numeroLimpio : `52${numeroLimpio}`;

      const marca = ticket.equipos?.marca || 'equipo';
      const modelo = ticket.equipos?.modelo || '';
      const estadoActual = String(ticket.estado || '').replace(/_/g, ' ');
      
      const mensaje = `Hola ${ticket.clientes?.nombre}, te informamos desde MovilPlace que tu dispositivo ${marca} ${modelo} se encuentra en estado: ${estadoActual}.`;
      
      const url = `https://wa.me/${numeroConCodigo}?text=${encodeURIComponent(mensaje)}`;
      
      const nuevaPestana = window.open(url, '_blank');
      if (!nuevaPestana) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error al abrir WhatsApp:", error);
      alert('Hubo un error al intentar abrir WhatsApp.');
    }
  };

  // 2. NUEVA FUNCIÓN: Exclusiva para pedir la reseña de Google y Encuesta
  const abrirWhatsAppResena = () => {
    try {
      const telefono = ticket.clientes?.telefono;
      if (!telefono) {
        alert('Este cliente no tiene un teléfono registrado.');
        return;
      }

      const telefonoStr = String(telefono);
      const numeroLimpio = telefonoStr.replace(/\D/g, '');
      const numeroConCodigo = numeroLimpio.startsWith('52') ? numeroLimpio : `52${numeroLimpio}`;

      const marca = ticket.equipos?.marca || 'equipo';
      const modelo = ticket.equipos?.modelo || '';

      const mensaje = `¡Hola ${ticket.clientes?.nombre}! 👋\n\nNos da mucho gusto haberte entregado tu ${marca} ${modelo} al 100% 📱✨\n\nPara nosotros es súper importante tu opinión. ¿Nos regalarías 1 minuto para calificarnos con 5 estrellas en Google? ⭐️⭐️⭐️⭐️⭐️\n\nNos ayuda muchísimo a crecer:\n👉 https://maps.app.goo.gl/Cz6SupwJpqQemdAY7\n\nY si quieres dejarnos sugerencias, aquí está nuestra encuesta rápida:\n👉 https://forms.gle/TdJQcXYvyqJias5p6\n\n¡Gracias por confiar en MovilPlace!`;
      
      const url = `https://wa.me/${numeroConCodigo}?text=${encodeURIComponent(mensaje)}`;
      
      const nuevaPestana = window.open(url, '_blank');
      if (!nuevaPestana) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error al abrir WhatsApp de reseña:", error);
      alert('Hubo un error al intentar abrir WhatsApp.');
    }
  };
  if (loading) return <div className="p-10 text-center text-slate-500">Cargando detalles...</div>;
  if (!ticket) return <div className="p-10 text-center text-red-500">No se encontró el ticket.</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabecera con Botón de Regreso */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.push('/admin')} className="text-slate-500 hover:text-slate-900 font-bold flex items-center gap-2">
            ← Volver al Panel
          </button>
          <div className="text-right">
            <p className="text-sm text-slate-500 font-bold uppercase">Folio de Servicio</p>
            <h1 className="text-2xl font-black text-slate-900">#{ticket.folio || ticketId.slice(0, 8)}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Información del Equipo y Cliente */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tarjeta Cliente */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Datos del Cliente</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold text-slate-800">{ticket.clientes.nombre}</p>
                  <p className="text-slate-500 font-medium mt-1"> {ticket.clientes.telefono}</p>
                </div>

                
   <div className="flex gap-2">
    {/* Botón Gris: Imprimir Ticket / Recibo */}
  <button 
    onClick={() => window.print()} 
    className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition-all flex items-center gap-2"
    title="Imprimir recibo térmico"
  >
    <span>🖨️</span> Imprimir Recibo
  </button>
  {/* Botón Azul: Notificación de estatus normal */}
  <button 
    onClick={abrirWhatsApp}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition-all flex items-center gap-2"
    title="Enviar estatus actual al cliente"
  >
    <span>💬</span> Mandar Estatus
  </button>

  {/* Botón Verde: Solo para cuando el estado sea ENTREGADO */}
  {ticket.estado === 'ENTREGADO' && (
    <button 
      onClick={abrirWhatsAppResena}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition-all flex items-center gap-2 animate-bounce"
      title="Pedir reseña de Google de 5 estrellas"
    >
      <span>⭐</span> Pedir Reseña
    </button>
  )}
</div>
              </div>
          
            </div>

            {/* Tarjeta Equipo (AQUÍ ESTÁN LOS DATOS OCULTOS) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Información Técnica</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold mb-1">Marca</p>
                  <p className="font-bold text-slate-800">{ticket.equipos.marca}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold mb-1">Modelo</p>
                  <p className="font-bold text-slate-800">{ticket.equipos.modelo}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold mb-1">IMEI</p>
                  <p className="font-mono text-sm text-slate-800 mt-1">{ticket.equipos.imei_o_serie}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                  <p className="text-xs text-red-500 font-bold mb-1">PIN / Patrón</p>
                  <p className="font-mono font-bold text-red-700">{ticket.equipos.pin_desbloqueo || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-1">Falla Reportada</p>
                  <div className="bg-slate-50 p-4 rounded-xl text-slate-700">{ticket.falla_reportada}</div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-1">Condiciones Estéticas</p>
                  <div className="bg-slate-50 p-4 rounded-xl text-slate-700">{ticket.equipos.detalles_esteticos || 'Sin detalles registrados'}</div>
                </div>
              </div>
            </div>
            
            {/* Espacio reservado para las fotos de Flutter */}
            {/* SECCIÓN DE EVIDENCIA FOTOGRÁFICA */}
{/* SECCIÓN DE EVIDENCIA FOTOGRÁFICA (GALERÍA MÚLTIPLE) */}
{ticket.equipos?.evidencia_url && (
  <div className="mt-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
      📸 Evidencia Fotográfica ({ticket.equipos.evidencia_url.split(',').length})
    </h3>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {/* Agarramos el texto, lo partimos por las comas y dibujamos cada foto */}
      {ticket.equipos.evidencia_url.split(',').map((url: string, index: number) => (
        <div key={index} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex justify-center group relative">
          <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md z-10">
            Foto {index + 1}
          </span>
          <img 
            src={url} 
            alt={`Evidencia ${index + 1}`} 
            className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform"
          />
        </div>
      ))}
    </div>
  </div>
)}
          </div>

          {/* Columna Derecha: Acciones y Estados */}
          <div className="space-y-6">
            
            {/* Panel de Control de Estados */}
            <div className="bg-slate-900 p-6 rounded-2xl shadow-lg">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Actualizar Estado</h2>
              <p className="text-white mb-4">Estado actual: <span className="font-black text-blue-400">{ticket.estado.replace(/_/g, ' ')}</span></p>
              
              <div className="flex flex-wrap gap-3 mt-8">
<button 
    onClick={() => cambiarEstado('RECIBIDO')}
    className={`px-4 py-2 rounded-lg font-bold transition-colors ${ticket.estado === 'RECIBIDO' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
  >
     Recibido
  </button>

  <button 
    onClick={() => cambiarEstado('DIAGNOSTICO')}
    className={`px-4 py-2 rounded-lg font-bold transition-colors ${ticket.estado === 'DIAGNOSTICO' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
  >
     Diagnóstico
  </button>

  <button 
    onClick={() => cambiarEstado('ESPERANDO_PIEZA')}
    className={`px-4 py-2 rounded-lg font-bold transition-colors ${ticket.estado === 'ESPERANDO_PIEZA' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
  >
     Esperando Pieza
  </button>

  <button 
    onClick={() => cambiarEstado('LISTO_PARA_ENTREGA')}
    className={`px-4 py-2 rounded-lg font-bold transition-colors ${ticket.estado === 'LISTO_PARA_ENTREGA' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
  >
     Listo para Entrega
  </button>

  <button 
    onClick={() => cambiarEstado('ENTREGADO')}
    className={`px-4 py-2 rounded-lg font-bold transition-colors ${ticket.estado === 'ENTREGADO' ? 'bg-slate-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
  >
     Entregado
  </button>

  <button 
    onClick={() => cambiarEstado('CANCELADO')}
    className={`px-4 py-2 rounded-lg font-bold transition-colors ${ticket.estado === 'CANCELADO' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
  >
     Cancelado
  </button>
  </div>
            </div>

            {/* Finanzas Rápidas */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Finanzas</h2>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600 font-medium">Anticipo:</span>
                <span className="font-black text-slate-800">${ticket.anticipo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Costo Total:</span>
                <span className="font-black text-slate-800">${ticket.costo_total || '0'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}