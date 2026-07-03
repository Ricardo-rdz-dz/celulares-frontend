//ticket final de la venta
//NOTA DE VENTA DE ARTICULOS - FORMATO DE TALONARIO FISICO

// Este diseño es para imprimir una nota de venta física que se le entrega al cliente al comprar un artículo.

// Contiene toda la información relevante de la venta, cliente, producto, condiciones y cláusulas legales.

// El diseño está optimizado para impresión en papel tamaño ticket o similar, con márgenes adecuados y sin elementos innecesarios.

'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function NotaDeVenta() {
  const router = useRouter();
  const params = useParams(); 
  const id = params?.id;      

  const [venta, setVenta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrsCargados, setQrsCargados] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchVenta = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ventas/${id}`); 
        
        // Si el servidor responde con error, lo atrapamos antes de que rompa el JSON
        if (!res.ok) {
          console.error("El servidor devolvió un estado de error:", res.status);
          setVenta({ error: `Código de error del servidor: ${res.status}` });
          setLoading(false);
          return;
        }

        const data = await res.json();
        setVenta(data);
      } catch (error) {
        console.error("Error cargando venta:", error);
        setVenta({ error: "No se pudo conectar con el servidor backend." });
      }
      setLoading(false);
    };
    fetchVenta();
  }, [id]); 

  useEffect(() => {
    if (venta && venta.id && qrsCargados >= 3) {
      setTimeout(() => {
        window.print();
      }, 300); 
    }
  }, [venta, qrsCargados]);

  if (loading) return <div className="text-center mt-10 font-bold text-xl text-slate-700">Generando Nota de Venta...</div>;
  
  // Si la venta viene vacía, con error, o no tiene ID, mostramos la pantalla de aviso amigable
  if (!venta || !venta.id || venta.error) {
    return (
      <div className="text-center mt-12 p-8 bg-red-50 border-2 border-red-200 rounded-2xl max-w-md mx-auto text-slate-800 shadow-md">
        <p className="text-red-600 font-black text-xl mb-2">⚠️ Nota de venta no disponible</p>
        <p className="text-xs font-bold text-slate-500 mb-6">{venta?.error || 'ID de ticket inválido o la venta no existe en la base de datos.'}</p>
        <button 
          onClick={() => router.push('/admin/pos')} 
          className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-slate-800 transition"
        >
          ⬅️ Volver al Punto de Venta
        </button>
      </div>
    );
  }

  // Sacamos el Folio de forma segura sin usar split si el id no es un string largo
  const folioVenta = venta.id && String(venta.id).includes('-') 
    ? String(venta.id).split('-')[0].toUpperCase() 
    : String(venta.id).substring(0, 6).toUpperCase();

  // ✨ AQUÍ ESTÁ EL TRUCO: Tu backend manda el objeto dentro de un arreglo o directo. 
  // Evaluamos ambas opciones para que jale sí o sí con lo que ya tenías guardado.
  const equipo = Array.isArray(venta.inventario) ? venta.inventario[0] : (venta.inventario || {});

  return (
    <div className="w-full max-w-[21cm] mx-auto bg-white text-black font-sans print:w-[21cm] print:h-[28cm]">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0.8cm; size: letter portrait; }
          body { -webkit-print-color-adjust: exact; }
          .print-hidden { display: none !important; }
        }
      `}} />

      {/* BOTONES AUXILIARES */}
      <div className="mb-3 flex justify-between items-center border-b pb-1 print-hidden">
        <button onClick={() => router.push('/admin/pos')} className="border px-4 py-2 rounded hover:bg-slate-50 font-medium text-xs">
          ⬅️ Nueva Venta
        </button>
        <button onClick={() => window.print()} className="bg-emerald-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-emerald-700 text-xs">
          🖨️ Imprimir Ticket
        </button>
      </div>

      <div className="border-2 border-black p-5 flex flex-col min-h-[25cm] relative justify-between">
        
        <div>
          {/* ENCABEZADO */}
          <div className="text-center border-b border-black pb-3 mb-2">
            <h1 className="text-4xl font-black uppercase tracking-wider leading-none">MOVILPLACE</h1>
            <p className="text-sm font-bold uppercase tracking-widest mt-2 bg-black text-white inline-block px-4 py-1">Comprobante de Compra</p>
            <p className="text-sm text-gray-700 leading-tight mt-2">
              Blvd. Adolfo Lopez Mateos y Calle Hiper Calafia (Soriana Hiper)
            </p>
            <div className="flex justify-center gap-4 text-xs font-bold mt-2 text-gray-600">
              <span>Ventas: 686 176 4066</span> | <span>Reparaciones: 686 172 0406</span> | <span>Desbloqueos: 686 168 7729</span>
            </div>
          </div>

          {/* FOLIO Y FECHA */}
          <div className="flex justify-between items-center text-sm font-bold font-mono">
            <p className="text-lg">FOLIO: <span className="text-emerald-600">#V-{folioVenta}</span></p>
            <p className="text-lg">{new Date(venta.created_at).toLocaleDateString()} {new Date(venta.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>

          {/* DATOS DEL CLIENTE */}
          <div className="border border-black p-3 text-sm grid grid-cols-2 gap-4 my-2 bg-gray-50/50">
            <p><strong>CLIENTE:</strong> {venta.clientes?.nombre ? venta.clientes.nombre.toUpperCase() : (venta.cliente_nombre || 'PÚBLICO EN GENERAL').toUpperCase()}</p>
            <p><strong>TELÉFONO:</strong> {venta.clientes?.telefono || venta.cliente_telefono || 'N/A'}</p>
          </div>

          {/* DETALLE DEL PRODUCTO VENDIDO */}
          <div className="border-t-2 border-b-2 border-dashed border-black py-3 my-2">
            <table className="w-full text-base font-mono">
              <thead>
                <tr className="border-b-2 border-black text-left font-bold">
                  <th className="pb-2 w-16">CANT</th>
                  <th className="pb-2">DESCRIPCIÓN DEL EQUIPO</th>
                  <th className="pb-2 text-right">IMPORTE</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold text-lg">
                  <td className="pt-3 align-top">{venta.cantidad || 1}x</td>
                  <td className="pt-3 leading-tight flex gap-4 items-start">
                    
                    {/* Miniatura de la Foto si existe */}
                    {equipo.imagen_url && (
                      <img 
                        src={equipo.imagen_url} 
                        alt="Equipo" 
                        className="w-20 h-20 object-cover border border-gray-300 p-0.5 bg-white shadow-sm shrink-0" 
                      />
                    )}
                    
                    {/* Detalles Técnicos */}
                    <div className="space-y-1 w-full">
                      <span className="text-lg font-black text-black">{equipo.nombre || venta.producto_nombre || 'Artículo de Tienda'}</span>
                      <br/>
                      {equipo.sku && <span className="text-xs font-normal text-gray-500">SKU: {equipo.sku}</span>}
                      
                      {equipo.descripcion && (
                        <p className="text-xs font-normal text-gray-700 italic bg-gray-50 p-1.5 border border-gray-200 mt-1">
                          "{equipo.descripcion}"
                        </p>
                      )}

                      {/* Especificaciones técnicas (IMEI, Color, Serie) */}
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-black font-mono bg-blue-50/40 p-2 border border-blue-100 rounded">
                        <p>Color: <span className="font-bold uppercase">{equipo.color || 'No especificado'}</span></p>
                        <p>Serie: <span className="font-bold">{equipo.numero_serie || 'N/A'}</span></p>
                        <p className="col-span-2">IMEI: <span className="font-bold tracking-widest bg-white px-1.5 py-0.5 border border-gray-300 inline-block mt-0.5">{equipo.imei || 'NO REGISTRADO'}</span></p>
                      </div>
                    </div>

                  </td>
                  <td className="pt-3 text-right align-top font-black text-xl">${Number(venta.total || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* INCLUYE / EXTRAS Y VENDEDOR */}
          <div className="text-sm bg-gray-50 border border-gray-300 p-3 leading-tight flex justify-between items-center my-2">
            <div>
              <span className="font-bold text-blue-800 uppercase block text-xs">Incluye / Accesorios:</span>
              <p className="font-mono font-bold text-gray-800 text-base mt-0.5">{venta.detalles_regalo_accesorios || 'Ninguno'}</p>
              <p className="text-[11px] text-gray-600 mt-1 uppercase font-bold tracking-wider">Atendido por: <span className="text-black font-black">{venta.vendedor || 'Asesor MovilPlace'}</span></p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-gray-400 uppercase block">Método de Pago</span>
              <span className="font-black border-2 border-black px-4 py-1 bg-white text-base inline-block mt-0.5">{venta.metodo_pago}</span>
            </div>
          </div>

          {/* TOTALES */}
          <div className="flex justify-end text-lg font-bold font-mono my-2">
            <div className="w-64 border-2 border-black flex justify-between p-2.5 bg-gray-100 text-xl font-black">
              <span>TOTAL PAGADO:</span><span>${Number(venta.total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* CLÁUSULAS DE GARANTÍA */}
          <div className="text-[11px] border border-black p-2.5 space-y-1 text-justify font-medium my-2 leading-tight">
            <p className="font-bold text-center border-b border-gray-300 pb-1 uppercase mb-1">Políticas de Garantía de Venta</p>
            <p>• Los equipos cuentan con <span className="font-bold">30 días de garantía</span> exclusivamente contra defectos de fábrica a partir de la fecha de esta nota.</p>
            <p>• <span className="font-bold underline">La garantía queda ANULADA</span> si el equipo presenta golpes, raspones, humedad, pantallas estrelladas, alteraciones de software o por arrepentimiento del cliente.</p>
            <p>• Para artículos de electrónica o accesorios, NO aplican cambios ni devoluciones. Solicita que se revisen al momento de la compra.</p>
            <p>• Es estrictamente indispensable presentar este comprobante original para validar cualquier garantía. Sin nota, no hay garantía.</p>
          </div>
        </div>

        {/* CÓDIGOS QR Y FIRMAS FÍSICAS */}
        <div className="pt-3 border-t-2 border-dashed border-gray-300 mt-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-1.5 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
                <p className="font-black text-[9px] tracking-wide mb-1">¡VALORAMOS TU OPINIÓN!</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://forms.gle/TdJQcXYvyqJias5p6" className="w-14 h-14" onLoad={() => setQrsCargados(prev => prev + 1)}/>
                <p className="text-[8px] text-gray-500 mt-0.5">Escanea la encuesta</p>
              </div>

              <div className="p-1.5 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
                <p className="font-black text-[9px] tracking-wide mb-1">OFERTAS VIP</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://whatsapp.com/channel/0029VbCp9NLFMqrVPF1ZLA0W" className="w-14 h-14" onLoad={() => setQrsCargados(prev => prev + 1)}/>
                <p className="text-[8px] text-gray-500 mt-0.5">Únete al Canal WhatsApp</p>
              </div>

              <div className="p-1.5 border border-black border-dashed rounded text-center flex flex-col items-center bg-gray-50">
                <p className="font-black text-[9px] tracking-wide mb-1">⭐⭐⭐⭐⭐ RESEÑA</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://maps.app.goo.gl/JtQShVkZDMFvYm9z9" className="w-14 h-14" onLoad={() => setQrsCargados(prev => prev + 1)}/>
                <p className="text-[8px] text-gray-500 mt-0.5">Déjanos 5 estrellas</p>
              </div>
            </div>

            {/* ZONA DE FIRMA EN PAPEL */}
            <div className="pt-4 grid grid-cols-2 gap-8 text-center">
              <div>
                <div className="border-b-2 border-black w-full h-6"></div>
                <p className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Firma de Conformidad Cliente</p>
              </div>
              <div>
                <div className="border-b-2 border-black w-full h-6"></div>
                <p className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Entregó MovilPlace</p>
              </div>
            </div>
            <p className="text-xs font-black uppercase tracking-wider text-center pt-2">¡Gracias por tu preferencia!</p>
        </div>

      </div>
    </div>
  );
}