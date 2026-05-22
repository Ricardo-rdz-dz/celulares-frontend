'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function AppCapturaRefacciones() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [refacciones, setRefacciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [piezaSeleccionada, setPiezaSeleccionada] = useState<any>(null);
  const [subiendoId, setSubiendoId] = useState<string | null>(null); // Para mostrar carga en la tarjeta

  // Cargar el catálogo
  const cargarCatalogo = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refacciones`);
      const data = await res.json();
      setRefacciones(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarCatalogo();
  }, []);

  // Al presionar el botón de cámara en una tarjeta
  const iniciarCaptura = (pieza: any) => {
    setPiezaSeleccionada(pieza);
    // Disparamos el clic en el input file oculto
    fileInputRef.current?.click();
  };

  // Al capturar la foto con la cámara del celular
  const procesarYSubirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !piezaSeleccionada) return;

    // Mostramos estado de carga en la tarjeta específica
    setSubiendoId(piezaSeleccionada.id);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;

      try {
        // Llamamos a la nueva ruta PUT del backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refacciones/${piezaSeleccionada.id}/imagen`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagenBase64: base64 })
        });

        if (res.ok) {
          // Actualizamos la lista localmente para no recargar todo
          const data = await res.json();
          setRefacciones(prev => prev.map(p => 
            p.id === piezaSeleccionada.id ? { ...p, imagen_url: data.imagen_url } : p
          ));
        } else {
          alert('Error al subir la foto al servidor.');
        }
      } catch (error) {
        console.error(error);
        alert('Error de conexión.');
      }
      
      // Limpiamos estados
      setSubiendoId(null);
      setPiezaSeleccionada(null);
      // Limpiamos el input para poder tomar otra foto de la misma pieza si falla
      e.target.value = ''; 
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-10 text-white">
      
      {/* Input File OCULTO - Configurado para Cámara Trasera */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" // 📸 Directo a cámara trasera en celular
        ref={fileInputRef} 
        className="hidden" 
        onChange={procesarYSubirFoto} 
      />

      {/* Cabecera Tipo App */}
      <div className="flex items-center gap-3 mb-6 sticky top-0 bg-slate-950 py-2 z-10 border-b border-slate-800">
        <button onClick={() => router.push('/admin')} className="text-2xl">
          🔙
        </button>
        <h1 className="text-xl font-black uppercase tracking-tight flex-1">📸 Captura Refacciones</h1>
        <div className="text-xs bg-slate-800 px-3 py-1 rounded-full font-bold">
          {refacciones.length} items
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 pt-10 font-bold">Cargando catálogo técnico...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {refacciones.map((pieza) => {
            const tieneFoto = !!pieza.imagen_url;
            const estaSubiendo = subiendoId === pieza.id;

            return (
              <div 
                key={pieza.id} 
                className={`bg-slate-900 border rounded-2xl p-4 flex gap-4 items-center transition-colors ${estaSubiendo ? 'animate-pulse border-blue-500' : tieneFoto ? 'border-slate-800 hover:border-slate-700' : 'border-yellow-600 bg-yellow-950/20'}`}
              >
                
                {/* Previsualización de Imagen o Placeholder */}
                <div className="w-20 h-20 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700 shrink-0 relative">
                  {estaSubiendo ? (
                    <span className="text-xs text-blue-400 font-bold">Subiendo...</span>
                  ) : tieneFoto ? (
                    <img src={pieza.imagen_url} alt={pieza.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🖼️</span>
                  )}
                </div>

                {/* Info de la pieza */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-0.5">Refacción</p>
                  <h3 className="font-bold text-white text-base leading-tight truncate" title={pieza.nombre}>
                    {pieza.nombre}
                  </h3>
                  {!tieneFoto && (
                    <span className="inline-block mt-1 text-[10px] font-black bg-yellow-500 text-yellow-950 px-2 py-0.5 rounded-full uppercase">
                      Falta Foto Real
                    </span>
                  )}
                </div>

                {/* BOTÓN DE CÁMARA (Acción Principal) */}
                <button 
                  onClick={() => iniciarCaptura(pieza)}
                  disabled={estaSubiendo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all active:scale-90 ${estaSubiendo ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-500'}`}
                >
                  {estaSubiendo ? '⏳' : '📸'}
                </button>

              </div>
            );
          })}
        </div>
      )}

      {/* Espaciador final para scroll cómodo en móvil */}
      <div className="h-10"></div>
    </div>
  );
}