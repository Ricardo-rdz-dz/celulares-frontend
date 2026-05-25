'use client';
import { useEffect, useState } from 'react';

export default function TiendaEquipos() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [equiposFiltrados, setEquiposFiltrados] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // 1. Cargar el inventario
  useEffect(() => {
    const cargarInventario = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventario`);
        const data = await res.json();
        
        if (data.success && data.productos) {
          // Filtramos solo los que tienen stock
          const disponibles = data.productos.filter((item: any) => item.cantidad > 0);
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
          alert('No hay más stock de este equipo exacto.');
          return prev;
        }
        return prev.map(item => item.id === equipo.id ? { ...item, cantidad_carrito: item.cantidad_carrito + 1 } : item);
      } else {
        return [...prev, { ...equipo, cantidad_carrito: 1 }];
      }
    });
    setMostrarCarrito(true); // Abrir el carrito automáticamente al agregar un celular
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const totalCarrito = carrito.reduce((sum, item) => sum + (parseFloat(item.precio_venta) * item.cantidad_carrito), 0);

  // 4. Checkout por WhatsApp
  const procesarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;

    let mensaje = `👋 ¡Hola MovilPlace! Me interesa adquirir el siguiente equipo:\n\n`;
    
    carrito.forEach(item => {
      mensaje += `📱 ${item.cantidad_carrito}x ${item.nombre} \n   SKU: ${item.sku}\n   Precio: $${item.precio_venta}\n\n`;
    });

    mensaje += `*TOTAL APROXIMADO: $${totalCarrito.toFixed(2)}*\n\n¿Aún lo tienen disponible en tienda?`;

    const url = `https://wa.me/526861764066?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      
      {/* NAVBAR PÚBLICO */}
      <nav className="bg-slate-950 text-white p-4 sticky top-0 z-40 shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest">MOVILPLACE</h1>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Tienda de Equipos Oficial</p>
        </div>
        <button 
          onClick={() => setMostrarCarrito(true)}
          className="relative bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors active:scale-95"
        >
          🛒
          {carrito.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
              {carrito.length}
            </span>
          )}
        </button>
      </nav>

      {/* CABECERA Y BUSCADOR */}
      <div className="bg-slate-900 pb-10 pt-6 px-4 rounded-b-[2rem] shadow-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-white text-3xl font-black mb-4">¿Qué equipo buscas?</h2>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400 text-lg">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por marca, modelo o SKU (Ej. iPhone 13 Pro Max)..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-bold outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* GRID DE DISPOSITIVOS */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 mt-[-1rem]">
        {loading ? (
          <div className="text-center font-bold text-xl text-slate-400 mt-20 animate-pulse">Cargando catálogo de equipos...</div>
        ) : equiposFiltrados.length === 0 ? (
          <div className="text-center font-bold text-lg text-slate-500 mt-20 bg-white p-10 rounded-3xl shadow-sm">
            No se encontraron equipos con esa descripción.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equiposFiltrados.map((equipo) => (
              <div key={equipo.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col group">
                
                {/* Zona de Imagen o Placeholder (Espacio más grande para celulares) */}
                <div className="h-56 bg-slate-100 flex flex-col items-center justify-center relative overflow-hidden border-b border-slate-100">
                  {equipo.imagen_url ? (
                    <img src={equipo.imagen_url} alt={equipo.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="text-center">
                      <span className="text-6xl mb-2 block">📱</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Foto no disponible</span>
                    </div>
                  )}
                  {/* Badges Flotantes */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md uppercase">
                      {equipo.tipo || 'Equipo'}
                    </span>
                  </div>
                </div>

                {/* Info del Celular */}
                <div className="p-6 flex flex-col flex-grow justify-between bg-white">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-black text-lg text-slate-800 leading-tight">{equipo.nombre}</h3>
                    </div>
                    <p className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 inline-block px-2 py-1 rounded">SKU: {equipo.sku}</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Precio de Venta</span>
                      <span className="text-2xl font-black text-emerald-600">${parseFloat(equipo.precio_venta).toFixed(2)}</span>
                    </div>
                    
                    <button 
                      onClick={() => agregarAlCarrito(equipo)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-md hover:shadow-blue-500/25"
                    >
                      🛒 Me interesa
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL / SIDEBAR DEL CARRITO */}
      {mostrarCarrito && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slideInRight">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase text-slate-800">Equipos de Interés</h2>
                <p className="text-xs text-slate-500 font-bold">Reserva directa por WhatsApp</p>
              </div>
              <button onClick={() => setMostrarCarrito(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 w-10 h-10 rounded-full font-bold flex items-center justify-center transition-colors">✖</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
              {carrito.length === 0 ? (
                <div className="text-center text-slate-400 mt-10 font-bold flex flex-col items-center">
                  <span className="text-4xl mb-2 block">🛒</span>
                  Aún no has seleccionado ningún equipo.
                </div>
              ) : (
                carrito.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-white border border-slate-100 shadow-sm rounded-2xl p-3 items-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-2xl">
                      {item.imagen_url ? <img src={item.imagen_url} className="w-full h-full object-cover" /> : '📱'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm leading-tight text-slate-800 mb-1">{item.nombre}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mb-2">SKU: {item.sku}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-black text-emerald-600">${parseFloat(item.precio_venta).toFixed(2)}</span>
                      </div>
                    </div>
                    <button onClick={() => eliminarDelCarrito(item.id)} className="text-red-500 hover:bg-red-50 w-10 h-10 flex items-center justify-center rounded-xl transition-colors">🗑️</button>
                  </div>
                ))
              )}
            </div>

            {/* ZONA DE CHECKOUT */}
            {carrito.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total a Pagar:</span>
                  <span className="text-3xl font-black text-slate-800">${totalCarrito.toFixed(2)}</span>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={procesarPedidoWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-black py-4 rounded-2xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 text-base tracking-wide"
                  >
                    💬 Contactar Ventas 
                  </button>
                  <p className="text-center text-[10px] font-bold text-slate-400 mt-2">
                    Al presionar serás dirigido a nuestro WhatsApp para revisar disponibilidad y método de pago.
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