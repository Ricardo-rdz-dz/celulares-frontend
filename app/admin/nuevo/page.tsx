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
    marca: '', modelo: '', imei: '', pin: '', 
    falla: '', detalles: '', anticipo: '0'
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

      // ✨ 3. CREAR EL TICKET CON EL ID DEL TÉCNICO
      const resTicket = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: dataCliente.cliente.id,
          marca: form.marca,
          modelo: form.modelo,
          imei_o_serie: form.imei,
          pin_desbloqueo: form.pin,
          detalles_esteticos: form.detalles,
          falla_reportada: form.falla,
          anticipo: parseFloat(form.anticipo),
          creado_por: creadoPorId // 👈 AQUÍ AGREGAMOS LA AUDITORÍA
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
          
          {/* CLIENTE */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-black uppercase text-red-600 mb-4 tracking-wider">Datos del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo</label>
                <input type="text" required 
                  value={form.nombre} /* ✨ Esto hace que se auto-escriba si ya existe */
                  className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl p-3 font-medium text-slate-900 outline-none" 
                  onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono (WhatsApp)</label>
                <input type="tel" required 
                  value={form.telefono} /* ✨ Necesario para controlar lo que se escribe */
                  className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl p-3 font-medium text-slate-900 outline-none" 
                  onChange={e => setForm({...form, telefono: e.target.value})} />
              </div>
            </div>
          </div>

          {/* ✨ ALERTA VIP DE LEALTAD */}
          {visitasCliente >= 3 && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3 animate-fadeIn shadow-sm">
              <span className="text-2xl">🌟</span>
              <div>
                <h4 className="font-black text-sm uppercase tracking-tight">¡Cliente VIP Frecuente!</h4>
                <p className="text-xs font-medium mt-0.5">Este cliente tiene <span className="font-black">{visitasCliente} visitas</span>. El sistema sugiere aplicar un <strong>10% de descuento</strong> en mano de obra para premiar su lealtad.</p>
              </div>
            </div>
          )}

          {/* ✨ CÓDIGO DE REFERIDO */}
          {visitasCliente === 0 && form.telefono.length >= 10 && (
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl animate-fadeIn">
              <label className="block text-xs font-bold text-purple-800 mb-2 uppercase tracking-wider">🎁 ¿Viene recomendado por un amigo?</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ej. RIC-123"
                  value={codigoIngresado}
                  onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
                  className="bg-white border border-purple-200 focus:border-purple-500 rounded-lg p-2 text-sm font-mono outline-none uppercase w-48"
                />
                <button 
                  type="button"
                  onClick={async () => {
                    if(!codigoIngresado) return;
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referidos/validar/${codigoIngresado}`);
                      const data = await res.json();
                      if(data.valido) {
                        setReferidoValido({ valido: true, nombre: data.dueño.nombre });
                      } else {
                        setReferidoValido({ valido: false });
                      }
                    } catch(err) {
                      console.error("Error validando código:", err);
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 rounded-lg transition-colors"
                >
                  Validar Código
                </button>
              </div>
              
              {referidoValido?.valido === true && (
                <p className="text-xs text-purple-700 font-bold mt-2">✅ Código válido. Recomendado por: {referidoValido.nombre} (Aplica descuento al total).</p>
              )}
              {referidoValido?.valido === false && (
                <p className="text-xs text-red-600 font-bold mt-2">❌ Código no encontrado o no válido.</p>
              )}
            </div>
          )}

          {/* EQUIPO */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-black uppercase text-blue-600 mb-4 tracking-wider">Detalles del Equipo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Marca</label>
                <input type="text" required
                  className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl p-3 font-medium text-slate-900 outline-none" 
                  onChange={e => setForm({...form, marca: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Modelo</label>
                <input type="text" required
                  className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl p-3 font-medium text-slate-900 outline-none" 
                  onChange={e => setForm({...form, modelo: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">IMEI / Serie</label>
                <input type="text" required
                  className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl p-3 font-medium text-slate-900 outline-none" 
                  onChange={e => setForm({...form, imei: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">PIN / Patrón</label>
                <input type="text"
                  className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl p-3 font-medium text-slate-900 outline-none" 
                  placeholder="Ej. 1234 o N/A"
                  onChange={e => setForm({...form, pin: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Falla Reportada</label>
                <textarea required rows={3}
                  className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl p-3 font-medium text-slate-900 outline-none resize-none"
                  placeholder="¿Qué le duele al equipo?"
                  onChange={e => setForm({...form, falla: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Condiciones Estéticas</label>
                <textarea required rows={3}
                  className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl p-3 font-medium text-slate-900 outline-none resize-none"
                  placeholder="Rayones, golpes, pantalla estrellada, etc."
                  onChange={e => setForm({...form, detalles: e.target.value})}></textarea>
              </div>
            </div>
          </div>

          {/* ANTICIPO Y BOTÓN */}
          <div className="flex items-center justify-between pt-4">
            <div className="w-1/4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Anticipo ($)</label>
              <input type="number" min="0"
                className="w-full bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-0 rounded-xl p-3 font-black text-slate-900 outline-none text-xl" 
                defaultValue="0"
                onChange={e => setForm({...form, anticipo: e.target.value})} />
            </div>
            
            <div className="w-2/3 mt-6">
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white font-black py-4 px-6 rounded-xl hover:bg-blue-700 active:transform active:scale-95 transition-all disabled:bg-slate-400 text-lg flex justify-center items-center gap-2 shadow-xl shadow-blue-500/30">
                {loading ? 'Procesando...' : 'Registrar y Generar Orden'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};