'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PuntoEquilibrioWidget from '../../components/PuntoEquilibrioWidget';

export default function ModuloFinanzas() {
  const router = useRouter();
  const [balance, setBalance] = useState<any>({ ingresos: 0, egresos: 0, utilidad_neta: 0, lista_egresos: [] });
  const [loading, setLoading] = useState(true);
  const [procesandoGasto, setProcesandoGasto] = useState(false);

  // Formulario de gastos
  const [gastoForm, setGastoForm] = useState({
    concepto: '',
    monto: '',
    categoria: 'Servicios'
  });

  const categoriasGastos = ['Renta', 'Servicios', 'Proveedores', 'Nómina', 'Otros'];

  const cargarDatosFinancieros = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/finanzas/balance-mensual`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data);
      }
    } catch (error) {
      console.error("Error al cargar balance:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarDatosFinancieros();
  }, []);

  const registrarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gastoForm.concepto || !gastoForm.monto) return alert('Por favor llene todos los campos del gasto.');
    setProcesandoGasto(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/finanzas/egresos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gastoForm)
      });

      if (res.ok) {
        setGastoForm({ concepto: '', monto: '', categoria: 'Servicios' });
        cargarDatosFinancieros();
      } else {
        alert('Error al registrar el egreso.');
      }
    } catch (error) {
      console.error(error);
    }
    setProcesandoGasto(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-6 text-white font-sans">
      
      {/* Encabezado */}
      <div className="max-w-6xl w-full mx-auto mb-8 flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <button onClick={() => router.push('/admin')} className="text-slate-400 hover:text-white font-semibold text-sm transition mb-2 block">
            Volver al Panel de Administración
          </button>
          <h2 className="text-3xl font-black uppercase tracking-wider">Módulo de Finanzas Estratégicas</h2>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto space-y-8">
        
        {/* Widget de Supervivencia y Punto de Equilibrio */}
        <PuntoEquilibrioWidget />

        {/* Tarjetas de Balance General */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            <div className="bg-slate-900 h-24 rounded-2xl border border-slate-800"></div>
            <div className="bg-slate-900 h-24 rounded-2xl border border-slate-800"></div>
            <div className="bg-slate-900 h-24 rounded-2xl border border-slate-800"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ingresos Brutos (Mes)</span>
              <span className="text-2xl font-mono font-black text-emerald-400">${parseFloat(balance.ingresos).toFixed(2)}</span>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Egresos Totales (Mes)</span>
              <span className="text-2xl font-mono font-black text-red-400">${parseFloat(balance.egresos).toFixed(2)}</span>
            </div>

            <div className={`border p-6 rounded-2xl ${balance.utilidad_neta >= 0 ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-red-950/20 border-red-800/50'}`}>
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Utilidad Neta Real</span>
              <span className={`text-2xl font-mono font-black ${balance.utilidad_neta >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                ${parseFloat(balance.utilidad_neta).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Sección Central: Formulario y Registro de Gastos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulario de Registro */}
          <div className="bg-white text-slate-800 p-6 rounded-3xl shadow-xl h-fit">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 border-b pb-2 mb-4">Registrar Egreso / Servicio</h3>
            <form onSubmit={registrarGasto} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Concepto del Gasto</label>
                <input 
                  type="text" 
                  placeholder="Ej. Recibo de CFE Soriana o Renta" 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-semibold text-sm outline-none"
                  value={gastoForm.concepto}
                  onChange={e => setGastoForm({...gastoForm, concepto: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Monto Total</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="$ 0.00" 
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm outline-none text-red-600"
                    value={gastoForm.monto}
                    onChange={e => setGastoForm({...gastoForm, monto: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Categoría</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-xs text-slate-700 outline-none cursor-pointer"
                    value={gastoForm.categoria}
                    onChange={e => setGastoForm({...gastoForm, categoria: e.target.value})}
                  >
                    {categoriasGastos.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={procesandoGasto}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors"
              >
                {procesandoGasto ? 'Guardando...' : 'Aplicar a Balance'}
              </button>
            </form>
          </div>

          {/* Historial de Egresos del Mes */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl lg:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2 mb-4">Egresos Aplicados en el Periodo</h3>
              {balance.lista_egresos.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-10 font-medium">No hay egresos reportados en este mes.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {balance.lista_egresos.map((e: any) => (
                    <div key={e.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-slate-200">{e.concepto}</p>
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800 mt-1 inline-block font-medium">
                          {e.categoria}
                        </span>
                      </div>
                      <span className="font-mono font-black text-red-400">-${parseFloat(e.monto).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Capa de Inteligencia Artificial Avanzada */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6">
          <div className="border-b border-slate-800 pb-3 mb-4">
            <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md uppercase tracking-widest">
              Capacidad AI Model Desactivada
            </span>
            <h3 className="text-lg font-bold text-slate-200 mt-2">Módulo Predictivo de Flujo de Efectivo</h3>
            <p className="text-slate-400 text-xs mt-1 font-medium">
              El agente de analítica financiera simulará escenarios económicos e identificará estacionalidades críticas (como variaciones de servicios fijos o costos de insumos) una vez acumulado el historial mínimo de transacciones.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-850/50 p-4 rounded-xl text-center text-sm font-medium text-slate-600">
            Los algoritmos predictivos se activarán automáticamente al registrar movimientos consistentes en las tablas de inventario, ventas y egresos.
          </div>
        </div>

      </div>
    </div>
  );
}