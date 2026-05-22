'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PuntoEquilibrioWidget from '../../components/PuntoEquilibrioWidget';

export default function ModuloFinanzas() {
  const router = useRouter();
  
  // Estados principales
  const [balance, setBalance] = useState<any>({ ingresos: 0, egresos: 0, utilidad_neta: 0, lista_egresos: [] });
  const [gastosFijos, setGastosFijos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pestaña, setPestaña] = useState<'operacion' | 'metas'>('operacion'); // Controla la vista inferior

  // Formularios
  const [gastoForm, setGastoForm] = useState({ concepto: '', monto: '', categoria: 'Servicios' });
  const [metaForm, setMetaForm] = useState({ concepto: '', monto: '', dia_vencimiento: '1', categoria: 'Renta' });
  const [procesando, setProcesando] = useState(false);

  const categoriasGastos = ['Renta', 'Servicios', 'Proveedores', 'Nómina', 'Otros'];

  const cargarDatos = async () => {
    try {
      const [resBalance, resFijos] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/finanzas/balance-mensual`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/finanzas/gastos-fijos`)
      ]);
      
      if (resBalance.ok) setBalance(await resBalance.json());
      if (resFijos.ok) setGastosFijos(await resFijos.json());
    } catch (error) {
      console.error("Error al cargar datos financieros:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Guardar Egreso Diario (Operativo)
  const registrarEgreso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gastoForm.concepto || !gastoForm.monto) return alert('Llene todos los campos.');
    setProcesando(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/finanzas/egresos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gastoForm)
      });
      if (res.ok) {
        setGastoForm({ concepto: '', monto: '', categoria: 'Servicios' });
        cargarDatos();
      }
    } catch (error) {
      console.error(error);
    }
    setProcesando(false);
  };

  // Guardar Gasto Fijo (Meta Mensual)
  const registrarGastoFijo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaForm.concepto || !metaForm.monto) return alert('Llene todos los campos.');
    setProcesando(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/finanzas/gastos-fijos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaForm)
      });
      if (res.ok) {
        setMetaForm({ concepto: '', monto: '', dia_vencimiento: '1', categoria: 'Renta' });
        cargarDatos();
        // Recargar la página para que el Widget de Punto de Equilibrio se actualice inmediatamente
        window.location.reload(); 
      }
    } catch (error) {
      console.error(error);
    }
    setProcesando(false);
  };

  // Eliminar Gasto Fijo
  const eliminarGastoFijo = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este gasto fijo mensual?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/finanzas/gastos-fijos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
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
        
        <PuntoEquilibrioWidget />

        {/* Tarjetas de Balance */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
            <div className="bg-slate-900 h-24 rounded-2xl"></div>
            <div className="bg-slate-900 h-24 rounded-2xl"></div>
            <div className="bg-slate-900 h-24 rounded-2xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ingresos Brutos (Mes)</span>
              <span className="text-2xl font-mono font-black text-emerald-400">${parseFloat(balance.ingresos).toFixed(2)}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Egresos Operativos (Mes)</span>
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

        {/* NAVEGACIÓN DE PESTAÑAS */}
        <div className="flex border-b border-slate-800 gap-6">
          <button 
            onClick={() => setPestaña('operacion')}
            className={`pb-3 font-bold text-sm tracking-wide transition-colors ${pestaña === 'operacion' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            📉 Operación Diaria (Egresos)
          </button>
          <button 
            onClick={() => setPestaña('metas')}
            className={`pb-3 font-bold text-sm tracking-wide transition-colors ${pestaña === 'metas' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            🎯 Configurar Metas (Gastos Fijos)
          </button>
        </div>

        {/* VISTA 1: OPERACIÓN DIARIA */}
        {pestaña === 'operacion' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Formulario Egresos */}
            <div className="bg-white text-slate-800 p-6 rounded-3xl shadow-xl h-fit">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 border-b pb-2 mb-4">Registrar Egreso Diario</h3>
              <form onSubmit={registrarEgreso} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Concepto del Gasto</label>
                  <input type="text" placeholder="Ej. Pago de envío, Insumos..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-semibold text-sm outline-none" value={gastoForm.concepto} onChange={e => setGastoForm({...gastoForm, concepto: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Monto</label>
                    <input type="number" step="0.01" placeholder="$" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm outline-none text-red-600" value={gastoForm.monto} onChange={e => setGastoForm({...gastoForm, monto: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Categoría</label>
                    <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-xs outline-none" value={gastoForm.categoria} onChange={e => setGastoForm({...gastoForm, categoria: e.target.value})}>
                      {categoriasGastos.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={procesando} className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors">
                  {procesando ? 'Guardando...' : 'Aplicar a Balance'}
                </button>
              </form>
            </div>

            {/* Lista de Egresos */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl lg:col-span-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2 mb-4">Egresos Aplicados en el Periodo</h3>
              {balance.lista_egresos.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-10 font-medium">No hay egresos reportados en este mes.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {balance.lista_egresos.map((e: any) => (
                    <div key={e.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-slate-200">{e.concepto}</p>
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800 mt-1 inline-block font-medium">{e.categoria}</span>
                      </div>
                      <span className="font-mono font-black text-red-400">-${parseFloat(e.monto).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA 2: CONFIGURACIÓN DE METAS (Gastos Fijos) */}
        {pestaña === 'metas' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Formulario Gastos Fijos */}
            <div className="bg-slate-800 border border-slate-700 text-white p-6 rounded-3xl shadow-xl h-fit">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-700 pb-2 mb-4">Añadir Gasto Mensual Base</h3>
              <form onSubmit={registrarGastoFijo} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Concepto Fijo</label>
                  <input type="text" placeholder="Ej. Renta, Internet, Luz" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl font-semibold text-sm outline-none" value={metaForm.concepto} onChange={e => setMetaForm({...metaForm, concepto: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Monto Mensual</label>
                    <input type="number" step="0.01" placeholder="$" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl font-bold text-sm outline-none text-emerald-400" value={metaForm.monto} onChange={e => setMetaForm({...metaForm, monto: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Día de Pago</label>
                    <input type="number" min="1" max="31" placeholder="Día" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl font-bold text-sm outline-none" value={metaForm.dia_vencimiento} onChange={e => setMetaForm({...metaForm, dia_vencimiento: e.target.value})} />
                  </div>
                </div>
                <button type="submit" disabled={procesando} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors">
                  {procesando ? 'Guardando...' : 'Guardar Meta Fija'}
                </button>
              </form>
            </div>

            {/* Lista de Gastos Fijos */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl lg:col-span-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2 mb-4">Gastos Fijos Programados (Punto de Equilibrio)</h3>
              {gastosFijos.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-10 font-medium">Aún no configuras ningún gasto fijo mensual.</p>
              ) : (
                <div className="space-y-3">
                  {gastosFijos.map((gasto) => (
                    <div key={gasto.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center transition-all hover:border-slate-600">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-900 w-12 h-12 rounded-lg flex flex-col justify-center items-center border border-slate-700">
                          <span className="text-[9px] text-slate-500 uppercase font-black">Día</span>
                          <span className="text-lg font-black text-slate-200 leading-none">{gasto.dia_vencimiento}</span>
                        </div>
                        <div>
                          <p className="font-black text-slate-100 text-lg">{gasto.concepto}</p>
                          <span className="text-xs text-slate-400 block font-medium">Pago mensual recurrente</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-mono font-black text-emerald-400 text-xl">${parseFloat(gasto.monto).toFixed(2)}</span>
                        <button 
                          onClick={() => eliminarGastoFijo(gasto.id)}
                          className="text-slate-500 hover:text-red-500 bg-slate-900 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                          title="Eliminar meta"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Resumen Total */}
                  <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end items-center gap-4">
                    <span className="text-xs font-black uppercase text-slate-500">Meta Mensual Base:</span>
                    <span className="text-2xl font-mono font-black text-white">
                      ${gastosFijos.reduce((sum, g) => sum + parseFloat(g.monto), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}