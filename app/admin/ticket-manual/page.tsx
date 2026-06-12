'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TicketManual() {
  const router = useRouter();
  const [qrsCargados, setQrsCargados] = useState(0);

  // Selector del tipo de plantilla
  const [tipoTicket, setTipoTicket] = useState('VENTA_DISPOSITIVO');

  // Estado unificado con los nuevos campos integrados
  const [form, setForm] = useState({
    folio: Math.floor(Math.random() * 90000) + 10000, 
    fecha: new Date().toISOString().substring(0, 16), 
    cliente: 'Público en General',
    telefono: '',
    vendedor: 'Ricardo',           // ✨ NUEVO
    lugar_venta: 'Local',          // ✨ NUEVO
    
    // Campos de Reparación
    equipo: '',
    falla_o_trabajo: '',
    anticipo: '0',
    
    // Campos de Venta
    cantidad: '1',
    descripcion: '',
    precio_unitario: '0',
    metodo_pago: 'Efectivo',
    extras: 'Ninguno',

    // Campos Técnicos para Dispositivos
    color: '',
    imei: '',
    numero_serie: ''
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

  // Cálculos dinámicos
  const costoTotalVenta = (parseFloat(form.precio_unitario) * parseInt(form.cantidad || '1')).toFixed(2);
  const saldoReparacion = (parseFloat(form.precio_unitario) - parseFloat(form.anticipo || '0')).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* MAGIA CSS PARA LA IMPRESIÓN (Márgenes reducidos a 0.5cm para ganar espacio) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0.5cm; size: letter portrait; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .print-hidden { display: none !important; }
          .print-only { display: block !important; width: 100%; max-width: 21cm; margin: 0 auto; }
        }
      `}} />

      {/* ==========================================
          PANEL IZQUIERDO: FORMULARIO
          ========================================== */}
      <div className="w-full md:w-1/3 bg-white border-r border-slate-200 p-5 h-screen overflow-y-auto print-hidden shadow-xl z-10">
        
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">📝 Ticket Libre</h2>
          <button onClick={() => router.push('/admin')} className="text-xs font-bold text-slate-500 hover:text-slate-900 border px-3 py-1 rounded">Volver</button>
        </div>

        <div className="space-y-4">
          {/* TIPO DE TICKET */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Tipo de Documento</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg p-2 font-bold text-slate-800 outline-none focus:border-blue-500"
              value={tipoTicket}
              onChange={(e) => setTipoTicket(e.target.value)}
            >
              <option value="VENTA_DISPOSITIVO">📱 Venta de Dispositivo</option>
              <option value="VENTA_REFACCION">🔧 Venta de Refacción/Accesorio</option>
              <option value="RECIBO_REPARACION">📥 Recibo de Recepción (Taller)</option>
              <option value="ENTREGA_REPARACION">✅ Entrega Final (Reparación)</option>
            </select>
          </div>

          {/* DATOS GENERALES Y NUEVOS CAMPOS */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Folio (Manual)</label>
              <input type="text" name="folio" value={form.folio} onChange={handleChange} className="w-full border rounded p-1.5 text-sm font-mono" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fecha y Hora</label>
              <input type="datetime-local" name="fecha" value={form.fecha} onChange={handleChange} className="w-full border rounded p-1.5 text-xs" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cliente</label>
              <input type="text" name="cliente" value={form.cliente} onChange={handleChange} className="w-full border rounded p-1.5 text-sm font-bold" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Teléfono</label>
              <input type="text" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Opcional" className="w-full border rounded p-1.5 text-sm" />
            </div>
            
            {/* ✨ NUEVOS SELECTORES DE VENDEDOR Y LUGAR DE VENTA */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vendedor</label>
              <select name="vendedor" value={form.vendedor} onChange={handleChange} className="w-full border rounded p-1.5 text-sm font-bold text-blue-700 bg-blue-50">
                <option value="Ricardo">Ricardo</option>
                <option value="Rodolfo">Rodolfo</option>
                <option value="Rigo">Rigo</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lugar de Venta</label>
              <select name="lugar_venta" value={form.lugar_venta} onChange={handleChange} className="w-full border rounded p-1.5 text-sm font-bold text-blue-700 bg-blue-50">
                <option value="Local">Local</option>
                <option value="Facebook">Facebook</option>
                <option value="Redes Sociales">Redes Sociales</option>
                <option value="Conocidos">Conocidos</option>
                <option value="Cliente frecuente">Cliente frecuente</option>
              </select>
            </div>
          </div>

          {/* CAMPOS DINÁMICOS SEGÚN EL TIPO */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
            
            {(tipoTicket === 'RECIBO_REPARACION' || tipoTicket === 'ENTREGA_REPARACION') ? (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Equipo (Marca, Modelo, Color)</label>
                  <input type="text" name="equipo" value={form.equipo} onChange={handleChange} className="w-full border border-blue-200 rounded p-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">
                    {tipoTicket === 'RECIBO_REPARACION' ? 'Falla Reportada / Observaciones' : 'Trabajo Realizado / Diagnóstico'}
                  </label>
                  <textarea name="falla_o_trabajo" value={form.falla_o_trabajo} onChange={handleChange} rows={2} className="w-full border border-blue-200 rounded p-1.5 text-sm"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Costo Total ($)</label>
                    <input type="number" name="precio_unitario" value={form.precio_unitario} onChange={handleChange} className="w-full border border-blue-200 rounded p-1.5 text-sm font-bold text-emerald-600" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Anticipo ($)</label>
                    <input type="number" name="anticipo" value={form.anticipo} onChange={handleChange} className="w-full border border-blue-200 rounded p-1.5 text-sm font-bold text-slate-600" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Cant.</label>
                    <input type="number" name="cantidad" value={form.cantidad} onChange={handleChange} className="w-full border border-blue-200 rounded p-1.5 text-sm text-center" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Descripción del Artículo</label>
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2} placeholder="Ej. iPhone 13 Pro Max 128GB" className="w-full border border-blue-200 rounded p-1.5 text-sm"></textarea>
                  </div>
                </div>

                {tipoTicket === 'VENTA_DISPOSITIVO' && (
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-blue-100 mt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Color</label>
                      <input type="text" name="color" value={form.color} onChange={handleChange} placeholder="Ej. Azul" className="w-full border border-blue-200 rounded p-1.5 text-xs" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">IMEI (15 dígitos)</label>
                      <input type="text" name="imei" value={form.imei} onChange={handleChange} placeholder="Opcional" className="w-full border border-blue-200 rounded p-1.5 text-xs font-mono" />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Número de Serie</label>
                      <input type="text" name="numero_serie" value={form.numero_serie} onChange={handleChange} placeholder="Opcional" className="w-full border border-blue-200 rounded p-1.5 text-xs font-mono" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Precio Unitario ($)</label>
                    <input type="number" name="precio_unitario" value={form.precio_unitario} onChange={handleChange} className="w-full border border-blue-200 rounded p-1.5 text-sm font-bold text-emerald-600" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Método de Pago</label>
                    <select name="metodo_pago" value={form.metodo_pago} onChange={handleChange} className="w-full border border-blue-200 rounded p-1.5 text-sm">
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta">Tarjeta</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Incluye / Notas Adicionales</label>
                  <input type="text" name="extras" value={form.extras} onChange={handleChange} className="w-full border border-blue-200 rounded p-1.5 text-sm" />
                </div>
              </>
            )}
          </div>

          <button 
            onClick={handlePrint}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl text-base tracking-widest shadow-lg flex justify-center items-center gap-2 transition-transform active:scale-95"
          >
            🖨️ IMPRIMIR TICKET
          </button>
        </div>
      </div>

      {/* ==========================================
          PANEL DERECHO: VISTA PREVIA (Optimizada para espacio)
          ========================================== */}
      <div className="w-full md:w-2/3 bg-slate-200 p-4 md:p-8 flex justify-center overflow-y-auto print-only">
        
        <div className="bg-white text-black font-sans w-full max-w-[21cm] border-2 border-black p-4 md:p-5 flex flex-col relative shadow-2xl print:shadow-none print:border-2">
          
          {/* ENCABEZADO */}
          <div className="text-center border-b border-black pb-2 mb-1">
            <h1 className="text-3xl font-black uppercase tracking-wider leading-none">MOVILPLACE</h1>
            <p className="text-xs font-bold uppercase tracking-widest mt-1.5 bg-black text-white inline-block px-3 py-0.5">
              {tipoTicket === 'RECIBO_REPARACION' && 'Orden de Servicio (Recepción)'}
              {tipoTicket === 'ENTREGA_REPARACION' && 'Recibo de Servicio Final'}
              {tipoTicket === 'VENTA_DISPOSITIVO' && 'Comprobante de Compra (Equipo)'}
              {tipoTicket === 'VENTA_REFACCION' && 'Comprobante de Compra'}
            </p>
            <p className="text-[11px] text-gray-700 leading-tight mt-1.5">
              Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia (Soriana Hiper)
            </p>
            <div className="flex justify-center gap-3 text-[10px] font-bold mt-1 text-gray-600">
              <span>Ventas: 686 176 4066</span> | <span>Reparaciones: 686 172 0406</span> | <span>Desbloqueos: 686 168 7729</span>
            </div>
          </div>

          {/* FOLIO Y FECHA */}
          <div className="flex justify-between items-center text-sm font-bold font-mono my-1">
            <p>FOLIO: <span className="text-emerald-600">#{tipoTicket.includes('VENTA') ? 'V' : 'R'}-{form.folio}</span></p>
            <p>{new Date(form.fecha).toLocaleString()}</p>
          </div>

          {/* ✨ DATOS DEL CLIENTE (Formato compacto con los nuevos campos) */}
          <div className="border border-black p-2 text-xs grid grid-cols-2 gap-x-4 gap-y-1 mb-2 bg-gray-50/50">
            <p><strong>CLIENTE:</strong> {form.cliente.toUpperCase()}</p>
            <p><strong>TELÉFONO:</strong> {form.telefono || 'N/A'}</p>
            <p className="text-[11px] text-gray-600"><strong>VENDEDOR:</strong> {form.vendedor.toUpperCase()}</p>
            <p className="text-[11px] text-gray-600"><strong>CANAL:</strong> {form.lugar_venta.toUpperCase()}</p>
          </div>

          {/* CUERPO DEL TICKET */}
          <div className="border-t-2 border-b-2 border-dashed border-black py-2 flex-grow">
            
            {/* VISTA DE REPARACIÓN */}
            {(tipoTicket === 'RECIBO_REPARACION' || tipoTicket === 'ENTREGA_REPARACION') && (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-1 gap-1">
                  <p><strong>EQUIPO REPARADO:</strong> {form.equipo.toUpperCase() || 'NO ESPECIFICADO'}</p>
                  <p><strong>{tipoTicket === 'RECIBO_REPARACION' ? 'FALLA REPORTADA:' : 'TRABAJO REALIZADO:'}</strong> {form.falla_o_trabajo.toUpperCase() || 'NO ESPECIFICADO'}</p>
                </div>
                
                <div className="border-2 border-black p-3 text-sm font-bold bg-gray-50 mt-4 w-full max-w-sm ml-auto">
                  <div className="flex justify-between mb-1"><span>COSTO TOTAL ESTIMADO:</span> <span>${parseFloat(form.precio_unitario || '0').toFixed(2)}</span></div>
                  <div className="flex justify-between mb-1 text-gray-600"><span>ANTICIPO RECIBIDO:</span> <span>-${parseFloat(form.anticipo || '0').toFixed(2)}</span></div>
                  <div className="flex justify-between text-base border-t-2 border-black mt-1 pt-1"><span>SALDO A LIQUIDAR:</span> <span>${saldoReparacion}</span></div>
                </div>
              </div>
            )}

            {/* VISTA DE VENTA */}
            {(tipoTicket === 'VENTA_DISPOSITIVO' || tipoTicket === 'VENTA_REFACCION') && (
              <>
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-black text-left font-bold">
                      <th className="pb-1 w-12">CANT</th>
                      <th className="pb-1">DESCRIPCIÓN</th>
                      <th className="pb-1 text-right">IMPORTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-bold text-base">
                      <td className="pt-2 align-top">{form.cantidad}x</td>
                      <td className="pt-2 leading-tight whitespace-pre-wrap">
                        {form.descripcion.toUpperCase() || 'ARTÍCULO VARIO'}
                        
                        {tipoTicket === 'VENTA_DISPOSITIVO' && (
                          <div className="mt-1 space-y-0.5 text-[10px] text-gray-600 font-normal font-sans leading-tight">
                            {form.color && <p>Color: <span className="font-bold uppercase text-gray-800">{form.color}</span></p>}
                            {form.imei && <p>IMEI: <span className="font-bold text-gray-800">{form.imei}</span></p>}
                            {form.numero_serie && <p>Serie: <span className="font-bold text-gray-800">{form.numero_serie}</span></p>}
                          </div>
                        )}
                      </td>
                      <td className="pt-2 text-right align-top">${costoTotalVenta}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-sm bg-gray-50 border border-gray-300 p-2 leading-tight flex justify-between items-center mt-4">
                  <div>
                    <span className="font-bold text-blue-800 uppercase block text-xs">Incluye / Notas:</span>
                    <p className="font-mono font-bold text-gray-700 text-xs">{form.extras}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-400 uppercase block">Pago</span>
                    <span className="font-bold border-2 border-black px-3 py-0.5 bg-white text-sm">{form.metodo_pago}</span>
                  </div>
                </div>

                <div className="flex justify-end text-base font-bold font-mono mt-3">
                  <div className="w-48 border-2 border-black flex justify-between p-2 bg-gray-100">
                    <span>TOTAL:</span><span>${costoTotalVenta}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* POLÍTICAS LEGALES (Textos y padding optimizados) */}
          <div className="text-[9px] leading-tight border border-black p-2 space-y-1 text-justify font-medium mt-2">
            {(tipoTicket === 'RECIBO_REPARACION' || tipoTicket === 'ENTREGA_REPARACION') ? (
              <>
                <p className="font-bold text-center border-b border-gray-300 pb-0.5 uppercase mb-1">Políticas del Taller</p>
                <p>• Garantía de 15 días sobre la reparación realizada a partir de la fecha de entrega.</p>
                <p>• Toda revisión genera un costo si el equipo no es reparado. No nos hacemos responsables por equipos mojados, apagados o que no den imagen.</p>
                <p>• Pasados 15 días de notificación, MovilPlace no se hace responsable por el equipo.</p>
              </>
            ) : (
              <>
                <p className="font-bold text-center border-b border-gray-300 pb-1 uppercase mb-1">Políticas de Garantía de Venta</p>
          <p>• Los equipos cuentan con <span className="font-bold">30 días de garantía</span> exclusivamente contra defectos de fábrica a partir de la fecha de esta nota.</p>
          <p>• <span className="font-bold underline">La garantía queda ANULADA</span> si el equipo presenta golpes, raspones, humedad, pantallas estrelladas, alteraciones de software o por arrepentimiento del cliente.</p>
          <p>• Para artículos de electrónica o accesorios, NO aplican cambios ni devoluciones. Solicita que se revisen al momento de la compra.</p>
          <p>• Es estrictamente indispensable presentar este comprobante original para validar cualquier garantía. Sin nota, no hay garantía.</p>
          <p>• En caso de requerir garantía, el cliente debe primero comunicarse con nosotros para después acudir a nuestras instalaciones para que un técnico revise el equipo y determine si aplica la garantía o no.</p>
              </>
            )}
          </div>

          {/* QRS Y FIRMAS (Diseño estructurado estilo tarjetas) */}
          <div className="mt-auto pt-4 border-t-2 border-black">
            <div className="grid grid-cols-3 gap-3">

              {/* Tarjeta 1: Encuesta */}
              <div className="border border-black rounded-lg flex flex-col overflow-hidden">
                <div 
                  className="bg-gray-100 border-b border-black py-1 px-1 text-center" 
                  style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                >
                  <p className="font-black text-[8.5px] uppercase tracking-wide">¡Tu opinión cuenta!</p>
                </div>
                <div className="p-1.5 flex flex-col items-center bg-white text-center flex-grow justify-center">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" className="w-14 h-14 mb-1.5"/>
                  <p className="text-[7.5px] leading-tight font-bold text-gray-700">Ayúdanos a mejorar llenando esta breve encuesta de satisfacción.</p>
                </div>
              </div>

              {/* Tarjeta 2: Canal VIP */}
              <div className="border border-black rounded-lg flex flex-col overflow-hidden">
                <div 
                  className="bg-gray-100 border-b border-black py-1 px-1 text-center" 
                  style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                >
                  <p className="font-black text-[8.5px] uppercase tracking-wide">Únete al Canal VIP</p>
                </div>
                <div className="p-1.5 flex flex-col items-center bg-white text-center flex-grow justify-center">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=AQUI_PON_TU_LINK_DEL_CANAL" className="w-14 h-14 mb-1.5"/>
                  <p className="text-[7.5px] leading-tight font-bold text-gray-700">Escanea para recibir ofertas exclusivas y remates antes que nadie.</p>
                </div>
              </div>

              {/* Tarjeta 3: Reseña */}
              <div className="border border-black rounded-lg flex flex-col overflow-hidden">
                <div 
                  className="bg-gray-100 border-b border-black py-1 px-1 text-center" 
                  style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                >
                  <p className="font-black text-[8.5px] uppercase tracking-wide">⭐⭐⭐⭐⭐ Reseña</p>
                </div>
                <div className="p-1.5 flex flex-col items-center bg-white text-center flex-grow justify-center">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" className="w-14 h-14 mb-1.5"/>
                  <p className="text-[7.5px] leading-tight font-bold text-gray-700">¿Te gustó nuestro servicio? Apóyanos con 5 estrellas en Google.</p>
                </div>
              </div>

            </div>

            {/* Firmas */}
            <div className="pt-6 grid grid-cols-2 gap-10 text-center px-6">
              <div>
                <div className="border-b-2 border-black w-full h-5"></div>
                <p className="text-[10px] font-black mt-1.5 uppercase tracking-widest text-gray-800">Firma Cliente</p>
              </div>
              <div>
                <div className="border-b-2 border-black w-full h-5"></div>
                <p className="text-[10px] font-black mt-1.5 uppercase tracking-widest text-gray-800">Firma MovilPlace</p>
              </div>
            </div>
            
            <p className="text-xs font-black uppercase tracking-widest text-center pt-4 pb-1">
              {tipoTicket.includes('VENTA') ? '¡Gracias por tu compra!' : '¡Gracias por tu preferencia!'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}