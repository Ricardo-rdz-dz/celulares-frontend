'use client';
import { useEffect, useState, useRef } from 'react';

// =====================================================================
// COMPONENTE NUEVO: Carrusel Premium para las fotos de la galería
// =====================================================================
const CarruselImagenes = ({ equipo }: { equipo: any }) => {
  // Verificamos si tiene la nueva galería o solo la foto vieja
  const fotos = Array.isArray(equipo.galeria) && equipo.galeria.length > 0 
    ? equipo.galeria 
    : (equipo.imagen_url ? [equipo.imagen_url] : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (fotos.length === 0) {
    return (
      <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-300">
        <span className="text-7xl block mb-4 drop-shadow-sm">📱</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Imagen Pendiente</span>
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
      {/* Contenedor con Scroll Nativo (Permite 'swipe' táctil) */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {fotos.map((foto: string, idx: number) => (
          <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
            <img src={foto} alt={`${equipo.nombre} - ${idx + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Botones de Navegación (Visibles al pasar el mouse en PC) */}
      {fotos.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); scrollToIndex(currentIndex === 0 ? fotos.length - 1 : currentIndex - 1); }} 
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md sm:flex hidden"
          >
            ◀
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); scrollToIndex(currentIndex === fotos.length - 1 ? 0 : currentIndex + 1); }} 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md sm:flex hidden"
          >
            ▶
          </button>

          {/* Puntos Indicadores (Dots) */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {fotos.map((_: any, idx: number) => (
              <div 
                key={idx} 
                className={`transition-all duration-300 rounded-full ${idx === currentIndex ? 'bg-black w-4 h-1.5' : 'bg-black/30 border border-white/50 w-1.5 h-1.5'}`} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};


// =====================================================================
// PÁGINA PRINCIPAL
// =====================================================================
export default function TiendaEquipos() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // 1. Cargar el inventario (Solo Dispositivos con Stock)
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

  // 2. Buscador en tiempo real
  useEffect(() => {
    const filtrados = equipos.filter(equipo => 
      equipo.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      equipo.sku?.toLowerCase().includes(busqueda.toLowerCase())
    );
    setEquiposFiltrados(filtrados);
  }, [busqueda, equipos]);

  // 3. Funciones del Carrito
  const agregarAlCarrito = (equipo: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === equipo.id);
      if (existe) {
        if (existe.cantidad_carrito >= equipo.cantidad) {
          alert('Has alcanzado el límite de stock disponible para este equipo exacto.');
          return prev;
        }
        return prev.map(item => item.id === equipo.id ? { ...item, cantidad_carrito: item.cantidad_carrito + 1 } : item);
      } else {
        return [...prev, { ...equipo, cantidad_carrito: 1 }];
      }
    });
    setMostrarCarrito(true); 
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const totalCarrito = carrito.reduce((sum, item) => sum + (parseFloat(item.precio_venta) * item.cantidad_carrito), 0);

  // 4. Checkout por WhatsApp
  const procesarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;

    let mensaje = `Buen día MovilPlace. Me interesa adquirir el siguiente equipo:\n\n`;
    
    carrito.forEach(item => {
      mensaje += `▪️ ${item.cantidad_carrito}x ${item.nombre}\n   SKU: ${item.sku}\n   Precio: $${item.precio_venta}\n\n`;
    });

    mensaje += `*TOTAL ESTIMADO: $${totalCarrito.toFixed(2)}*\n\nMe gustaría confirmar la disponibilidad y el proceso de compra.`;

    const url = `https://wa.me/526861764066?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-24">
      
      {/* MAGIA CSS: Ocultar barras de scroll del carrusel */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}} />

      {/* NAVBAR MINIMALISTA PREMIUM */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 p-4 sm:px-8 flex justify-between items-center bg-white/90 backdrop-blur-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-black">MOVILPLACE</h1>
          <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">Catálogo de Dispositivos</p>
        </div>
        <button 
          onClick={() => setMostrarCarrito(true)}
          className="relative p-3 text-2xl hover:bg-gray-100 transition-colors rounded-lg active:scale-95"
        >
          🛒
          {carrito.length > 0 && (
            <span className="absolute top-1 right-1 bg-black text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
              {carrito.length}
            </span>
          )}
        </button>
      </nav>

      {/* CABECERA Y BUSCADOR */}
      <div className="pt-10 pb-8 px-4 sm:px-8 max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-black text-black mb-6 tracking-tight">Equipos Disponibles</h2>
        <div className="relative max-w-3xl">
          <span className="absolute left-5 top-4 text-gray-400 text-xl">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar modelo, marca o SKU..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-14 pr-6 text-black text-lg font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all"
          />
        </div>
      </div>

      {/* GRID DE DISPOSITIVOS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {loading ? (
          <div className="text-center font-bold text-xl text-gray-400 mt-20 animate-pulse">Sincronizando inventario...</div>
        ) : equiposFiltrados.length === 0 ? (
          <div className="text-center font-medium text-lg text-gray-500 mt-20 py-20 border border-gray-200 border-dashed rounded-xl">
            No se encontraron dispositivos que coincidan con tu búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {equiposFiltrados.map((equipo) => (
              <div key={equipo.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col group hover:border-black transition-colors duration-300">
                
                {/* ZONA DE IMAGEN CON CARRUSEL */}
                <div className="aspect-[4/3] sm:aspect-square bg-gray-50 relative overflow-hidden border-b border-gray-100">
                  
                  <CarruselImagenes equipo={equipo} />

                  {/* Badge Elegante */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-gray-200 text-black text-[10px] font-black px-3 py-1 uppercase tracking-widest shadow-sm pointer-events-none">
                    Stock: {equipo.cantidad}
                  </div>
                </div>

                {/* Info del Celular */}
                <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between bg-white">
                  <div className="mb-8">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ref: {equipo.sku}</p>
                    <h3 className="font-black text-2xl text-black leading-tight tracking-tight">{equipo.nombre}</h3>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Precio Especial</span>
                      <span className="text-3xl font-black text-black tracking-tighter">${parseFloat(equipo.precio_venta).toFixed(2)}</span>
                    </div>
                    
                    <button 
                      onClick={() => agregarAlCarrito(equipo)}
                      className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 text-sm uppercase tracking-wider active:scale-95 transition-all"
                    >
                      Lo Quiero
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* SIDEBAR DEL CARRITO PREMIUM */}
      {mostrarCarrito && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-slideInRight border-l border-gray-200">
            
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-black">Cesta de Equipos</h2>
              </div>
              <button onClick={() => setMostrarCarrito(false)} className="text-gray-400 hover:text-black text-2xl transition-colors">✖</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {carrito.length === 0 ? (
                <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
                  <span className="text-5xl mb-4 block opacity-50">🛒</span>
                  <p className="font-medium text-lg">Tu cesta está vacía.</p>
                </div>
              ) : (
                carrito.map((item) => {
                  // Extraer la primera foto de la galería para la miniatura
                  const portada = Array.isArray(item.galeria) && item.galeria.length > 0 ? item.galeria[0] : item.imagen_url;

                  return (
                    <div key={item.id} className="flex gap-4 bg-white border border-gray-200 p-4 items-center">
                      <div className="w-20 h-20 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center text-3xl border border-gray-100">
                        {portada ? <img src={portada} className="w-full h-full object-cover" /> : '📱'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">SKU: {item.sku}</p>
                        <h4 className="font-black text-base leading-tight text-black mb-2 truncate">{item.nombre}</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1">Cant: {item.cantidad_carrito}</span>
                          <span className="font-black text-lg text-black">${parseFloat(item.precio_venta).toFixed(2)}</span>
                        </div>
                      </div>
                      <button onClick={() => eliminarDelCarrito(item.id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors">
                        <span className="text-xl">🗑️</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* ZONA DE CHECKOUT */}
            {carrito.length > 0 && (
              <div className="p-8 border-t border-gray-200 bg-white">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Estimado</span>
                  <span className="text-4xl font-black text-black tracking-tighter">${totalCarrito.toFixed(2)}</span>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={procesarPedidoWhatsApp}
                    className="w-full bg-black hover:bg-gray-800 text-white font-black py-5 text-sm uppercase tracking-widest active:scale-95 transition-transform flex justify-center items-center gap-3"
                  >
                    💬 Contactar a Ventas
                  </button>
                  <p className="text-center text-xs font-medium text-gray-400 leading-relaxed">
                    Serás redirigido a WhatsApp para confirmar la disponibilidad exacta y los detalles de entrega.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}