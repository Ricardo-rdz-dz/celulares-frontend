'use client';
import { useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';



export default function NuevoRegistro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [visitasCliente, setVisitasCliente] = useState(0);
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [referidoValido, setReferidoValido] = useState<{valido: boolean, nombre?: string} | null>(null);
  
  // Agregamos pin y detalles al estado
  const [form, setForm] = useState({
    nombre: '', telefono: '', 
    tipo_equipo: 'Celular', // ✨ NUEVO
    marca: '', modelo: '', color: 'Negro', imei: '', pin: '', 
    falla_tipo: 'Pantalla', falla_detalle: '', // ✨ DESGLOSAMOS LA FALLA
    detalles: '', costo_total: '0', anticipo: '0'
  });
  // ✨ ESTADO PARA LOS CHECKBOXES DE LA NOTA FÍSICA
  const [checks, setChecks] = useState({
    protector: false, cargador: false, sd: false, sim: false,
    reparado: false, mojado: false, apagado: false
  });
  // ✨ EL BUSCADOR AUTOMÁTICO
  // Este código vigila el campo de teléfono. Si escribes 10 números, busca al cliente.
  useEffect(() => {
    const tel = form.telefono.replace(/\D/g, '');
    if (tel.length >= 10) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/telefono/${tel}`)
        .then(res => res.json())
        .then(data => {
          if (data.encontrado) {
            // Autocompleta el nombre y guarda las visitas
            setForm(prev => ({ ...prev, nombre: data.cliente.nombre }));
            setVisitasCliente(data.cliente.visitas || 0);
          } else {
            // Es cliente nuevo
            setVisitasCliente(0);
          }
        })
        .catch(err => console.error(err));
    } else {
      setVisitasCliente(0);
    }
  }, [form.telefono]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✨ 1. EXTRAER EL USUARIO ACTIVO DEL NAVEGADOR
      let creadoPorId = null;
      const usuarioActivoRaw = localStorage.getItem('movilplace_user');
      if (usuarioActivoRaw) {
        const usuario = JSON.parse(usuarioActivoRaw);
        creadoPorId = usuario.id;
      }

      // 2. CREAR O RECUPERAR CLIENTE
      const resCliente = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre, telefono: form.telefono })
      });
      const dataCliente = await resCliente.json();

      if (!resCliente.ok) {
        alert(`Error al registrar cliente: ${dataCliente.error}`);
        setLoading(false);
        return;
      }
// ✨ COMPILAMOS LOS DATOS FÍSICOS EN UN SOLO TEXTO LIMPIO
     // ✨ COMPILAMOS LA FALLA SEGÚN LO QUE ELIGIERON EN EL MENÚ
      // ✨ 1. COMPILAMOS LOS BOTONES FÍSICOS Y EL COLOR EN UN SOLO TEXTO
      const detallesCompilados = `COLOR: ${form.color || 'N/A'} | ACCESORIOS: Protector [${checks.protector ? 'SI' : 'NO'}], Cargador [${checks.cargador ? 'SI' : 'NO'}], SD [${checks.sd ? 'SI' : 'NO'}], SIM [${checks.sim ? 'SI' : 'NO'}] | ESTADO PREVIO: Reparado [${checks.reparado ? 'SI' : 'NO'}], Mojado [${checks.mojado ? 'SI' : 'NO'}], Apagado [${checks.apagado ? 'SI' : 'NO'}] | OBS: ${form.detalles}`;

      // ✨ 2. COMPILAMOS LA FALLA SEGÚN LO QUE ELIGIERON EN EL MENÚ
      const fallaCompilada = form.falla_tipo === 'Otro' ? form.falla_detalle : form.falla_tipo;

      // ✨ 3. CREAR EL TICKET MANDANDO TODO LIMPIO
      const resTicket = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: dataCliente.cliente.id,
          marca: form.marca,
          modelo: form.modelo,
          imei_o_serie: form.imei,
          pin_desbloqueo: form.pin,
          detalles_esteticos: detallesCompilados, // 👈 Se envía el texto de los botones
          falla_reportada: fallaCompilada,        // 👈 Se envía la falla del menú
          costo_total: parseFloat(form.costo_total),
          anticipo: parseFloat(form.anticipo),
          creado_por: creadoPorId
        })
      });
      const dataTicket = await resTicket.json();

      if (!resTicket.ok) {
        alert(`Error al crear el ticket: ${dataTicket.error}`);
        setLoading(false);
        return;
      }

      // ✨ 4. FLUJO AUTOMATIZADO: Redirigir directo a imprimir la nota de recepción
      router.push(`/admin/ticket/${dataTicket.ticket.id}/nota`);

    } catch (error) {
      console.error("Error:", error);
      alert('Error de red al intentar registrar.');
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-6">
      <div className="max-w-4xl mx-auto w-full mb-6">
        <button onClick={() => router.push('/admin')} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold transition">
           Volver al panel
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white w-full rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-slate-50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Recibir Dispositivo</h2>
            <p className="text-slate-500 font-medium mt-1">Ingresa los datos completos para la orden de servicio</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
            📱
          </div>
        </div>

       <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* 1. CLIENTE (Flujo Tab: Nombre -> Teléfono) */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-black uppercase text-red-600 mb-4 tracking-wider">1. Datos del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono (Búsqueda Automática)</label>
                <input type="tel" required autoFocus tabIndex={1}
                  value={form.telefono} 
                  placeholder="10 dígitos"
                  className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl p-3 font-black text-slate-900 outline-none transition-colors" 
                  onChange={e => setForm({...form, telefono: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo</label>
                <input type="text" required tabIndex={2}
                  value={form.nombre} 
                  className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl p-3 font-medium text-slate-900 outline-none transition-colors" 
                  onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>
            </div>
          </div>

          {/* ... [AQUÍ VAN TUS ALERTAS VIP Y REFERIDOS QUE YA TIENES] ... */}

          {/* 2. EQUIPO (Uso intensivo de Selects) */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-black uppercase text-blue-600 mb-4 tracking-wider">2. Dispositivo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Tipo</label>
                <select tabIndex={3} className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 rounded-xl p-2.5 text-sm font-bold outline-none cursor-pointer" 
                  onChange={e => setForm({...form, tipo_equipo: e.target.value})}>
                  <option value="Celular"> Celular</option>
                  <option value="Smartwatch"> Smartwatch</option>
                  <option value="Tablet"> Tablet</option>
                  <option value="Otro"> Otro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Marca</label>
                <select tabIndex={4} className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 rounded-xl p-2.5 text-sm font-bold outline-none cursor-pointer"
                  onChange={e => setForm({...form, marca: e.target.value})}>
                  <option value="">Selecciona...</option>
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Motorola">Motorola</option>
                  <option value="OnePlus">OnePlus</option>
                  <option value="Infinix">Infinix</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Xiaomi">TECNO</option>
                  <option value="Xiaomi">OPPO</option>
                  <option value="Xiaomi">Alcatel</option>
                  <option value="Xiaomi">Realme</option>
                  <option value="Xiaomi">ZTE</option>
                  <option value="Otra">Otra...</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">Modelo Específico</label>
                <input type="text" required tabIndex={5} placeholder="Ej. RAZR 2024, Galaxy Watch 6..." className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 rounded-xl p-2.5 text-sm font-medium outline-none" onChange={e => setForm({...form, modelo: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Color</label>
                <select tabIndex={6} className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 rounded-xl p-2.5 text-sm font-bold outline-none cursor-pointer"
                  onChange={e => setForm({...form, color: e.target.value})}>
                  <option value="Negro">Negro</option>
                  <option value="Blanco">Blanco</option>
                  <option value="Plata/Gris">Plata/Gris</option>
                  <option value="Azul">Azul</option>
                  <option value="Rojo">Rojo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">IMEI / Serie (Opcional)</label>
                <input type="text" tabIndex={7} className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 rounded-xl p-2.5 text-sm font-medium outline-none" onChange={e => setForm({...form, imei: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">PIN / Patrón de Desbloqueo</label>
                <input type="text" tabIndex={8} placeholder="Ej. 1234 o L" className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 rounded-xl p-2.5 text-sm font-black tracking-widest outline-none" onChange={e => setForm({...form, pin: e.target.value})} />
              </div>
            </div>

            {/* ✨ BOTONES RÁPIDOS EN VEZ DE CHECKBOXES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b pb-1">¿Qué deja el cliente?</p>
                <div className="flex flex-wrap gap-2">
                  {['protector', 'cargador', 'sd', 'sim'].map((item) => (
                    <button type="button" key={item} tabIndex={9}
                      onClick={() => setChecks({...checks, [item]: !checks[item as keyof typeof checks]})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${checks[item as keyof typeof checks] ? 'bg-blue-100 border-blue-400 text-blue-800 shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                      {checks[item as keyof typeof checks] ? '✅' : '❌'} {item.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b pb-1">Condición de Riesgo</p>
                <div className="flex flex-wrap gap-2">
                  {['reparado', 'mojado', 'apagado'].map((item) => (
                    <button type="button" key={item} tabIndex={10}
                      onClick={() => setChecks({...checks, [item]: !checks[item as keyof typeof checks]})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${checks[item as keyof typeof checks] ? 'bg-red-100 border-red-400 text-red-800 shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                      {checks[item as keyof typeof checks] ? '⚠️' : '✓'} {item.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. DIAGNÓSTICO */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-black uppercase text-orange-600 mb-4 tracking-wider">3. Diagnóstico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Falla Principal</label>
                <select tabIndex={11} className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 rounded-xl p-3 text-sm font-bold outline-none cursor-pointer mb-2"
                  onChange={e => setForm({...form, falla_tipo: e.target.value})}>
                  <option value="Pantalla Quebrada / Touch">Pantalla Quebrada / Touch</option>
                  <option value="Batería Dañada / Inflada">Batería Dañada / Inflada</option>
                  <option value="Centro de Carga">Centro de Carga</option>
                  <option value="Desbloqueo / Software">Desbloqueo / Software</option>
                  <option value="Limpieza / Mantenimiento">Limpieza / Mantenimiento</option>
                  <option value="Otro">Otro problema...</option>
                </select>
                {form.falla_tipo === 'Otro' && (
                  <input type="text" tabIndex={12} required placeholder="Especifica la falla..." className="w-full bg-white border-2 border-orange-200 focus:border-orange-500 rounded-xl p-2.5 text-sm font-medium outline-none" onChange={e => setForm({...form, falla_detalle: e.target.value})} />
                )}
              </div>
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Detalles Estéticos / Rayones</label>
                <select tabIndex={13} 
                  className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl p-3 font-medium outline-none cursor-pointer" 
                  onChange={e => setForm({...form, detalles: e.target.value})}
                  defaultValue=""
                >
                  <option value="" disabled>Selecciona el estado físico...</option>
                  <option value="Sin detalles esteticos">✨ Sin detalles estéticos</option>
                  <option value="Raspones en los bordes">Raspones en los bordes</option>
                  <option value="Golpes en los bordes">Golpes en los bordes</option>
                  <option value="Pantalla rayada">Pantalla rayada</option>
                  <option value="Lente de camara roto">Lente de cámara roto</option>
                  <option value="Pantalla quebrada">Pantalla quebrada</option>
                  <option value="Tapa trasera despegada/quebrada/dañada">Tapa trasera despegada/quebrada/dañada</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. FINANZAS Y COBRO */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/4">
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Costo Total ($)</label>
              <input type="number" min="0" step="0.01" tabIndex={14}
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-blue-500 focus:ring-0 rounded-xl p-3 font-black text-white outline-none text-xl" 
                value={form.costo_total} onFocus={(e) => e.target.value === '0' && setForm({...form, costo_total: ''})} onChange={e => setForm({...form, costo_total: e.target.value})} />
            </div>

            <div className="w-full md:w-1/4">
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Anticipo ($)</label>
              <input type="number" min="0" step="0.01" tabIndex={15}
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-blue-500 focus:ring-0 rounded-xl p-3 font-black text-white outline-none text-xl" 
                value={form.anticipo} onFocus={(e) => e.target.value === '0' && setForm({...form, anticipo: ''})} onChange={e => setForm({...form, anticipo: e.target.value})} />
            </div>

            <div className="w-full md:w-1/4 flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Saldo a Pagar</span>
              <span className="text-3xl font-black text-emerald-400">
                ${Math.max(0, (parseFloat(form.costo_total || '0') - parseFloat(form.anticipo || '0'))).toFixed(2)}
              </span>
            </div>
            
            <div className="w-full md:w-1/4 mt-4 md:mt-0">
              <button type="submit" disabled={loading} tabIndex={16}
                className="w-full bg-blue-600 text-white font-black py-4 px-4 rounded-xl hover:bg-blue-500 active:transform active:scale-95 transition-all disabled:bg-slate-700 text-sm flex justify-center items-center shadow-[0_0_20px_rgba(37,99,235,0.3)] uppercase tracking-wide">
                {loading ? 'Cargando...' : 'IMPRIMIR TICKET'}
              </button>
            </div>
          </div>
        </form>  
      </div>
    </div>
  );
};