import React, { useState } from 'react';
import { FaArrowLeft, FaSave, FaPaperPlane, FaEnvelope, FaClock, FaUser, FaBuilding, FaPhone, FaAt, FaHistory, FaFileAlt, FaPaperclip, FaBold, FaItalic, FaUnderline, FaListUl, FaListOl } from 'react-icons/fa';
import './DetalleTicket.css';

function DetalleTicket({ ticket, onVolver, onActualizar }) {
  const [tabActiva, setTabActiva] = useState('historial');
  
  // Estado para nueva actuacion
  const [nuevaActuacion, setNuevaActuacion] = useState({
    mensaje: '',
    notificarContacto: false,
    notificarAsignado: true,
    esPublica: true,
    esSolucion: false,
    horas: 0,
    minutos: 0
  });

  // Datos del ticket - vendran de Supabase
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
    // Datos del cliente
    cliente: ticket?.cliente || '',
    empresa: ticket?.empresa || '',
    telefono: ticket?.telefono || '',
    correo: ticket?.correo || '',
    descripcion: ticket?.descripcion || ''
  });

  // Historial de actuaciones - vendra de Supabase
  const [historial, setHistorial] = useState([]);

  // Agentes disponibles - vendran de Supabase
  const [agentes, setAgentes] = useState([]);

  // Equipos disponibles - vendran de Supabase
  const [equipos, setEquipos] = useState([]);

  // Enviar actuacion
  const enviarActuacion = () => {
    if (!nuevaActuacion.mensaje.trim()) {
      alert('Escriba un mensaje');
      return;
    }

    const actuacion = {
      id: Date.now(),
      mensaje: nuevaActuacion.mensaje,
      fecha: new Date().toISOString(),
      autor: 'Agente Actual', // Vendra del usuario logueado
      esPublica: nuevaActuacion.esPublica,
      esSolucion: nuevaActuacion.esSolucion,
      tiempoRegistrado: `${nuevaActuacion.horas}h ${nuevaActuacion.minutos}m`
    };

    setHistorial([...historial, actuacion]);
    
    // Si se marco notificar, aqui se enviaria el correo via Supabase Edge Functions
    if (nuevaActuacion.notificarContacto) {
      console.log('Enviando correo a:', datosTicket.correo);
    }

    // Limpiar formulario
    setNuevaActuacion({
      mensaje: '',
      notificarContacto: false,
      notificarAsignado: true,
      esPublica: true,
      esSolucion: false,
      horas: 0,
      minutos: 0
    });
  };

  // Guardar cambios del ticket
  const guardarCambios = () => {
    // Aqui se guardaria en Supabase
    alert('Cambios guardados');
    if (onActualizar) onActualizar(datosTicket);
  };

  // Marcar como finalizado
  const toggleFinalizado = () => {
    setDatosTicket({ ...datosTicket, finalizado: !datosTicket.finalizado });
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="detalle-ticket">
      {/* Barra superior */}
      <div className="detalle-header">
        <div className="header-izquierda">
          <button className="boton-volver" onClick={onVolver}>
            <FaArrowLeft />
          </button>
          <span className="ticket-numero">#{datosTicket.id}</span>
          <h1 className="ticket-titulo-header">{datosTicket.titulo}</h1>
        </div>
        <div className="header-derecha">
          <div className="header-campo">
            <label>Equipo:</label>
            <select 
              value={datosTicket.equipo} 
              onChange={(e) => setDatosTicket({...datosTicket, equipo: e.target.value})}
            >
              <option value="">Seleccionar</option>
              {equipos.map(eq => (
                <option key={eq.id} value={eq.nombre}>{eq.nombre}</option>
              ))}
            </select>
          </div>
          <div className="header-campo">
            <label>Asignado:</label>
            <select 
              value={datosTicket.agenteId} 
              onChange={(e) => setDatosTicket({...datosTicket, agenteId: e.target.value})}
            >
              <option value="">Sin asignar</option>
              {agentes.map(ag => (
                <option key={ag.id} value={ag.id}>{ag.nombre}</option>
              ))}
            </select>
          </div>
          <button className="boton-guardar-header" onClick={guardarCambios}>
            <FaSave />
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="detalle-contenido">
        {/* Panel izquierdo - Info cliente */}
        <div className="panel-cliente">
          <div className="cliente-buscar">
            <input type="text" placeholder="Buscar contacto" />
          </div>
          
          <div className="cliente-info">
            <div className="cliente-avatar">
              <FaBuilding />
            </div>
            <div className="cliente-datos">
              <h3>{datosTicket.empresa || 'Sin empresa'}</h3>
              <p className="cliente-nombre"><FaUser /> {datosTicket.cliente || 'Sin contacto'}</p>
              <p className="cliente-telefono"><FaPhone /> {datosTicket.telefono || '-'}</p>
              <p className="cliente-correo"><FaAt /> {datosTicket.correo || '-'}</p>
            </div>
          </div>

          <div className="cliente-menu">
            <details>
              <summary>Ticket</summary>
              <ul>
                <li>Duplicar</li>
                <li>Dividir</li>
                <li>Fusionar</li>
              </ul>
            </details>
            <details>
              <summary>Enlazar</summary>
              <ul>
                <li>Con otro ticket</li>
                <li>Con contrato</li>
              </ul>
            </details>
          </div>
        </div>

        {/* Panel central */}
        <div className="panel-central">
          {/* Datos basicos del ticket */}
          <div className="ticket-datos-rapidos">
            <div className="dato-grupo">
              <label>Título (*)</label>
              <input 
                type="text" 
                value={datosTicket.titulo}
                onChange={(e) => setDatosTicket({...datosTicket, titulo: e.target.value})}
              />
            </div>
            <div className="dato-grupo">
              <label>Prioridad (*)</label>
              <select 
                value={datosTicket.prioridad}
                onChange={(e) => setDatosTicket({...datosTicket, prioridad: e.target.value})}
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div className="dato-grupo">
              <label>Fecha prevista</label>
              <input 
                type="datetime-local" 
                value={datosTicket.fechaPrevista}
                onChange={(e) => setDatosTicket({...datosTicket, fechaPrevista: e.target.value})}
              />
            </div>
            <div className="dato-grupo finalizado-grupo">
              <label>Finalizado</label>
              <button 
                className={`boton-finalizado ${datosTicket.finalizado ? 'si' : 'no'}`}
                onClick={toggleFinalizado}
              >
                {datosTicket.finalizado ? 'Sí' : 'No'}
              </button>
            </div>
          </div>

          {/* Fechas de atencion */}
          <div className="ticket-fechas">
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

          {/* Tabs Historial / Datos */}
          <div className="ticket-tabs">
            <button 
              className={tabActiva === 'historial' ? 'activo' : ''} 
              onClick={() => setTabActiva('historial')}
            >
              <FaHistory /> Historial
            </button>
            <button 
              className={tabActiva === 'datos' ? 'activo' : ''} 
              onClick={() => setTabActiva('datos')}
            >
              <FaFileAlt /> Datos del ticket
            </button>
          </div>

          {/* Contenido de tabs */}
          <div className="tab-contenido">
            {tabActiva === 'historial' && (
              <>
                {/* Nueva actuacion */}
                <div className="nueva-actuacion">
                  <h3>Nueva actuación</h3>
                  
                  {/* Opciones de notificacion */}
                  <div className="notificar-opciones">
                    <span>Notificar a:</span>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={nuevaActuacion.notificarContacto}
                        onChange={(e) => setNuevaActuacion({...nuevaActuacion, notificarContacto: e.target.checked})}
                      />
                      Contacto
                    </label>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={nuevaActuacion.notificarAsignado}
                        onChange={(e) => setNuevaActuacion({...nuevaActuacion, notificarAsignado: e.target.checked})}
                      />
                      Asignado
                    </label>
                    <button className="boton-email" title="Enviar por correo">
                      <FaEnvelope />
                    </button>
                  </div>

                  {/* Destinatario */}
                  <div className="destinatario">
                    <span>Para:</span>
                    <span className="correo-destino">{datosTicket.correo}</span>
                  </div>

                  {/* Opciones de tiempo y tipo */}
                  <div className="actuacion-opciones">
                    <div className="tiempo-registro">
                      <select value="AGENT">
                        <option value="AGENT">AGENT</option>
                      </select>
                      <input 
                        type="number" 
                        placeholder="Horas" 
                        min="0"
                        value={nuevaActuacion.horas}
                        onChange={(e) => setNuevaActuacion({...nuevaActuacion, horas: parseInt(e.target.value) || 0})}
                      />
                      <input 
                        type="number" 
                        placeholder="Minutos" 
                        min="0" 
                        max="59"
                        value={nuevaActuacion.minutos}
                        onChange={(e) => setNuevaActuacion({...nuevaActuacion, minutos: parseInt(e.target.value) || 0})}
                      />
                      <button className="boton-tiempo" title="Registrar tiempo">
                        <FaClock />
                      </button>
                    </div>
                    <div className="tipo-actuacion">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={nuevaActuacion.esPublica}
                          onChange={(e) => setNuevaActuacion({...nuevaActuacion, esPublica: e.target.checked})}
                        />
                        Pública
                      </label>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={nuevaActuacion.esSolucion}
                          onChange={(e) => setNuevaActuacion({...nuevaActuacion, esSolucion: e.target.checked})}
                        />
                        Solución
                      </label>
                      <select className="respuestas-rapidas">
                        <option value="">Respuestas rápidas</option>
                      </select>
                    </div>
                  </div>

                  {/* Editor de texto */}
                  <div className="editor-toolbar">
                    <button title="Negrita"><FaBold /></button>
                    <button title="Cursiva"><FaItalic /></button>
                    <button title="Subrayado"><FaUnderline /></button>
                    <span className="separador"></span>
                    <button title="Lista"><FaListUl /></button>
                    <button title="Lista numerada"><FaListOl /></button>
                    <span className="separador"></span>
                    <button title="Adjuntar"><FaPaperclip /></button>
                  </div>

                  <textarea 
                    className="editor-texto"
                    placeholder="Escriba su mensaje..."
                    value={nuevaActuacion.mensaje}
                    onChange={(e) => setNuevaActuacion({...nuevaActuacion, mensaje: e.target.value})}
                    rows="6"
                  />

                  {/* Boton enviar */}
                  <div className="actuacion-acciones">
                    <button className="boton-enviar" onClick={enviarActuacion}>
                      <FaPaperPlane /> Enviar Actuación
                    </button>
                  </div>
                </div>

                {/* Historial de actuaciones */}
                <div className="historial-actuaciones">
                  <h3>Historial de actuaciones</h3>
                  
                  {historial.length === 0 ? (
                    <p className="sin-historial">No hay actuaciones registradas</p>
                  ) : (
                    <div className="lista-actuaciones">
                      {historial.map(act => (
                        <div key={act.id} className={`actuacion-item ${act.esSolucion ? 'solucion' : ''}`}>
                          <div className="actuacion-header">
                            <span className="actuacion-autor">{act.autor}</span>
                            <span className="actuacion-fecha">{formatearFecha(act.fecha)}</span>
                            {act.tiempoRegistrado && act.tiempoRegistrado !== '0h 0m' && (
                              <span className="actuacion-tiempo"><FaClock /> {act.tiempoRegistrado}</span>
                            )}
                            {act.esSolucion && <span className="badge-solucion">Solución</span>}
                          </div>
                          <div className="actuacion-mensaje">{act.mensaje}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {tabActiva === 'datos' && (
              <div className="datos-completos">
                <div className="datos-seccion">
                  <h4>Información del ticket</h4>
                  <div className="datos-grid">
                    <div className="dato-item">
                      <label>Estado</label>
                      <select 
                        value={datosTicket.estado}
                        onChange={(e) => setDatosTicket({...datosTicket, estado: e.target.value})}
                      >
                        <option value="Abierto">Abierto</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="En Espera de Usuario">En Espera de Usuario</option>
                        <option value="Resuelto">Resuelto</option>
                        <option value="Cerrado">Cerrado</option>
                      </select>
                    </div>
                    <div className="dato-item">
                      <label>Prioridad</label>
                      <select 
                        value={datosTicket.prioridad}
                        onChange={(e) => setDatosTicket({...datosTicket, prioridad: e.target.value})}
                      >
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </div>
                    <div className="dato-item">
                      <label>Fecha creación</label>
                      <input type="text" value={formatearFecha(datosTicket.fechaCreacion)} readOnly />
                    </div>
                  </div>
                </div>

                <div className="datos-seccion">
                  <h4>Descripción</h4>
                  <textarea 
                    value={datosTicket.descripcion}
                    onChange={(e) => setDatosTicket({...datosTicket, descripcion: e.target.value})}
                    rows="4"
                  />
                </div>

                <div className="datos-seccion">
                  <h4>Información del cliente</h4>
                  <div className="datos-grid">
                    <div className="dato-item">
                      <label>Empresa</label>
                      <input type="text" value={datosTicket.empresa} readOnly />
                    </div>
                    <div className="dato-item">
                      <label>Contacto</label>
                      <input type="text" value={datosTicket.cliente} readOnly />
                    </div>
                    <div className="dato-item">
                      <label>Correo</label>
                      <input type="text" value={datosTicket.correo} readOnly />
                    </div>
                    <div className="dato-item">
                      <label>Teléfono</label>
                      <input type="text" value={datosTicket.telefono} readOnly />
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