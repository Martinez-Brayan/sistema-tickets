import React, { useState } from 'react';
import { 
  FaArrowLeft, FaSave, FaPaperPlane, FaEnvelope, FaClock, FaUser, FaBuilding, 
  FaPhone, FaAt, FaHistory, FaPaperclip, FaBold, FaItalic, FaUnderline, 
  FaStrikethrough, FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaLink, FaImage, FaTable, FaCode, FaExpand, FaSmile, FaTimes, FaPlus, FaTrash,
  FaEye, FaEyeSlash
} from 'react-icons/fa';
import './DetalleTicket.css';

function DetalleTicket({ ticket, onVolver, onActualizar, esCliente = false }) {
  const [tabActiva, setTabActiva] = useState('historial');
  
  const [nuevaActuacion, setNuevaActuacion] = useState({
    mensaje: '',
    notificarContacto: false,
    notificarAsignado: true,
    notificarPropietario: false,
    notificarCorreo: false,
    notaInterna: false,
    marcarSolucion: false,
    esPublica: true,
    esSolucion: false,
    horas: 0,
    minutos: 0,
    respuestaRapida: ''
  });

  const [anexos, setAnexos] = useState([]);
  const [filtroHistorial, setFiltroHistorial] = useState('todos');

  const [datosTicket, setDatosTicket] = useState({
    id: ticket?.id || 0,
    titulo: ticket?.titulo || '',
    prioridad: ticket?.prioridad || 'Media',
    estado: ticket?.estado || 'Abierto',
    fechaCreacion: ticket?.fechaCreacion || new Date().toISOString(),
    fechaPrevista: ticket?.fechaPrevista || '',
    fechaCheckIn: ticket?.fechaCheckIn || '',
    fechaCheckOut: ticket?.fechaCheckOut || '',
    agente: ticket?.agente || '',
    agenteId: ticket?.agenteId || '',
    equipo: ticket?.equipo || '',
    finalizado: ticket?.finalizado || false,
    cliente: ticket?.cliente || '',
    empresa: ticket?.empresa || '',
    telefono: ticket?.telefono || '',
    correo: ticket?.correo || '',
    descripcion: ticket?.descripcion || ''
  });

  const [historial, setHistorial] = useState([]);
  const [agentes] = useState([]);

  const [respuestasRapidas] = useState([
    { id: 1, nombre: 'Saludo inicial', texto: 'Estimado cliente,\n\nGracias por contactarnos. Hemos recibido su solicitud y la estamos revisando.\n\nSaludos cordiales.' },
    { id: 2, nombre: 'Solicitar información', texto: 'Estimado cliente,\n\nPara poder ayudarle mejor, necesitamos la siguiente información:\n\n- \n- \n\nQuedamos atentos.' },
    { id: 3, nombre: 'Ticket resuelto', texto: 'Estimado cliente,\n\nNos complace informarle que su solicitud ha sido resuelta.\n\nSi tiene alguna otra consulta, no dude en contactarnos.\n\nSaludos cordiales.' }
  ]);

  const seleccionarRespuestaRapida = (id) => {
    const respuesta = respuestasRapidas.find(r => r.id === parseInt(id));
    if (respuesta) {
      setNuevaActuacion({ ...nuevaActuacion, mensaje: respuesta.texto, respuestaRapida: id });
    }
  };

  const subirAnexo = (e) => {
    const archivos = Array.from(e.target.files);
    const nuevosAnexos = archivos.map(archivo => ({
      id: Date.now() + Math.random(),
      nombre: archivo.name,
      tamaño: archivo.size,
      publico: true
    }));
    setAnexos([...anexos, ...nuevosAnexos]);
  };

  const eliminarAnexo = (id) => setAnexos(anexos.filter(a => a.id !== id));
  const togglePublicoAnexo = (id) => setAnexos(anexos.map(a => a.id === id ? { ...a, publico: !a.publico } : a));

  const enviarActuacion = () => {
    if (!nuevaActuacion.mensaje.trim()) {
      alert('Escriba un mensaje');
      return;
    }

    const actuacion = {
      id: Date.now(),
      mensaje: nuevaActuacion.mensaje,
      fecha: new Date().toISOString(),
      autor: esCliente ? datosTicket.cliente || 'Cliente' : 'Agente',
      autorRol: esCliente ? 'CLIENTE' : 'AGENT',
      esPublica: esCliente ? !nuevaActuacion.notaInterna : nuevaActuacion.esPublica,
      esSolucion: esCliente ? nuevaActuacion.marcarSolucion : nuevaActuacion.esSolucion,
      tiempoHoras: esCliente ? 0 : nuevaActuacion.horas,
      tiempoMinutos: esCliente ? 0 : nuevaActuacion.minutos,
      anexos: anexos.map(a => ({ id: a.id, nombre: a.nombre, publico: a.publico })),
      tipo: (esCliente ? nuevaActuacion.notificarCorreo : nuevaActuacion.notificarContacto) ? 'EMAIL' : 'NOTA'
    };

    setHistorial([actuacion, ...historial]);
    setNuevaActuacion({
      mensaje: '', notificarContacto: false, notificarAsignado: true, notificarPropietario: false,
      notificarCorreo: false, notaInterna: false, marcarSolucion: false, esPublica: true,
      esSolucion: false, horas: 0, minutos: 0, respuestaRapida: ''
    });
    setAnexos([]);
  };

  const guardarCambios = () => {
    alert('Cambios guardados');
    if (onActualizar) onActualizar(datosTicket);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatearTamaño = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const historialFiltrado = historial.filter(h => {
    if (filtroHistorial === 'todos') return true;
    if (filtroHistorial === 'emails') return h.tipo === 'EMAIL';
    if (filtroHistorial === 'notas') return h.tipo === 'NOTA';
    if (filtroHistorial === 'publicos') return h.esPublica;
    return true;
  });

  return (
    <div className="detalle-ticket">
      {/* Header */}
      <div className="detalle-header">
        <div className="header-izquierda">
          <button className="boton-volver" onClick={onVolver}><FaArrowLeft /></button>
          <span className="ticket-numero">#{datosTicket.id}</span>
          <h1 className="ticket-titulo-header">{datosTicket.titulo}</h1>
        </div>
        <div className="header-derecha">
          {!esCliente && (
            <>
              <div className="header-campo">
                <label>Equipo:</label>
                <select value={datosTicket.equipo} onChange={(e) => setDatosTicket({...datosTicket, equipo: e.target.value})}>
                  <option value="">Seleccionar</option>
                  <option value="HioPos">HioPos</option>
                  <option value="Manager">Manager</option>
                  <option value="Soporte">Soporte</option>
                </select>
              </div>
              <div className="header-campo">
                <label>Asignado:</label>
                <select value={datosTicket.agenteId} onChange={(e) => setDatosTicket({...datosTicket, agenteId: e.target.value})}>
                  <option value="">Sin asignar</option>
                  {agentes.map(ag => <option key={ag.id} value={ag.id}>{ag.nombre}</option>)}
                </select>
              </div>
            </>
          )}
          <button className="boton-icono" title="Refrescar"><FaHistory /></button>
          <button className="boton-icono" title="Usuario"><FaUser /></button>
          <button className="boton-icono cerrar" title="Cerrar" onClick={onVolver}><FaTimes /></button>
          <button className="boton-icono guardar" title="Guardar" onClick={guardarCambios}><FaSave /></button>
        </div>
      </div>

      {/* Contenido */}
      <div className="detalle-contenido">
        {/* Panel izquierdo */}
        <div className="panel-cliente">
          <div className="cliente-buscar">
            <input type="text" placeholder="Buscar contacto" />
          </div>
          <div className="cliente-info">
            <div className="cliente-avatar"><FaBuilding /></div>
            <div className="cliente-datos">
              <h3>{datosTicket.empresa || 'Sin empresa'}</h3>
              <p className="cliente-nombre">{datosTicket.cliente || 'Sin contacto'}</p>
              <p><FaPhone /> {datosTicket.telefono || '-'}</p>
              <p><FaAt /> {datosTicket.correo || '-'}</p>
            </div>
          </div>
          <div className="cliente-menu">
            <details><summary>Ticket</summary><ul><li>Duplicar</li><li>Dividir</li><li>Fusionar</li></ul></details>
            <details><summary>Enlazar</summary><ul><li>Con otro ticket</li><li>Con contrato</li></ul></details>
            <details><summary>Útiles</summary><ul><li>Imprimir</li><li>Exportar</li></ul></details>
            <details><summary>Generar</summary><ul><li>Informe</li><li>Factura</li></ul></details>
            <details><summary>Ayuda</summary><ul><li>Documentación</li><li>Soporte</li></ul></details>
          </div>
        </div>

        {/* Panel central */}
        <div className="panel-central">
          {/* Datos del ticket - FIJO arriba */}
          <div className="ticket-datos-contenedor">
            <div className="ticket-datos-rapidos">
              <div className="dato-grupo">
                <label>Título (*)</label>
                <input type="text" value={datosTicket.titulo} onChange={(e) => setDatosTicket({...datosTicket, titulo: e.target.value})} readOnly={esCliente} />
              </div>
              <div className="dato-grupo">
                <label>Estado (*)</label>
                <select value={datosTicket.estado} onChange={(e) => setDatosTicket({...datosTicket, estado: e.target.value})} disabled={esCliente}>
                  <option value="Abierto">Abierto</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="En Espera de Usuario">En Espera</option>
                  <option value="Resuelto">Resuelto</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>
              <div className="dato-grupo">
                <label>Prioridad (*)</label>
                <select value={datosTicket.prioridad} onChange={(e) => setDatosTicket({...datosTicket, prioridad: e.target.value})} disabled={esCliente}>
                  <option value="Alta">Alta</option>
                  <option value="Media">Normal</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
              <div className="dato-grupo">
                <label>Fecha prevista</label>
                <input type="datetime-local" value={datosTicket.fechaPrevista} onChange={(e) => setDatosTicket({...datosTicket, fechaPrevista: e.target.value})} readOnly={esCliente} />
              </div>
            </div>

            <div className="ticket-fechas">
              <div className="fecha-campo">
                <label>Finalizado</label>
                <input type="text" value={datosTicket.finalizado ? 'Sí' : 'No'} readOnly />
              </div>
              <div className="fecha-campo">
                <label>Fec Inicial Atención</label>
                <input type="text" value={formatearFecha(datosTicket.fechaCreacion)} readOnly />
              </div>
              <div className="fecha-campo">
                <label>Fecha Check IN</label>
                <input type="text" value={formatearFecha(datosTicket.fechaCheckIn)} readOnly />
              </div>
              <div className="fecha-campo">
                <label>Fecha Check Out</label>
                <input type="text" value={formatearFecha(datosTicket.fechaCheckOut)} readOnly />
              </div>
            </div>

            {/* Tabs */}
            <div className="ticket-tabs">
              <button className={tabActiva === 'historial' ? 'activo' : ''} onClick={() => setTabActiva('historial')}>Historial</button>
              <button className={tabActiva === 'datos' ? 'activo' : ''} onClick={() => setTabActiva('datos')}>Datos del ticket</button>
            </div>
          </div>

          {/* Contenido de tabs - CON SCROLL */}
          <div className="chat-layout">
            {tabActiva === 'historial' && (
              <div className="chat-mensajes">
                {/* Nueva actuacion CLIENTE */}
                {esCliente ? (
                  <div className="nueva-actuacion-cliente">
                    <textarea 
                      placeholder="Escriba su mensaje..."
                      value={nuevaActuacion.mensaje}
                      onChange={(e) => setNuevaActuacion({...nuevaActuacion, mensaje: e.target.value})}
                      rows="3"
                    />
                    <div className="opciones-cliente">
                      <label><input type="checkbox" checked={nuevaActuacion.notaInterna} onChange={(e) => setNuevaActuacion({...nuevaActuacion, notaInterna: e.target.checked})} /> Nota Interna</label>
                      <label><input type="checkbox" checked={nuevaActuacion.notificarCorreo} onChange={(e) => setNuevaActuacion({...nuevaActuacion, notificarCorreo: e.target.checked})} /> <FaEnvelope /> Notificar por correo</label>
                      <label><input type="checkbox" checked={nuevaActuacion.marcarSolucion} onChange={(e) => setNuevaActuacion({...nuevaActuacion, marcarSolucion: e.target.checked})} /> Marcar como Solución</label>
                      <button className="btn-enviar-chat" onClick={enviarActuacion}><FaPaperPlane /></button>
                    </div>
                  </div>
                ) : (
                  /* Nueva actuacion AGENTE */
                  <div className="nueva-actuacion">
                    <h3>Nueva actuación</h3>
                    <div className="notificar-opciones">
                      <span>Notificar a:</span>
                      <label><input type="checkbox" checked={nuevaActuacion.notificarContacto} onChange={(e) => setNuevaActuacion({...nuevaActuacion, notificarContacto: e.target.checked})} /> Contacto</label>
                      <label><input type="checkbox" checked={nuevaActuacion.notificarAsignado} onChange={(e) => setNuevaActuacion({...nuevaActuacion, notificarAsignado: e.target.checked})} /> Asignado</label>
                      <label><input type="checkbox" checked={nuevaActuacion.notificarPropietario} onChange={(e) => setNuevaActuacion({...nuevaActuacion, notificarPropietario: e.target.checked})} /> Propietario</label>
                      <label><input type="checkbox" /> CC</label>
                      <button className="boton-email"><FaEnvelope /></button>
                    </div>

                    <div className="destinatario">
                      <span>Para:</span>
                      <span className="correo-destino">{datosTicket.correo || 'Sin correo'}</span>
                    </div>

                    <div className="actuacion-opciones">
                      <div className="tiempo-registro">
                        <select defaultValue="AGENT"><option value="AGENT">AGENT</option><option value="ADMIN">ADMIN</option></select>
                        <input type="number" placeholder="Horas" min="0" value={nuevaActuacion.horas} onChange={(e) => setNuevaActuacion({...nuevaActuacion, horas: parseInt(e.target.value) || 0})} />
                        <input type="number" placeholder="Min" min="0" max="59" value={nuevaActuacion.minutos} onChange={(e) => setNuevaActuacion({...nuevaActuacion, minutos: parseInt(e.target.value) || 0})} />
                        <button className="boton-tiempo"><FaClock /></button>
                      </div>
                      <div className="tipo-actuacion">
                        <label>Pública <input type="checkbox" checked={nuevaActuacion.esPublica} onChange={(e) => setNuevaActuacion({...nuevaActuacion, esPublica: e.target.checked})} /></label>
                        <label>Solución <input type="checkbox" checked={nuevaActuacion.esSolucion} onChange={(e) => setNuevaActuacion({...nuevaActuacion, esSolucion: e.target.checked})} /></label>
                        <select className="respuestas-rapidas" value={nuevaActuacion.respuestaRapida} onChange={(e) => seleccionarRespuestaRapida(e.target.value)}>
                          <option value="">Respuestas rápidas</option>
                          {respuestasRapidas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="editor-toolbar">
                      <button><FaCode /></button>
                      <button><FaExpand /></button>
                      <button><FaSmile /></button>
                      <span className="separador"></span>
                      <button><FaBold /></button>
                      <button><FaItalic /></button>
                      <button><FaUnderline /></button>
                      <button><FaStrikethrough /></button>
                      <span className="separador"></span>
                      <button><FaListUl /></button>
                      <button><FaListOl /></button>
                      <button><FaAlignLeft /></button>
                      <button><FaAlignCenter /></button>
                      <button><FaAlignRight /></button>
                      <span className="separador"></span>
                      <button><FaTable /></button>
                      <button><FaImage /></button>
                      <button><FaLink /></button>
                    </div>

                    <textarea className="editor-texto" placeholder="Escriba su mensaje..." value={nuevaActuacion.mensaje} onChange={(e) => setNuevaActuacion({...nuevaActuacion, mensaje: e.target.value})} rows="6" />

                    <div className="anexos-seccion">
                      <h4>Anexos</h4>
                      <table className="anexos-tabla">
                        <thead><tr><th>Fichero</th><th>Público</th><th>Eliminar</th></tr></thead>
                        <tbody>
                          {anexos.length === 0 ? (
                            <tr><td colSpan="3" style={{textAlign:'center',color:'#999'}}>No se encontraron registros</td></tr>
                          ) : anexos.map(a => (
                            <tr key={a.id}>
                              <td><FaPaperclip /> {a.nombre} ({formatearTamaño(a.tamaño)})</td>
                              <td><button onClick={() => togglePublicoAnexo(a.id)}>{a.publico ? <FaEye style={{color:'#27ae60'}} /> : <FaEyeSlash style={{color:'#999'}} />}</button></td>
                              <td><button onClick={() => eliminarAnexo(a.id)}><FaTrash style={{color:'#e74c3c'}} /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <label className="boton-subir"><FaPlus /> Añadir fichero(s)<input type="file" multiple onChange={subirAnexo} hidden /></label>
                    </div>

                    <div className="actuacion-acciones">
                      <button className="boton-enviar" onClick={enviarActuacion}><FaPaperPlane /> Enviar Actuación</button>
                    </div>
                  </div>
                )}

                {/* Historial */}
                <div className="historial-actuaciones">
                  <div className="historial-header">
                    <h3>Historial</h3>
                    {!esCliente && (
                      <select value={filtroHistorial} onChange={(e) => setFiltroHistorial(e.target.value)}>
                        <option value="todos">Todos</option>
                        <option value="emails">Solo emails</option>
                        <option value="notas">Solo notas</option>
                        <option value="publicos">Solo públicos</option>
                      </select>
                    )}
                  </div>
                  {historialFiltrado.length === 0 ? (
                    <p className="sin-historial">No hay actuaciones registradas</p>
                  ) : (
                    <div className="lista-actuaciones">
                      {historialFiltrado.map(act => (
                        <div key={act.id} className={`actuacion-item ${act.esSolucion ? 'solucion' : ''}`}>
                          <div className="actuacion-header">
                            <span className="actuacion-autor">{act.autor}</span>
                            {act.tipo === 'EMAIL' && <span className="badge-email">EMAIL</span>}
                            {!act.esPublica && !esCliente && <span className="badge-privado">PRIVADO</span>}
                            {act.esSolucion && <span className="badge-solucion">SOLUCIÓN</span>}
                            <span className="actuacion-fecha">{formatearFecha(act.fecha)}</span>
                          </div>
                          <div className="actuacion-mensaje">{act.mensaje}</div>
                          {act.anexos?.length > 0 && (
                            <div className="actuacion-anexos">
                              {act.anexos.map(a => <a key={a.id} href="#"><FaPaperclip /> {a.nombre}</a>)}
                            </div>
                          )}
                          {!esCliente && (act.tiempoHoras > 0 || act.tiempoMinutos > 0) && (
                            <div className="actuacion-tiempo"><FaClock /> {act.tiempoHoras}h {act.tiempoMinutos}m</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tabActiva === 'datos' && (
              <div className="chat-mensajes">
                <div className="datos-completos">
                  <div className="datos-seccion">
                    <h4>Descripción del ticket</h4>
                    <textarea value={datosTicket.descripcion} onChange={(e) => setDatosTicket({...datosTicket, descripcion: e.target.value})} rows="4" readOnly={esCliente} />
                  </div>
                  <div className="datos-seccion">
                    <h4>Información del cliente</h4>
                    <div className="datos-grid">
                      <div className="dato-item"><label>Empresa</label><input type="text" value={datosTicket.empresa} readOnly /></div>
                      <div className="dato-item"><label>Contacto</label><input type="text" value={datosTicket.cliente} readOnly /></div>
                      <div className="dato-item"><label>Correo</label><input type="text" value={datosTicket.correo} readOnly /></div>
                      <div className="dato-item"><label>Teléfono</label><input type="text" value={datosTicket.telefono} readOnly /></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleTicket;