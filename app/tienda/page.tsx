'use client';
import { useEffect, useState } from 'react';

export default function TiendaRefacciones() {
  const [refacciones, setRefacciones] = useState<any[]>([]);
  const [filtradas, setFiltradas] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarCatalogo = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refacciones`);
        const data = await res.json();
        
        // Filtramos para asegurar que es un arreglo válido
        const lista = Array.isArray(data) ? data : [];
        setRefacciones(lista);
        setFiltradas(lista);
      } catch (error) {
        console.error("Error al cargar la tienda pública:", error);
      }
      setLoading(false);
    };

    cargarCatalogo();
  }, []);

  // Buscador en tiempo real
  useEffect(() => {
    const resultado = refacciones.filter(pieza => 
      pieza.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (pieza.descripcion && pieza.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );
    setFiltradas(resultado);
  }, [busqueda, refacciones]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* ENCABEZADO PÚBLICO (Sin botones de administración) */}
      <header className="bg-slate-900 text-white border-b-4 border-red-600 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-black tracking-widest uppercase">
              Movil<span className="text-red-500">Place</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1 tracking-wide">
              Tienda Oficial de Refacciones y Accesorios
            </p>
          </div>
          
          <div className="flex gap-4 text-sm font-bold text-slate-300">
            <span className="flex items-center gap-2">📍 Soriana Hiper Calafia</span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-2">📱 686 168 77 29 Solo WhatsApp</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* BARRA DE BÚSQUEDA */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative shadow-lg rounded-2xl overflow-hidden">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-2xl">🔍</span>
            </div>
            <input 
              type="text"
              placeholder="¿Qué refacción estás buscando? Ej. Pantalla iPhone 13..."
              className="w-full bg-white border-2 border-slate-200 focus:border-red-500 rounded-2xl py-4 pl-14 pr-4 font-bold text-lg text-slate-700 outline-none transition-all"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* GRID DE LA TIENDA */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
            <span className="text-6xl block mb-4">🤷‍♂️</span>
            <h3 className="text-xl font-black text-slate-800 mb-2">No encontramos esa pieza</h3>
            <p className="text-slate-500 font-medium">Intenta buscar con otras palabras o contáctanos para hacer un pedido especial.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filtradas.map((pieza) => {
              const hayStock = pieza.cantidad > 0;

              return (
                <div 
                  key={pieza.id}
                  className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Imagen de la pieza */}
                  <div className="w-full h-56 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                    {pieza.imagen_url ? (
                      <img 
                        src={pieza.imagen_url} 
                        alt={pieza.nombre} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <span className="text-5xl opacity-20">⚙️</span>
                    )}
                    
                    {/* Etiqueta de Stock */}
                    <div className="absolute top-4 right-4">
                      {hayStock ? (
                        <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                          Disponible
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                          Agotado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detalles de la pieza */}
                  <div className="p-6 flex-1 flex flex-col justify-between bg-white z-10 relative">
                    <div>
                      <h3 className="font-black text-lg text-slate-800 leading-tight mb-2 line-clamp-2" title={pieza.nombre}>
                        {pieza.nombre}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium line-clamp-2 h-10">
                        {pieza.descripcion || 'Refacción de alta calidad garantizada.'}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-end">
                      <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precio</span>
                        <span className={`text-2xl font-black font-mono ${hayStock ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                          ${parseFloat(pieza.precio_venta).toFixed(2)}
                        </span>
                      </div>
                      
                      {hayStock && (
                        <a 
                          href={`https://wa.me/526861764066?text=Hola,%20me%20interesa%20la%20refacción:%20${encodeURIComponent(pieza.nombre)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl transition-colors shadow-sm shadow-green-500/30"
                          title="Preguntar por WhatsApp"
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER SENCILLO */}
      <footer className="bg-slate-900 py-8 text-center border-t-4 border-red-600">
        <p className="text-slate-400 font-medium text-sm">© {new Date().getFullYear()} MovilPlace. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}