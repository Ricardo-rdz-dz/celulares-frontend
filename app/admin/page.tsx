'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✨ NUEVOS ESTADOS PARA EL BUSCADOR Y FILTROS
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          const textError = await res.text();
          console.error("Error devuelto por Railway:", textError);
          throw new Error("No se pudo conectar a la ruta de tickets");
        }
        return res.json();
      })
      .then((data) => {
        const listaTickets = data.tickets || [];
        
        // ORDENAR: Del más viejo al más nuevo
        const ticketsOrdenados = listaTickets.sort((a: any, b: any) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

        setTickets(ticketsOrdenados);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fallo en la lectura:', err);
        setLoading(false);
      });
  }, []);

  const colorEstado = (estado: string) => {
    switch (estado) {
      case 'RECIBIDO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DIAGNOSTICO': return 'bg-slate-800 text-white border-slate-900';
      case 'ESPERANDO_PIEZA': return 'bg-red-100 text-red-700 border-red-200';
      case 'LISTO_PARA_ENTREGA': return 'bg-green-100 text-green-800 border-green-200';
      case 'ENTREGADO': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // ✨ LÓGICA DE FILTRADO EN TIEMPO REAL
  const ticketsFiltrados = tickets.filter((ticket: any) => {
    // 1. Validar el Chip de Estado
    const pasaFiltroEstado = filtroEstado === 'TODOS' || ticket.estado === filtroEstado;
    
    // 2. Validar el texto de búsqueda (ignorando mayúsculas/minúsculas)
    const termino = busqueda.toLowerCase();
    const folio = String(ticket.folio || ticket.id).toLowerCase();
    const cliente = (ticket.clientes?.nombre || '').toLowerCase();
    const equipo = `${ticket.equipos?.marca || ''} ${ticket.equipos?.modelo || ''}`.toLowerCase();

    const pasaBusqueda = folio.includes(termino) || cliente.includes(termino) || equipo.includes(termino);

    return pasaFiltroEstado && pasaBusqueda;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-slate-900 text-white border-b-4 border-red-600 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-wide uppercase">Movil<span className="text-red-500">Place</span></h1>
            <p className="text-slate-400 text-sm">Panel de Administración</p>
          </div>
          <button 
            onClick={() => router.push('/admin/nuevo')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span> Recibir Equipo
          </button>
          {/* NUEVO BOTÓN: Acceso al catálogo de precios */}
            <button 
              onClick={() => router.push('/admin/catalogo')}
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-bold border border-slate-700 transition-all flex items-center gap-2 text-sm"
              title="Configurar catálogo de precios del cotizador"
            >
              <span>⚙️</span> Agregar precios para cotizador
            </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* ✨ BARRA DE BÚSQUEDA Y FILTROS CHIPS */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          
          {/* Buscador de Texto */}
          <div className="relative w-full md:w-1/3">
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por cliente, folio o modelo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Chips de Estados */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['TODOS', 'RECIBIDO', 'DIAGNOSTICO', 'ESPERANDO_PIEZA', 'ENTREGADO'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  filtroEstado === estado 
                    ? 'bg-slate-800 text-white border-slate-900 shadow-md' 
                    : 'bg-white text-slate-600 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {estado.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
        

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Equipos Activos (Por orden de antigüedad)</h2>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-500 font-medium animate-pulse">Cargando base de datos...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-sm text-slate-400 uppercase tracking-wider font-bold">
                    <th className="p-5">Folio</th>
                    <th className="p-5">Fechas</th>
                    <th className="p-5">Cliente</th>
                    <th className="p-5">Dispositivo</th>
                    <th className="p-5">Falla</th>
                    <th className="p-5 text-center">Estado Actual</th>
                    <th className="p-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* ✨ AQUÍ USAMOS ticketsFiltrados EN LUGAR DE tickets */}
                  {ticketsFiltrados.map((ticket: any) => (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5 font-black text-slate-800">#{ticket.folio || ticket.id.slice(0,4)}</td>
                      
                      <td className="p-5 text-sm">
                        <div className="text-slate-900 font-bold" title="Fecha de recepción">
                           {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-slate-500 text-xs mb-2">
                           {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {ticket.fecha_promesa && (
                          <div className="text-amber-600 font-bold text-[11px] mt-1 bg-amber-50 px-1.5 py-0.5 rounded inline-block border border-amber-200" title="Fecha prometida al cliente">
                             Promesa: {new Date(ticket.fecha_promesa).toLocaleDateString()}
                          </div>
                        )}
                        {ticket.fecha_entrega && (
                          <div className="text-green-600 font-bold text-[11px] mt-1 bg-green-50 px-1.5 py-0.5 rounded inline-block border border-green-200 block" title="Fecha real de entrega">
                            ✅ Entregado: {new Date(ticket.fecha_entrega).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="p-5">
                        <p className="text-slate-900 font-bold">{ticket.clientes?.nombre || 'Sin nombre'}</p>
                        <p className="text-slate-500 text-sm">{ticket.clientes?.telefono}</p>
                      </td>
                      <td className="p-5">
                        <p className="text-slate-900 font-bold">{ticket.equipos?.marca} {ticket.equipos?.modelo}</p>
                        <p className="text-slate-400 text-xs font-mono bg-slate-100 px-2 py-1 rounded inline-block mt-1">IMEI: {ticket.equipos?.imei_o_serie || 'N/A'}</p>
                      </td>
                      <td className="p-5 text-slate-600 text-sm font-medium max-w-[200px] truncate">
                        {ticket.falla_reportada || 'N/A'}
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wide border ${colorEstado(ticket.estado)}`}>
                          {ticket.estado.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <button onClick={() => router.push(`/admin/ticket/${ticket.id}`)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 hover:bg-blue-600 transition-all">
                          Gestionar
                        </button>
                      </td>
                    </tr>
                    
                  ))}
                  
                  {/* ✨ MENSAJES DE ERROR / TABLA VACÍA */}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500 font-medium">
                        No hay equipos en la lista. Haz clic en "Recibir Equipo" para comenzar.
                      </td>
                    </tr>
                  )}
                  {tickets.length > 0 && ticketsFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500 font-medium">
                        No se encontraron coincidencias para la búsqueda o el filtro seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}