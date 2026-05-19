'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CRMClientes() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

  // ✨ NUEVOS ESTADOS PARA EL REDACTOR
  const [mensajePersonalizado, setMensajePersonalizado] = useState('');
  const [mejorandoConIA, setMejorandoConIA] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/crm`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setClientes(data.clientes || []);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  // Función constructora de mensajes rápidos
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

  // ✨ FUNCIÓN PARA CONECTAR AL MOTOR DE IA EN TU BACKEND
  const mejorarMensajeIA = async () => {
    setMejorandoConIA(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/mejorar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensaje: mensajePersonalizado, 
          cliente: clienteSeleccionado.nombre 
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMensajePersonalizado(data.mensajeMejorado);
      } else {
        alert('❌ Hubo un error de conexión con el servidor.');
      }
    } catch (e) {
      console.error(e);
    }
    setMejorandoConIA(false);
  };

  // ✨ FUNCIÓN PARA ENVIAR EL TEXTO PERSONALIZADO
  const enviarMensajeLibre = () => {
    if (!clienteSeleccionado || !mensajePersonalizado) return;
    let telefonoLimpio = String(clienteSeleccionado.telefono).replace(/\D/g, '');
    const numeroConCodigo = telefonoLimpio.startsWith('52') ? telefonoLimpio : `52${telefonoLimpio}`;
    const url = `https://wa.me/${numeroConCodigo}?text=${encodeURIComponent(mensajePersonalizado)}`;
    window.open(url, '_blank');
  };

  // Cada que cambies de cliente, limpiamos el cuadro de texto
  useEffect(() => {
    setMensajePersonalizado('');
  }, [clienteSeleccionado]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* PANEL IZQUIERDO: LISTA DE CLIENTES */}
      <div className="w-full md:w-1/3 bg-white border-r border-slate-200 h-screen overflow-y-auto flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200 bg-white sticky top-0 flex justify-between items-center z-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Directorio de Clientes</h2>
          <button 
            onClick={() => router.push('/admin')} 
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded transition-all"
          >
            Volver
          </button>
        </div>
        
        {loading ? (
          <div className="p-10 text-center text-sm font-medium text-slate-400 animate-pulse">Cargando registros...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {clientes.map(cliente => (
              <div 
                key={cliente.id} 
                onClick={() => setClienteSeleccionado(cliente)}
                className={`p-5 cursor-pointer transition-all border-l-4 ${
                  clienteSeleccionado?.id === cliente.id 
                    ? 'bg-slate-50 border-slate-800' 
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <h3 className={`font-semibold ${clienteSeleccionado?.id === cliente.id ? 'text-slate-900' : 'text-slate-700'}`}>
                  {cliente.nombre}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">{cliente.telefono}</p>
                <div className="flex gap-2 items-center mt-3">
                  <span className="text-[10px] font-semibold border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md">
                    {cliente.historial?.length} tickets
                  </span>
                  <span className="text-[10px] font-bold border border-slate-800 text-slate-800 px-2 py-0.5 rounded-md">
                    LTV: ${cliente.total_gastado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL DERECHO: DETALLE Y MARKETING */}
      <div className="w-full md:w-2/3 h-screen overflow-y-auto bg-[#f8fafc] p-8">
        {clienteSeleccionado ? (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            
            <div className="bg-white px-8 py-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{clienteSeleccionado.nombre}</h2>
                <p className="text-sm text-slate-500 font-mono mt-1">{clienteSeleccionado.telefono}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Cliente desde</p>
                <p className="text-sm text-slate-700 font-medium">{new Date(clienteSeleccionado.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Acciones Comerciales</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => enviarPromoWhatsApp(clienteSeleccionado, 'SMARTWATCH')} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-400 hover:shadow-sm transition-all text-left">
                  <div className="bg-slate-100 text-slate-600 p-2 rounded-md text-lg leading-none">⌚️</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Smartwatch</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Precio preferencial</p>
                  </div>
                </button>
                <button onClick={() => enviarPromoWhatsApp(clienteSeleccionado, 'DESCUENTO_REPARACION')} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-400 hover:shadow-sm transition-all text-left">
                  <div className="bg-slate-100 text-slate-600 p-2 rounded-md text-lg leading-none">🎟️</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Cupón 15%</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Próxima reparación</p>
                  </div>
                </button>
                <button onClick={() => enviarPromoWhatsApp(clienteSeleccionado, 'NUEVO_INVENTARIO')} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-400 hover:shadow-sm transition-all text-left">
                  <div className="bg-slate-100 text-slate-600 p-2 rounded-md text-lg leading-none">📱</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Catálogo</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Equipos nuevos</p>
                  </div>
                </button>
              </div>

              {/* ✨ NUEVO: REDACTOR PERSONALIZADO */}
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Asistente de Redacción Integrado</h3>
                <textarea
                  value={mensajePersonalizado}
                  onChange={(e) => setMensajePersonalizado(e.target.value)}
                  placeholder="Ej. Nos acaba de llegar el Motorola RAZR 2024 y el OnePlus 13R a un excelente precio..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-all h-28 resize-none"
                ></textarea>
                
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={mejorarMensajeIA}
                    disabled={mejorandoConIA || !mensajePersonalizado}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold text-sm py-2.5 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span></span> {mejorandoConIA ? 'Generando estructura...' : 'Mejorar Estructura'}
                  </button>
                  <button
                    onClick={enviarMensajeLibre}
                    disabled={!mensajePersonalizado}
                    className="flex-1 bg-slate-900 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span></span> Enviar por WhatsApp
                  </button>
                </div>
              </div>

            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 bg-white">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Historial de Servicios ({clienteSeleccionado.historial?.length})
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {clienteSeleccionado.historial?.map((ticket: any) => (
                  <div key={ticket.id} className="px-8 py-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-semibold text-slate-800">
                        {ticket.equipos?.marca} {ticket.equipos?.modelo}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        Servicio: <span className="font-normal text-slate-600">{ticket.falla_reportada}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-2">
                        {new Date(ticket.created_at).toLocaleDateString()} &bull; {new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border border-slate-200 rounded text-slate-500 mb-2">
                        {ticket.estado.replace(/_/g, ' ')}
                      </div>
                      <div className="font-bold text-slate-900">${ticket.costo_total || 0}</div>
                    </div>
                  </div>
                ))}
                {clienteSeleccionado.historial?.length === 0 && (
                  <div className="px-8 py-10 text-sm text-slate-400 text-center font-medium">
                    El cliente no cuenta con reparaciones finalizadas.
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <p className="font-semibold text-slate-600">Ningún perfil seleccionado</p>
            <p className="text-sm mt-1">Elige un cliente de la lista para gestionar su cuenta.</p>
          </div>
        )}
      </div>
    </div>
  );
}