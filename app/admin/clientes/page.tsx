'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CRMClientes() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/crm`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setClientes(data.clientes || []);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  // Función constructora de mensajes de WhatsApp
  const enviarPromoWhatsApp = (cliente: any, tipoPromo: string) => {
    let telefonoLimpio = String(cliente.telefono).replace(/\D/g, '');
    const numeroConCodigo = telefonoLimpio.startsWith('52') ? telefonoLimpio : `52${telefonoLimpio}`;
    
    let mensaje = '';
    const primerEquipo = cliente.historial[0]?.equipos?.marca || 'dispositivo';

    switch (tipoPromo) {
      case 'SMARTWATCH':
        mensaje = `¡Hola ${cliente.nombre}! 👋 Soy de MovilPlace, donde reparamos tu ${primerEquipo}.\n\nComo eres cliente preferencial, te escribo para darte un acceso exclusivo: nos acaban de llegar nuevos Smartwatches ⌚️.\n\nPrecio normal: $1,000\n🔥 *Tu precio especial: $600*\n\nEstán volando, ¿te separo uno?`;
        break;
      case 'DESCUENTO_REPARACION':
        mensaje = `¡Hola ${cliente.nombre}! 👋 En MovilPlace valoramos mucho tu preferencia.\n\nTe regalamos un cupón del *15% de descuento* en tu próxima reparación o en la compra de cualquier accesorio válido por todo este mes. 🎟️\n\n¿Tienes algún equipo que necesite mantenimiento?`;
        break;
      case 'NUEVO_INVENTARIO':
        mensaje = `¡Hola ${cliente.nombre}! 👋 Te saludamos de MovilPlace.\n\nSolo queríamos avisarte que nos acaba de llegar nuevo inventario de celulares y accesorios a súper precios 📱✨.\n\nSi estabas pensando en renovar equipo, avísame y te mando el catálogo sin compromiso.`;
        break;
      default:
        mensaje = `¡Hola ${cliente.nombre}! 👋 Te saludamos de MovilPlace...`;
    }

    const url = `https://wa.me/${numeroConCodigo}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* PANEL IZQUIERDO: LISTA DE CLIENTES */}
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 h-screen overflow-y-auto flex flex-col">
        <div className="p-5 border-b border-gray-200 bg-slate-900 text-white sticky top-0 flex justify-between items-center z-10">
          <h2 className="text-lg font-black uppercase tracking-wide">👥 Mis Clientes</h2>
          <button onClick={() => router.push('/admin')} className="text-xs bg-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-600 transition-colors">Volver</button>
        </div>
        
        {loading ? (
          <div className="p-10 text-center text-gray-400">Cargando base de datos...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {clientes.map(cliente => (
              <div 
                key={cliente.id} 
                onClick={() => setClienteSeleccionado(cliente)}
                className={`p-4 cursor-pointer transition-all hover:bg-blue-50 ${clienteSeleccionado?.id === cliente.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
              >
                <h3 className="font-bold text-slate-800">{cliente.nombre}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">📱 {cliente.telefono}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{cliente.historial?.length} reparaciones</span>
                  <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full">LTV: ${cliente.total_gastado}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL DERECHO: DETALLE Y MARKETING */}
      <div className="w-full md:w-2/3 h-screen overflow-y-auto bg-slate-50 p-6">
        {clienteSeleccionado ? (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            
            {/* CABECERA DEL CLIENTE */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-black text-slate-800 uppercase">{clienteSeleccionado.nombre}</h2>
              <p className="text-slate-500 font-mono mt-1">{clienteSeleccionado.telefono}</p>
              <p className="text-xs text-slate-400 mt-2">Cliente desde: {new Date(clienteSeleccionado.created_at).toLocaleDateString()}</p>
            </div>

            {/* BOTONES DE MARKETING Y VENTAS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">🎯 Acciones de Venta y Fidelización</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => enviarPromoWhatsApp(clienteSeleccionado, 'SMARTWATCH')} className="bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-xl font-bold shadow-sm transition-all text-left flex flex-col gap-1 group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">⌚️</span>
                  <span className="text-sm">Ofrecer Reloj</span>
                  <span className="text-[9px] font-normal opacity-80">Promo preferencial</span>
                </button>
                <button onClick={() => enviarPromoWhatsApp(clienteSeleccionado, 'DESCUENTO_REPARACION')} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold shadow-sm transition-all text-left flex flex-col gap-1 group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🎟️</span>
                  <span className="text-sm">Cupón 15%</span>
                  <span className="text-[9px] font-normal opacity-80">Próxima reparación</span>
                </button>
                <button onClick={() => enviarPromoWhatsApp(clienteSeleccionado, 'NUEVO_INVENTARIO')} className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl font-bold shadow-sm transition-all text-left flex flex-col gap-1 group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">📱</span>
                  <span className="text-sm">Catálogo</span>
                  <span className="text-[9px] font-normal opacity-80">Equipos nuevos</span>
                </button>
              </div>
            </div>

            {/* HISTORIAL DE REPARACIONES */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">🛠️ Historial de Tickets ({clienteSeleccionado.historial?.length})</h3>
              <div className="space-y-3">
                {clienteSeleccionado.historial?.map((ticket: any) => (
                  <div key={ticket.id} className="p-4 bg-slate-50 border border-gray-100 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">{ticket.equipos?.marca} {ticket.equipos?.modelo}</div>
                      <div className="text-xs text-slate-500 mt-1">Falla: {ticket.falla_reportada}</div>
                      <div className="text-[10px] text-slate-400 mt-2">
                        📅 {new Date(ticket.created_at).toLocaleDateString()} a las {new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black px-2 py-1 bg-gray-200 rounded text-gray-600 mb-2">{ticket.estado.replace(/_/g, ' ')}</div>
                      <div className="font-bold text-slate-800">${ticket.costo_total || 0}</div>
                    </div>
                  </div>
                ))}
                {clienteSeleccionado.historial?.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No hay reparaciones registradas.</p>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <span className="text-6xl mb-4">👋</span>
            <p className="font-medium">Selecciona un cliente de la lista</p>
            <p className="text-sm">para ver su historial y enviar promociones.</p>
          </div>
        )}
      </div>
    </div>
  );
}