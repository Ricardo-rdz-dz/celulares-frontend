//modulo CRM clientes con analisis de "calor" del cliente basado en su historial de tickets, sugerencias inteligentes de promociones personalizadas y redactor de mensajes con IA para campañas de marketing directo por WhatsApp
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CRMClientes() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

  const [mensajePersonalizado, setMensajePersonalizado] = useState('');
  const [mejorandoConIA, setMejorandoConIA] = useState(false);
  const [sugerenciaIA, setSugerenciaIA] = useState<{texto: string, accion: string, icono: string} | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/crm`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setClientes(data.clientes || []);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  // ✨ FUNCIÓN PARA CALCULAR EL "CALOR" DEL CLIENTE
  const calcularEstadoCliente = (historial: any[]) => {
    if (!historial || historial.length === 0) return { color: 'border-slate-200 bg-white', texto: 'Sin registro', dias: 0, nivel: 'GRIS' };
    
    // Asumimos que el historial está ordenado por fecha de creación (del más reciente al más viejo)
    const ultimoTicket = new Date(historial[0].created_at);
    const hoy = new Date();
    // Cálculo preciso de diferencia en días
    const diferenciaTiempo = Math.abs(hoy.getTime() - ultimoTicket.getTime());
    const diasPasados = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    if (diasPasados <= 30) {
      return { color: 'border-slate-200 bg-white', texto: `Reciente (Hace ${diasPasados} días)`, dias: diasPasados, nivel: 'GRIS' };
    } else if (diasPasados > 30 && diasPasados <= 60) {
      return { color: 'border-emerald-400 bg-emerald-50', texto: `Inactivo (Hace ${diasPasados} días)`, dias: diasPasados, nivel: 'VERDE' };
    } else if (diasPasados > 60 && diasPasados <= 90) {
      return { color: 'border-amber-400 bg-amber-50', texto: `Dormido (Hace ${diasPasados} días)`, dias: diasPasados, nivel: 'AMARILLO' };
    } else {
      return { color: 'border-red-400 bg-red-50', texto: `En Riesgo (Hace ${diasPasados} días)`, dias: diasPasados, nivel: 'ROJO' };
    }
  };

  const cargarPlantilla = (tipoPromo: string) => {
    if (!clienteSeleccionado) return;
    
    let mensaje = '';
    const primerEquipo = clienteSeleccionado.historial?.[0]?.equipos?.marca || 'dispositivo';

    switch (tipoPromo) {
      case 'SEGUIMIENTO':
        mensaje = `¡Hola ${clienteSeleccionado.nombre}! 👋 Soy de MovilPlace.\n\nHace un tiempo reparamos tu ${primerEquipo}. Solo escribía para saber si todo ha seguido funcionando al 100% o si necesitas alguna revisión sin costo.`;
        break;
      case 'SMARTWATCH':
        mensaje = `¡Hola ${clienteSeleccionado.nombre}! 👋 Soy de MovilPlace.\n\nComo eres cliente preferencial, te escribo para darte un acceso exclusivo: nos acaban de llegar nuevos Smartwatches ⌚️.\n\nPrecio normal: $1,000\n🔥 *Tu precio especial: $600*`;
        break;
      case 'DESCUENTO_REPARACION':
        mensaje = `¡Hola ${clienteSeleccionado.nombre}! 👋 Te extrañamos en MovilPlace.\n\nTe regalamos un cupón del *15% de descuento* en tu próxima reparación o en la compra de cualquier accesorio válido por todo este mes. 🎟️\n\n¿Tienes algún equipo que necesite mantenimiento?`;
        break;
      case 'NUEVO_INVENTARIO':
        mensaje = `¡Hola ${clienteSeleccionado.nombre}! 👋 Te saludamos de MovilPlace.\n\nSolo queríamos avisarte que nos acaba de llegar nuevo inventario de celulares y accesorios a súper precios 📱✨.\n\nSi estabas pensando en renovar equipo, avísame y te mando el catálogo sin compromiso.`;
        break;
      default:
        mensaje = `¡Hola ${clienteSeleccionado.nombre}! 👋 Te saludamos de MovilPlace...`;
    }

    const leyendaAntiSpam = `\n\n_(Si prefieres no recibir estas promociones, responde "NO")_`;
    setMensajePersonalizado(mensaje + leyendaAntiSpam);
    
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const mejorarMensajeIA = async () => {
    setMejorandoConIA(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/mejorar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: mensajePersonalizado, cliente: clienteSeleccionado.nombre })
      });
      if (res.ok) {
        const data = await res.json();
        const mensajeFinal = `${data.mensajeMejorado}\n\n_(Si prefieres no recibir estas promociones, responde "NO")_`;
        setMensajePersonalizado(mensajeFinal);
      } else alert('❌ Hubo un error de conexión con el servidor.');
    } catch (e) { console.error(e); }
    setMejorandoConIA(false);
  };

  const enviarMensajeLibre = () => {
    if (!clienteSeleccionado || !mensajePersonalizado) return;
    let telefonoLimpio = String(clienteSeleccionado.telefono).replace(/\D/g, '');
    const numeroConCodigo = telefonoLimpio.startsWith('52') ? telefonoLimpio : `52${telefonoLimpio}`;
    const url = `https://wa.me/${numeroConCodigo}?text=${encodeURIComponent(mensajePersonalizado)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    setMensajePersonalizado('');
    
    if (clienteSeleccionado) {
      const estado = calcularEstadoCliente(clienteSeleccionado.historial);
      
      // ✨ LÓGICA DEL BANNER BASADA EN TIEMPO
      if (estado.nivel === 'GRIS') {
        setSugerenciaIA({ 
          icono: '⏳',
          texto: `Visita muy reciente. Es pronto para enviar promociones. Espera un poco más para no saturarlo.`, 
          accion: 'SEGUIMIENTO' // Oculto o inactivo
        });
      } else if (estado.nivel === 'VERDE') {
        setSugerenciaIA({ 
          icono: '✅',
          texto: `Han pasado ${estado.dias} días. Es el momento perfecto para un mensaje de seguimiento de calidad sobre su última reparación.`, 
          accion: 'SEGUIMIENTO' 
        });
      } else if (estado.nivel === 'AMARILLO') {
        setSugerenciaIA({ 
          icono: '🎟️',
          texto: `Cliente dormido (${estado.dias} días). Envíale un cupón del 15% de descuento para reactivarlo.`, 
          accion: 'DESCUENTO_REPARACION' 
        });
      } else if (estado.nivel === 'ROJO') {
        setSugerenciaIA({ 
          icono: '📱',
          texto: `Cliente en riesgo de perderse (>90 días). Ofrécele ver el nuevo catálogo para ver si necesita renovar su celular.`, 
          accion: 'NUEVO_INVENTARIO' 
        });
      }
    } else {
      setSugerenciaIA(null);
    }
  }, [clienteSeleccionado]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* PANEL IZQUIERDO: LISTA DE CLIENTES */}
      <div className="w-full md:w-1/3 bg-slate-100/50 border-r border-slate-200 h-screen overflow-y-auto flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 flex justify-between items-center z-10 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Directorio de Clientes</h2>
          <button 
            onClick={() => router.push('/admin')} 
            className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-400 shadow-sm px-3 py-1.5 rounded-lg transition-all active:scale-95"
          >
            Volver
          </button>
        </div>
        
        {loading ? (
          <div className="p-10 text-center text-sm font-medium text-slate-400 animate-pulse">Sincronizando registros...</div>
        ) : (
          <div className="p-4 space-y-3">
            {clientes.map(cliente => {
              const isActive = clienteSeleccionado?.id === cliente.id;
              const estadoCalor = calcularEstadoCliente(cliente.historial);

              return (
                <div 
                  key={cliente.id} 
                  onClick={() => setClienteSeleccionado(cliente)}
                  className={`relative p-5 cursor-pointer rounded-2xl transition-all duration-200 border-2 group
                    ${isActive 
                      ? 'border-blue-500 shadow-md transform scale-[1.02] bg-white' 
                      : `${estadoCalor.color} hover:border-blue-300 hover:shadow-sm`
                    }`}
                >
                  {/* Borde izquierdo decorativo para el activo */}
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-blue-500 rounded-r-full"></div>}
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-bold text-sm ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
                        {cliente.nombre}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1">
                        📱 {cliente.telefono}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center mt-4">
                    <span className="text-[9px] font-bold bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {estadoCalor.texto}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-md ${isActive ? 'bg-blue-50 text-blue-700' : 'bg-white border border-slate-200 text-slate-700'}`}>
                      LTV: ${cliente.total_gastado}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PANEL DERECHO: DETALLE Y MARKETING */}
      <div className="w-full md:w-2/3 h-screen overflow-y-auto bg-white p-6 md:p-10">
        {clienteSeleccionado ? (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            
            <div className="bg-slate-900 px-8 py-6 rounded-2xl shadow-lg flex justify-between items-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-black tracking-tight">{clienteSeleccionado.nombre}</h2>
                <p className="text-sm text-slate-400 font-mono mt-1">{clienteSeleccionado.telefono}</p>
              </div>
              <div className="text-right relative z-10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Cliente desde</p>
                <p className="text-sm font-medium">{new Date(clienteSeleccionado.created_at).toLocaleDateString()}</p>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
            </div>

            {/* BANNER DE SUGERENCIA INTELIGENTE (Cambia de color) */}
            {sugerenciaIA && (
              <div className={`border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm
                ${sugerenciaIA.icono === '⏳' ? 'bg-slate-50 border-slate-200' : 
                  sugerenciaIA.icono === '✅' ? 'bg-emerald-50 border-emerald-200' : 
                  sugerenciaIA.icono === '🎟️' ? 'bg-amber-50 border-amber-200' : 
                  'bg-red-50 border-red-200'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-2xl animate-bounce">
                    {sugerenciaIA.icono}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-1">Análisis de Cliente</h4>
                    <p className="text-sm text-slate-700 font-medium leading-snug">{sugerenciaIA.texto}</p>
                  </div>
                </div>
                {sugerenciaIA.icono !== '⏳' && (
                  <button 
                    onClick={() => cargarPlantilla(sugerenciaIA.accion)}
                    className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors shadow-md active:scale-95"
                  >
                    Cargar Plantilla Sugerida
                  </button>
                )}
              </div>
            )}

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Plantillas Comerciales</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button onClick={() => cargarPlantilla('SEGUIMIENTO')} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-center active:scale-95">
                  <div className="text-2xl">✅</div><h4 className="font-bold text-slate-800 text-[10px] uppercase">Seguimiento</h4>
                </button>
                <button onClick={() => cargarPlantilla('SMARTWATCH')} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-center active:scale-95">
                  <div className="text-2xl">⌚️</div><h4 className="font-bold text-slate-800 text-[10px] uppercase">Smartwatch</h4>
                </button>
                <button onClick={() => cargarPlantilla('DESCUENTO_REPARACION')} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-center active:scale-95">
                  <div className="text-2xl">🎟️</div><h4 className="font-bold text-slate-800 text-[10px] uppercase">Cupón 15%</h4>
                </button>
                <button onClick={() => cargarPlantilla('NUEVO_INVENTARIO')} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-center active:scale-95">
                  <div className="text-2xl">📱</div><h4 className="font-bold text-slate-800 text-[10px] uppercase">Catálogo</h4>
                </button>
              </div>

              {/* REDACTOR PERSONALIZADO */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Redactor del Mensaje</h3>
                <textarea
                  value={mensajePersonalizado}
                  onChange={(e) => setMensajePersonalizado(e.target.value)}
                  placeholder="El texto de tu promoción aparecerá aquí..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all h-32 resize-none"
                ></textarea>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={mejorarMensajeIA}
                    disabled={mejorandoConIA || !mensajePersonalizado}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    {mejorandoConIA ? '✨ Procesando...' : '✨ Mejorar Texto'}
                  </button>
                  <button
                    onClick={enviarMensajeLibre}
                    disabled={!mensajePersonalizado}
                    className="flex-1 bg-[#25D366] hover:bg-[#1DA851] text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    💬 Enviar por WhatsApp
                  </button>
                </div>
              </div>

            </div>

            {/* HISTORIAL DE SERVICIOS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Historial de Servicios ({clienteSeleccionado.historial?.length})
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {clienteSeleccionado.historial?.map((ticket: any) => (
                  <div key={ticket.id} className="px-8 py-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        {ticket.equipos?.marca} {ticket.equipos?.modelo}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        Falla: <span className="font-normal text-slate-600">{ticket.falla_reportada}</span>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 mb-2">
                        {ticket.estado.replace(/_/g, ' ')}
                      </div>
                      <div className="font-black text-slate-900">${ticket.costo_total || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center mb-4 bg-slate-50">
              <span className="text-3xl opacity-50">👥</span>
            </div>
            <p className="font-black text-slate-700 text-lg">Panel en Espera</p>
            <p className="text-sm mt-1 font-medium text-slate-500">Selecciona un cliente para ver qué promoción ofrecerle.</p>
          </div>
        )}
      </div>
    </div>
  );
}