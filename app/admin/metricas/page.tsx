'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MetricasDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setTickets(data.tickets || []);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  // --- LÓGICA DE CÁLCULO DE MÉTRICAS ---
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const anioActual = fechaActual.getFullYear();

  // Función auxiliar para saber si una fecha es del mes actual
  const esDelMesActual = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
  };

  // 1. Equipos en Taller (Ni entregados ni cancelados)
  const equiposEnTaller = tickets.filter(t => !['ENTREGADO', 'CANCELADO'].includes(t.estado));
  
  // 2. Listos para Entregar
  const listosParaEntregar = tickets.filter(t => t.estado === 'LISTO_PARA_ENTREGA');

  // 3. Ingresos (Anticipos del mes actual)
  const ingresosAnticiposMes = tickets
    .filter(t => esDelMesActual(t.created_at))
    .reduce((suma, t) => suma + (Number(t.anticipo) || 0), 0);

  // 4. KPI EXTRA: Volumen de tickets de este mes
  const ticketsEsteMes = tickets.filter(t => esDelMesActual(t.created_at)).length;

  // 5. KPI EXTRA: Dinero por cobrar (Costo Total - Anticipo de los equipos que siguen en taller)
  const cuentasPorCobrar = equiposEnTaller.reduce((suma, t) => {
    const costo = Number(t.costo_total) || 0;
    const anticipo = Number(t.anticipo) || 0;
    return suma + (costo - anticipo);
  }, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      
      {/* CABECERA */}
      <header className="bg-white px-8 py-6 border-b border-slate-200 sticky top-0 flex justify-between items-center z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            📊 Panel de Métricas
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">
            {fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={() => router.push('/admin')} 
          className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-all shadow-sm"
        >
          Volver al Panel
        </button>
      </header>

      {/* CONTENIDO DE MÉTRICAS */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {loading ? (
          <div className="text-center p-20 text-sm font-medium text-slate-400 animate-pulse">
            Calculando indicadores de negocio...
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            
            {/* SECCIÓN 1: MÉTRICAS OPERATIVAS (Las que pidió el DoD) */}
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Métricas Operativas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Tarjeta 1: Equipos en Taller */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl">📱</span>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">Inventario Físico</span>
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Equipos en Taller</h3>
                    <p className="text-4xl font-black text-slate-900">{equiposEnTaller.length}</p>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Equipos activos bajo resguardo.</p>
                  </div>
                </div>

                {/* Tarjeta 2: Listos para Entregar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-green-400 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl">✅</span>
                    <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2.5 py-1 rounded-full uppercase tracking-wider">Prioridad</span>
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Listos para Entregar</h3>
                    <p className="text-4xl font-black text-slate-900">{listosParaEntregar.length}</p>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Notifica al cliente para cobrar el saldo.</p>
                  </div>
                </div>

                {/* Tarjeta 3: Volumen del Mes */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-purple-400 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl">📈</span>
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full uppercase tracking-wider">Rendimiento</span>
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Equipos Recibidos</h3>
                    <p className="text-4xl font-black text-slate-900">{ticketsEsteMes}</p>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Total de servicios en el mes actual.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* SECCIÓN 2: MÉTRICAS FINANCIERAS */}
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Control Financiero (Mes Actual)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Finanzas 1: Ingresos por Anticipos */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-2xl border border-emerald-100">
                    💵
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Ingresos (Anticipos)</h3>
                    <p className="text-3xl font-black text-slate-900">${ingresosAnticiposMes.toLocaleString('es-MX')}</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">Dinero asegurado en caja este mes.</p>
                  </div>
                </div>

                {/* Finanzas 2: Cuentas por Cobrar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 text-2xl border border-amber-100">
                    ⏳
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Cuentas por Cobrar</h3>
                    <p className="text-3xl font-black text-slate-900">${cuentasPorCobrar.toLocaleString('es-MX')}</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">Dinero pendiente al entregar los {equiposEnTaller.length} equipos.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}