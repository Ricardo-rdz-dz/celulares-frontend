//Punto de venta 
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PuntoDeVenta() {
  const router = useRouter();
  
  const [inventario, setInventario] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  
  const [clientesBd, setClientesBd] = useState<any[]>([]);
  
  // ✨ NUEVO ESTADO: Vendedor activo
  const [vendedorActivo, setVendedorActivo] = useState('Admin');

  const [formVenta, setFormVenta] = useState({
    metodo_pago: 'Efectivo',
    detalles_extras: 'Solo equipo (Sin accesorios)',
    cantidad: 1,
    comision_monto: '' // ✨ NUEVO: Campo para la comisión
  });

  const [formCliente, setFormCliente] = useState({
    telefono: '',
    nombre: '',
    id: null as string | null
  });

  useEffect(() => {
    // ✨ LEER SESIÓN ACTIVA PARA EL VENDEDOR
    const sesionGuardada = localStorage.getItem('movilplace_user');
    if (sesionGuardada) {
      try {
        const usuario = JSON.parse(sesionGuardada);
        setVendedorActivo(usuario.nombre || usuario.name || 'Admin');
      } catch (error) {
        setVendedorActivo(sesionGuardada);
      }
    }

    const cargarDatos = async () => {
      try {
        const [resInv, resCli] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventario`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/crm`)
        ]);

        if (resInv.ok) {
          const dataInv = await resInv.json();
          setInventario(dataInv.productos || (Array.isArray(dataInv) ? dataInv : []));
        }

        if (resCli.ok) {
          const dataCli = await resCli.json();
          setClientesBd(dataCli.clientes || []);
        }
      } catch (err) {
        console.error("Error al cargar datos", err);
      }
      setCargandoCatalogo(false);
    };
    cargarDatos();
  }, []);

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tel = e.target.value.replace(/\D/g, ''); 
    const clienteExistente = clientesBd.find(c => String(c.telefono).includes(tel) && tel.length >= 10);

    if (clienteExistente) {
      setFormCliente({ telefono: tel, nombre: clienteExistente.nombre, id: clienteExistente.id });
    } else {
      setFormCliente(prev => ({ ...prev, telefono: tel, id: null }));
    }
  };

  const procesarVenta = async () => {
    if (!producto) return;
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: producto.id,
          cantidad: formVenta.cantidad,
          precio_unitario: producto.precio_venta,
          metodo_pago: formVenta.metodo_pago,
          detalles_regalo_accesorios: formVenta.detalles_extras,
          cliente_id: formCliente.id,
          cliente_nombre: formCliente.nombre || 'Público en General',
          cliente_telefono: formCliente.telefono,
          vendedor: vendedorActivo, // ✨ ENVIAMOS EL VENDEDOR
          comision_monto: formVenta.comision_monto ? parseFloat(formVenta.comision_monto) : 0 // ✨ ENVIAMOS LA COMISIÓN
        })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        router.push(`/admin/pos/ticket/${data.venta_id}`);
      } else {
        alert(`Error al guardar: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al procesar la venta.');
    }
    setLoading(false);
  };

  const inventarioFiltrado = inventario.filter(item => 
    item.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
    item.sku?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const categoriasOrdenadas = ['Celulares', 'Tablets', 'Smartwatch', 'Audífonos', 'Laptops', 'DISPOSITIVO', 'REFACCION'];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-12 px-6">
      
      <div className="max-w-4xl w-full mb-6 flex justify-between items-center">
        <button onClick={() => router.push('/admin')} className="text-slate-400 hover:text-white font-bold transition">
          ⬅️ Volver al panel
        </button>
        <div className="flex gap-3 items-center">
          <span className="text-xs text-slate-400 font-bold bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            👤 Vendedor: {vendedorActivo}
          </span>
          <button 
            onClick={() => router.push('/admin/pos/historial')} 
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 transition"
          >
            📋 Historial Ventas
          </button>
        </div>
      </div>

      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
        
        {!producto && (
          <div className="mb-8 border-b-2 border-slate-100 pb-8">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Buscar artículo por Nombre o SKU
            </label>
            <input 
              type="text" autoFocus
              placeholder="Ej. iPhone 13 o SKU M-001"
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-xl p-4 font-bold text-xl outline-none"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        )}

        {!producto && (
          <div className="animate-fadeIn">
            {cargandoCatalogo ? (
              <div className="text-center text-slate-400 font-bold py-10">Cargando inventario para venta...</div>
            ) : inventarioFiltrado.length === 0 ? (
              <div className="text-center text-red-400 font-bold py-10">No se encontraron artículos con esa búsqueda.</div>
            ) : (
              categoriasOrdenadas.map(categoria => {
                const itemsEnCategoria = inventarioFiltrado.filter(item => item.tipo?.toLowerCase() === categoria.toLowerCase());
                if (itemsEnCategoria.length === 0) return null; 

                return (
                  <div key={categoria} className="mb-10">
                    <h3 className="font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-5">
                      {categoria}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {itemsEnCategoria.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => setProducto(item)}
                          className="relative bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group flex flex-col justify-between overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:via-blue-500 transition-all duration-500"></div>
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors">
                                SKU: {item.sku}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${item.cantidad > 0 ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>
                                {item.cantidad > 0 ? `${item.cantidad} Disp` : 'Agotado'}
                              </span>
                            </div>
                            <h4 className="font-black text-slate-800 text-base leading-tight mb-1 group-hover:text-blue-700 transition-colors">
                              {item.nombre}
                            </h4>
                          </div>
                          <div className="mt-5 flex justify-between items-end border-t border-slate-200/80 pt-3">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Precio</span>
                            <span className="font-black text-xl text-slate-800 group-hover:text-blue-600 transition-colors">
                              ${parseFloat(item.precio_venta).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
            
            {(() => {
              const otrosItems = inventarioFiltrado.filter(item => !categoriasOrdenadas.map(c => c.toLowerCase()).includes(item.tipo?.toLowerCase()));
              if (otrosItems.length === 0) return null;
              return (
                <div className="mb-8">
                  <h3 className="font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">Otros Artículos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {otrosItems.map(item => (
                      <div key={item.id} onClick={() => setProducto(item)} className="border-2 border-slate-100 hover:border-blue-500 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-1 rounded-md font-bold block w-fit mb-2">SKU: {item.sku}</span>
                          <h4 className="font-black text-slate-800 text-sm leading-tight">{item.nombre}</h4>
                        </div>
                        <div className="mt-4 flex justify-between items-end">
                          <span className={`text-xs font-bold ${item.cantidad > 0 ? 'text-emerald-500' : 'text-red-500'}`}>Stock: {item.cantidad}</span>
                          <span className="font-black text-lg text-slate-800">${item.precio_venta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ÁREA DE COBRO */}
        {producto && (
          <div className="space-y-6 animate-fadeIn">
            
            <button 
              onClick={() => { setProducto(null); setBusqueda(''); }}
              className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              ✖️ Cancelar y elegir otro artículo
            </button>

            {/* Ficha técnica del equipo seleccionado */}
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 flex justify-between items-center relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">{producto.tipo} • SKU: {producto.sku}</p>
                <h3 className="text-2xl font-black text-slate-800">{producto.nombre}</h3>
                <div className="flex gap-3 text-[10px] font-mono text-slate-500 mt-2">
                  {producto.color && <span className="bg-white px-2 py-1 rounded border">Color: {producto.color}</span>}
                  {producto.imei && <span className="bg-white px-2 py-1 rounded border">IMEI: {producto.imei}</span>}
                </div>
              </div>
              <div className="text-right relative z-10 flex flex-col items-end gap-2">
                {producto.imagen_url && (
                  <img src={producto.imagen_url} alt="Dispositivo" className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm" />
                )}
                <div>
                  <p className="text-3xl font-black text-emerald-500">${producto.precio_venta}</p>
                </div>
              </div>
            </div>

            {/* SECCIÓN DEL CLIENTE */}
            <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${formCliente.id ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">
                  Datos del Cliente (Para Nota y Garantía)
                </h3>
                {formCliente.id && (
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                    ✅ Cliente Frecuente Detectado
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Teléfono (10 dígitos)</label>
                  <input 
                    type="text" 
                    maxLength={10}
                    placeholder="Ej. 6861234567"
                    className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-xl p-3 font-mono font-bold text-slate-700 outline-none transition-all"
                    value={formCliente.telefono}
                    onChange={handleTelefonoChange}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    placeholder={formCliente.id ? "Autocompletado..." : "Nombre del cliente"}
                    className={`w-full bg-white border rounded-xl p-3 font-bold text-slate-700 outline-none transition-all ${formCliente.id ? 'border-emerald-300 text-emerald-800 bg-emerald-50/50' : 'border-slate-300 focus:border-blue-500'}`}
                    value={formCliente.nombre}
                    onChange={e => setFormCliente({...formCliente, nombre: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN DE CIERRE DE VENTA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-600 uppercase mb-2">¿Qué incluye el equipo? / Regalos</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-xl p-3 font-bold text-slate-700 outline-none cursor-pointer text-sm"
                  value={formVenta.detalles_extras}
                  onChange={e => setFormVenta({...formVenta, detalles_extras: e.target.value})}
                >
                  <option value="Solo equipo (Sin accesorios)">Solo equipo (Sin accesorios)</option>
                  <option value="Caja">Caja</option>
                  <option value="Cargador">Cargador</option>
                  <option value="Caja y Cargador">Caja y Cargador</option>
                  <option value="Vidrio templado">Vidrio templado</option>
                  <option value="Paquete Premium (Mica, Funda, Cargador)">Paquete Premium (Mica, Funda, Cargador)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-2">Método de Pago</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-xl p-3 font-bold outline-none cursor-pointer text-sm"
                  value={formVenta.metodo_pago}
                  onChange={e => setFormVenta({...formVenta, metodo_pago: e.target.value})}
                >
                  <option value="Efectivo">💵 Efectivo</option>
                  <option value="Transferencia">📱 Transferencia</option>
                  <option value="Tarjeta">💳 Tarjeta (Terminal)</option>
                </select>
              </div>
            </div>

            {/* ✨ NUEVO: SECCIÓN DE COMISIONES */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest">Asignar Comisión</h4>
                <p className="text-[10px] text-amber-600 font-medium mt-0.5">Vendedor actual: {vendedorActivo}</p>
              </div>
              <div className="relative w-32">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">$</span>
                <input 
                  type="number"
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-400"
                  value={formVenta.comision_monto}
                  onChange={e => setFormVenta({...formVenta, comision_monto: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4 mt-2 border-t-2 border-slate-100">
              <button 
                onClick={procesarVenta}
                disabled={loading || producto.cantidad < 1}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-black py-5 rounded-2xl text-xl uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-emerald-500/30 flex justify-between px-8"
              >
                <span>{loading ? 'Procesando...' : 'Cobrar Venta'}</span>
                <span>${(producto.precio_venta * formVenta.cantidad).toFixed(2)}</span>
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}