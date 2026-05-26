'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PuntoEquilibrioWidget from '../../components/PuntoEquilibrioWidget';

export default function ModuloFinanzas() {
  const router = useRouter();
  
  // Estados principales
  const [balance, setBalance] = useState<any>({ ingresos: 0, egresos: 0, utilidad_neta: 0, lista_egresos: [] });
  const [gastosFijos, setGastosFijos] = useState<any[]>([]);
  
  // ✨ NUEVO ESTADO: Resumen del inventario
  const [inventarioMetricas, setInventarioMetricas] = useState({ costoTotal: 0, valorVentaTotal: 0, gananciaProyectada: 0, totalArticulos: 0 });
  
  const [loading, setLoading] = useState(true);
  const [pestaña, setPestaña] = useState<'operacion' | 'metas'>('operacion');

  // Formularios
  const [gastoForm, setGastoForm] = useState({ concepto: '', monto: '', categoria: 'Servicios' });
  const [metaForm, setMetaForm] = useState({ concepto: '', monto: '', dia_vencimiento: '1', categoria: 'Renta' });
  const [procesando, setProcesando] = useState(false);

  const categoriasGastos = ['Renta', 'Servicios', 'Proveedores', 'Nómina', 'Insumos', 'Otros'];

  const cargarDatos = async () => {
    try {
      // ✨ Se agregó la llamada al inventario en la misma carga
      const [resBalance, resFijos, resInventario] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/finanzas/balance-mensual`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/finanzas/gastos-fijos`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventario`)
      ]);
      
      if (resBalance.ok) setBalance(await resBalance.json());
      if (resFijos.ok) setGastosFijos(await resFijos.json());
      
      // Procesar el cálculo del inventario
      if (resInventario.ok) {
        const invData = await resInventario.json();
        const productos = invData.productos || invData || [];
        
        let costo = 0;
        let venta = 0;
        let articulos = 0;

        productos.forEach((p: any) => {
          if (p.cantidad > 0) {
            costo += (parseFloat(p.precio_compra) || 0) * p.cantidad;
            venta += (parseFloat(p.precio_venta) || 0) * p.cantidad;
            articulos += p.cantidad;
          }
        });

        setInventarioMetricas({
          costoTotal: costo,
          valorVentaTotal: venta,
          gananciaProyectada: venta - costo,
          totalArticulos: articulos
        });
      }
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
        window.location.reload(); 
      }
    } catch (error) {
      console.error(error);
    }
    setProcesando(false);
  };

  const eliminarGastoFijo = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este gasto fijo mensual?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/finanzas/gastos-fijos/${id}`, { method: 'DELETE' });
      if (res.ok) window.location.reload();
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
          <h2 className="text-3xl font-black uppercase tracking-wider">Módulo de Finanzas</h2>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto space-y-8">
        
        {/* ✨ NUEVA SECCIÓN: Valor de Inventario */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            📦 Patrimonio en Inventario <span className="text-[10px] font-normal normal-case bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">Total de artículos: {inventarioMetricas.totalArticulos}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Costo Total (Inversión)</span>
              <span className="text-2xl font-mono font-black text-slate-200">${inventarioMetricas.costoTotal.toFixed(2)}</span>
              <p className="text-xs text-slate-500 mt-1">El dinero que te costó comprar la mercancía actual.</p>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Valor Total de Venta</span>
              <span className="text-2xl font-mono font-black text-blue-400">${inventarioMetricas.valorVentaTotal.toFixed(2)}</span>
              <p className="text-xs text-slate-500 mt-1">Lo que ingresarás si vendes todo al precio público.</p>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl">
              <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Ganancia Neta Proyectada</span>
              <span className="text-2xl font-mono font-black text-emerald-400">${inventarioMetricas.gananciaProyectada.toFixed(2)}</span>
              <p className="text-xs text-emerald-600/70 mt-1 font-medium">Utilidad limpia al vaciar el inventario.</p>
            </div>
          </div>
        </div>

        <PuntoEquilibrioWidget />

        {/* Tarjetas de Balance Mensual */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Flujo de Efectivo Mensual</h3>
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
        </div>

        {/* NAVEGACIÓN DE PESTAÑAS (Con aclaraciones) */}
        <div className="flex border-b border-slate-800 gap-6 mt-12">
          <button 
            onClick={() => setPestaña('operacion')}
            className={`pb-3 font-bold text-sm tracking-wide transition-colors ${pestaña === 'operacion' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            📉 Egresos Diarios (Variables)
          </button>
          <button 
            onClick={() => setPestaña('metas')}
            className={`pb-3 font-bold text-sm tracking-wide transition-colors ${pestaña === 'metas' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            🎯 Gastos Fijos Mensuales (Obligaciones)
          </button>
        </div>

        {/* VISTA 1: OPERACIÓN DIARIA */}
        {pestaña === 'operacion' && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <p className="text-slate-400 text-sm">
                <strong className="text-white">Uso:</strong> Registra aquí gastos no planificados o variables del día a día (Ej: Compras rápidas de insumos, papelería, viáticos). Esto se restará directamente de tu utilidad del mes.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulario Egresos */}
              <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-3xl shadow-xl h-fit">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 mb-4">Registrar Egreso Espontáneo</h3>
                <form onSubmit={registrarEgreso} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Concepto del Gasto</label>
                    <input type="text" placeholder="Ej. Pago de envío, Insumos extra..." className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl font-semibold text-sm outline-none text-white placeholder-slate-600" value={gastoForm.concepto} onChange={e => setGastoForm({...gastoForm, concepto: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Monto</label>
                      <input type="number" step="0.01" placeholder="$" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl font-bold text-sm outline-none text-red-400 placeholder-slate-600" value={gastoForm.monto} onChange={e => setGastoForm({...gastoForm, monto: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Categoría</label>
                      <select className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl font-bold text-xs outline-none text-slate-300" value={gastoForm.categoria} onChange={e => setGastoForm({...gastoForm, categoria: e.target.value})}>
                        {categoriasGastos.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={procesando} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:bg-slate-900 text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors">
                    {procesando ? 'Guardando...' : 'Aplicar a Balance Mensual'}
                  </button>
                </form>
              </div>

              {/* Lista de Egresos */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl lg:col-span-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2 mb-4">Egresos Aplicados en el Periodo</h3>
                {balance.lista_egresos.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-10 font-medium">No hay egresos reportados en este mes.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {balance.lista_egresos.map((e: any) => (
                      <div key={e.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-sm">
                        <div>
                          <p className="font-bold text-slate-200">{e.concepto}</p>
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700 mt-1 inline-block font-medium">{e.categoria}</span>
                        </div>
                        <span className="font-mono font-black text-red-400">-${parseFloat(e.monto).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: CONFIGURACIÓN DE METAS (Gastos Fijos) */}
        {pestaña === 'metas' && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <p className="text-slate-400 text-sm">
                <strong className="text-white">Uso:</strong> Registra aquí tus obligaciones base (Ej: Renta, Sueldos, Suscripciones web). El sistema usa esto exclusivamente para calcular tu <span className="text-blue-400 font-bold">Punto de Equilibrio</span>. No se descuentan automáticamente del balance hasta que los registres como pagados.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulario Gastos Fijos */}
              <div className="bg-slate-800 border border-slate-700 text-white p-6 rounded-3xl shadow-xl h-fit">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 border-b border-slate-700 pb-2 mb-4">Añadir Obligación Mensual</h3>
                <form onSubmit={registrarGastoFijo} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Concepto Fijo</label>
                    <input type="text" placeholder="Ej. Local, Internet, Luz" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl font-semibold text-sm outline-none text-white placeholder-slate-500" value={metaForm.concepto} onChange={e => setMetaForm({...metaForm, concepto: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Monto Mensual</label>
                      <input type="number" step="0.01" placeholder="$" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl font-bold text-sm outline-none text-emerald-400 placeholder-slate-500" value={metaForm.monto} onChange={e => setMetaForm({...metaForm, monto: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Día de Pago</label>
                      <input type="number" min="1" max="31" placeholder="Día" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl font-bold text-sm outline-none text-white placeholder-slate-500" value={metaForm.dia_vencimiento} onChange={e => setMetaForm({...metaForm, dia_vencimiento: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" disabled={procesando} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors shadow-lg shadow-blue-900/50">
                    {procesando ? 'Guardando...' : 'Guardar Gasto Fijo'}
                  </button>
                </form>
              </div>

              {/* Lista de Gastos Fijos */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl lg:col-span-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2 mb-4">Gastos Base Configurados</h3>
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
                      <span className="text-xs font-black uppercase text-slate-500">Costo Operativo Base:</span>
                      <span className="text-2xl font-mono font-black text-white">
                        ${gastosFijos.reduce((sum, g) => sum + parseFloat(g.monto), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}