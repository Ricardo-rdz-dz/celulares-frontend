'use client';
import { useEffect, useState } from 'react';

export default function PuntoEquilibrioWidget() {
  const [datos, setDatos] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerMetricas = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/finanzas/punto-equilibrio`);
        if (res.ok) {
          const resData = await res.json();
          setDatos(resData);
        }
      } catch (error) {
        console.error("Error al conectar con el endpoint financiero:", error);
      }
      setLoading(false);
    };
    obtenerMetricas();
  }, []);

  if (loading) {
    return <div className="bg-slate-800 animate-pulse h-32 rounded-2xl w-full"></div>;
  }

  if (!datos) return null;

  const cubierto = datos.progreso_porcentaje >= 100;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
      
      {/* Encabezado del Widget */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Sostenibilidad Operativa
          </h3>
          <p className="text-lg font-bold text-slate-100">
            {cubierto ? '🎉 Gastos Fijos Cubiertos' : '📉 Punto de Equilibrio Mensual'}
          </p>
        </div>
        <div className="text-right sm:text-right">
          <span className="text-xs text-slate-400 block font-medium">Meta del mes</span>
          <span className="text-xl font-mono font-black text-slate-200">
            ${parseFloat(datos.meta_mensual).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Barra de Progreso Avanzada */}
      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-4 relative">
        <div 
          className={`h-full transition-all duration-1000 rounded-full ${cubierto ? 'bg-emerald-500' : 'bg-gradient-to-r from-red-500 to-amber-500'}`}
          style={{ width: `${datos.progreso_porcentaje}%` }}
        />
      </div>

      {/* Métricas de Proyección */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60">
        
        <div>
          <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">
            Acumulado Real
          </span>
          <span className="text-base font-mono font-bold text-emerald-400">
            ${parseFloat(datos.acumulado_mes).toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {datos.progreso_porcentaje.toFixed(1)}% de la meta
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">
            Faltante Restante
          </span>
          <span className={`text-base font-mono font-bold ${cubierto ? 'text-slate-400' : 'text-red-400'}`}>
            ${parseFloat(datos.faltante_total).toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {datos.dias_restantes} días disponibles
          </span>
        </div>

        <div className="sm:border-l sm:border-slate-800/80 sm:pl-4">
          <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">
            Cuota Diaria Requerida
          </span>
          <span className={`text-base font-mono font-black ${cubierto ? 'text-emerald-400' : 'text-amber-400'}`}>
            ${cubierto ? '0.00' : parseFloat(datos.meta_meta_diaria_ajustada || datos.meta_diaria_ajustada).toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Base inicial: ${parseFloat(datos.meta_diaria_base).toFixed(2)}/día
          </span>
        </div>

      </div>

    </div>
  );
}