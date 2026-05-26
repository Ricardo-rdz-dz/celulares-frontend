'use client';
import { useEffect, useState, useRef } from 'react';

// =====================================================================
// COMPONENTE: Carrusel Premium 
// =====================================================================
const CarruselImagenes = ({ equipo }: { equipo: any }) => {
  let fotos: string[] = [];
  
  if (Array.isArray(equipo.galeria) && equipo.galeria.length > 0) {
    fotos = equipo.galeria;
  } else if (typeof equipo.galeria === 'string' && equipo.galeria.length > 2) {
    try {
      const limpiado = equipo.galeria.replace(/^{|}$/g, '').replace(/"/g, '');
      fotos = limpiado.split(',').map((url: string) => url.trim()).filter(Boolean);
    } catch(e) {}
  }
  if (fotos.length === 0 && equipo.imagen_url) fotos = [equipo.imagen_url];

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (fotos.length === 0) {
    return (
      <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-300">
        <span className="text-5xl block mb-2 drop-shadow-sm">📱</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Sin Foto</span>
      </div>
    );
  }

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const newIndex = Math.round(scrollPosition / width);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <div className="relative w-full h-full group">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {fotos.map((foto: string, idx: number) => (
          <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative bg-white">
            <img src={foto} alt={`${equipo.nombre} - ${idx + 1}`} className="w-full h-full object-contain p-2" />
          </div>
        ))}
      </div>

      {fotos.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); scrollToIndex(currentIndex === 0 ? fotos.length - 1 : currentIndex - 1); }} 
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 text-black w-6 h-6 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm sm:flex hidden text-xs"
          >◀</button>
          <button 
            onClick={(e) => { e.stopPropagation(); scrollToIndex(currentIndex === fotos.length - 1 ? 0 : currentIndex + 1); }} 
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 text-black w-6 h-6 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm sm:flex hidden text-xs"
          >▶</button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {fotos.map((_, idx: number) => (
              <div key={idx} className={`transition-all duration-300 rounded-full ${idx === currentIndex ? 'bg-slate-800 w-3 h-1' : 'bg-slate-300 w-1 h-1'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// =====================================================================
// PÁGINA PRINCIPAL: TIENDA EQUIPOS
// =====================================================================
export default function TiendaEquipos() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  
  // ✨ NUEVO ESTADO: Controla qué equipo está abierto en la ventana de detalles
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<any | null>(null);

  useEffect(() => {
    const cargarInventario = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventario`);
        const data = await res.json();
        if (data.success && data.productos) {
          const disponibles = data.productos.filter((item: any) => 
            item.cantidad > 0 && item.tipo?.toUpperCase() === 'DISPOSITIVO'
          );
          setEquipos(disponibles);
          setEquiposFiltrados(disponibles);
        }
      } catch (error) {
        console.error("Error al cargar inventario:", error);
      }
      setLoading(false);
    };
    cargarInventario();
  }, []);

  useEffect(() => {
    const filtrados = equipos.filter(equipo => 
      equipo.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      equipo.sku?.toLowerCase().includes(busqueda.toLowerCase())
    );
    setEquiposFiltrados(filtrados);
  }, [busqueda, equipos]);

  const agregarAlCarrito = (equipo: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === equipo.id);
      if (existe) {
        if (existe.cantidad_carrito >= equipo.cantidad) {
          alert('Has alcanzado el límite de stock de este equipo.');
          return prev;
        }
        return prev.map(item => item.id === equipo.id ? { ...item, cantidad_carrito: item.cantidad_carrito + 1 } : item);
      }
      return [...prev, { ...equipo, cantidad_carrito: 1 }];
    });
    setMostrarCarrito(true); 
    setEquipoSeleccionado(null); // Cierra el modal si estaba abierto
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const totalCarrito = carrito.reduce((sum, item) => sum + (parseFloat(item.precio_venta) * item.cantidad_carrito), 0);

  const procesarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;
    let mensaje = `Buen día MovilPlace. Me interesa adquirir:\n\n`;
    carrito.forEach(item => {
      mensaje += `▪️ ${item.cantidad_carrito}x ${item.nombre}\n   SKU: ${item.sku}\n   Precio: $${item.precio_venta}\n\n`;
    });
    mensaje += `*TOTAL ESTIMADO: $${totalCarrito.toFixed(2)}*\n\nMe gustaría confirmar disponibilidad.`;
    window.open(`https://wa.me/526861764066?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      <style dangerouslySetInnerHTML={{__html: `.scrollbar-hide::-webkit-scrollbar { display: none; }`}} />

      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 py-3 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900">MOVILPLACE</h1>
          <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tienda Oficial</p>
        </div>
        <button 
          onClick={() => setMostrarCarrito(true)}
          className="relative p-2 text-xl hover:bg-slate-100 transition-colors rounded-lg active:scale-95"
        >
          🛒
          {carrito.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
              {carrito.length}
            </span>
          )}
        </button>
      </nav>

      {/* HERO SECTION */}
      <div className="bg-slate-900 pt-10 pb-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 tracking-tight">Catálogo de Equipos</h2>
          <div className="relative max-w-2xl">
            <span className="absolute left-4 top-3.5 text-slate-400 text-lg">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por modelo o SKU..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-400 text-sm font-medium outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-500 transition-all shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* GRID DE DISPOSITIVOS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-10 relative z-10">
        {loading ? (
          <div className="text-center font-bold text-sm text-slate-400 mt-20 animate-pulse bg-white p-8 rounded-2xl shadow-sm inline-block mx-auto">
            Sincronizando inventario...
          </div>
        ) : equiposFiltrados.length === 0 ? (
          <div className="text-center font-medium text-sm text-slate-500 mt-10 py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
            No se encontraron equipos con esa búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {equiposFiltrados.map((equipo) => (
              <div 
                key={equipo.id} 
                onClick={() => setEquipoSeleccionado(equipo)} // ✨ Abre el modal al cliquear la tarjeta
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                
                <div className="aspect-square bg-white relative overflow-hidden border-b border-slate-50">
                  <CarruselImagenes equipo={equipo} />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur border border-slate-100 text-slate-800 text-[9px] font-black px-2 py-0.5 rounded shadow-sm pointer-events-none">
                    Stock: {equipo.cantidad}
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">SKU: {equipo.sku}</p>
                    <h3 className="font-bold text-sm leading-tight text-slate-800 line-clamp-2 mb-3 h-10">{equipo.nombre}</h3>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-black text-emerald-600 tracking-tight">${parseFloat(equipo.precio_venta).toFixed(2)}</span>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // ✨ Evita que se abra el modal si solo querían agregarlo directo
                        agregarAlCarrito(equipo);
                      }}
                      className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-colors shadow-md"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✨ VENTANA MODAL DE DETALLES DEL PRODUCTO */}
      {equipoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative max-h-[90vh]">
            
            {/* Botón de cerrar flotante (Móvil y Desktop) */}
            <button 
              onClick={() => setEquipoSeleccionado(null)} 
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-slate-100 text-slate-800 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm backdrop-blur transition-colors"
            >
              ✖
            </button>

            {/* Lado Izquierdo: Galería Grande */}
            <div className="w-full md:w-1/2 bg-slate-50 relative aspect-square md:aspect-auto border-b md:border-b-0 md:border-r border-slate-200">
              <CarruselImagenes equipo={equipoSeleccionado} />
            </div>

            {/* Lado Derecho: Información Detallada */}
            <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col overflow-y-auto">
              <div>
                <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                  SKU: {equipoSeleccionado.sku}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
                  {equipoSeleccionado.nombre}
                </h2>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-4xl font-black text-emerald-600 tracking-tighter">
                    ${parseFloat(equipoSeleccionado.precio_venta).toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-slate-400 border-l border-slate-200 pl-4">
                    Stock disponible: {equipoSeleccionado.cantidad}
                  </span>
                </div>
              </div>

              {/* Sección de Descripción Detallada */}
              <div className="flex-1 mb-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
                  Detalles del Equipo
                </h3>
                <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {equipoSeleccionado.descripcion ? (
                    equipoSeleccionado.descripcion
                  ) : (
                    <span className="italic opacity-60">Sin descripción detallada para este artículo.</span>
                  )}
                </div>
              </div>

              {/* Botón de Acción Principal en el Modal */}
              <button 
                onClick={() => agregarAlCarrito(equipoSeleccionado)}
                className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                Añadir a la Cesta
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SIDEBAR DEL CARRITO (Se mantiene igual) */}
      {mostrarCarrito && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-black tracking-tight text-slate-900">Cesta de Equipos</h2>
              <button onClick={() => setMostrarCarrito(false)} className="text-slate-400 hover:text-slate-800 text-xl transition-colors bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center">✖</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50">
              {carrito.length === 0 ? (
                <div className="text-center text-slate-400 mt-20 flex flex-col items-center">
                  <span className="text-4xl mb-3 block opacity-50">🛒</span>
                  <p className="font-medium text-sm">Tu cesta está vacía.</p>
                </div>
              ) : (
                carrito.map((item) => {
                  let portada = item.imagen_url;
                  if (Array.isArray(item.galeria) && item.galeria.length > 0) portada = item.galeria[0];
                  else if (typeof item.galeria === 'string' && item.galeria.length > 2) {
                    try { portada = item.galeria.replace(/^{|}$/g, '').replace(/"/g, '').split(',')[0].trim(); } catch(e){}
                  }

                  return (
                    <div key={item.id} className="flex gap-3 bg-white border border-slate-100 p-3 items-center rounded-2xl shadow-sm">
                      <div className="w-16 h-16 bg-white overflow-hidden shrink-0 flex items-center justify-center border border-slate-50 rounded-xl">
                        {portada ? <img src={portada} className="w-full h-full object-contain p-1" /> : '📱'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">SKU: {item.sku}</p>
                        <h4 className="font-bold text-sm leading-tight text-slate-800 mb-1 truncate">{item.nombre}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Cant: {item.cantidad_carrito}</span>
                          <span className="font-black text-sm text-emerald-600">${parseFloat(item.precio_venta).toFixed(2)}</span>
                        </div>
                      </div>
                      <button onClick={() => eliminarDelCarrito(item.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <span className="text-lg">🗑️</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
              <div className="flex justify-between items-end mb-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Estimado</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">${totalCarrito.toFixed(2)}</span>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={procesarPedidoWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-black py-4 rounded-xl text-sm uppercase tracking-widest active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-lg shadow-green-500/20"
                >
                  💬 Contactar Ventas
                </button>
                <p className="text-center text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-wide">
                  Confirma disponibilidad por WhatsApp
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}