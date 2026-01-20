import React, { useState } from 'react';
import { FaClock, FaTicketAlt, FaHistory, FaCheckCircle, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import './CheckInOut.css';

function CheckInOut() {
  // Estado para mostrar formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Estado del formulario
  const [registro, setRegistro] = useState({
    ticketId: '',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '',
    horaFin: '',
    descripcion: ''
  });

  // Tickets asignados al agente
  const [ticketsAsignados] = useState([
    { id: 5658, titulo: 'Factura al credito', empresa: 'empresa ', prioridad: 'Alta' },
    { id: 5722, titulo: 'Facturas duplicadas en ICG', empresa: 'Panama', prioridad: 'Media' },
    { id: 5784, titulo: 'Base de Datos ', empresa: ' empresa', prioridad: 'Alta' },
    { id: 5835, titulo: 'Cliente Juan', empresa: ' empresa', prioridad: 'Baja' },
  ]);

  // Historial de registros
  const [historial, setHistorial] = useState([
    { id: 1, ticketId: 5658, titulo: 'Factura al credito', fecha: '2026-01-20', horaInicio: '09:30', horaFin: '10:45', duracion: '1h 15m', descripcion: 'Revision de factura con el cliente' },
    { id: 2, ticketId: 5722, titulo: 'Facturas duplicadas', fecha: '2026-01-20', horaInicio: '11:00', horaFin: '12:30', duracion: '1h 30m', descripcion: 'Correccion en el sistema' },
    { id: 3, ticketId: 5784, titulo: 'Base de Datos', fecha: '2026-01-19', horaInicio: '14:00', horaFin: '16:00', duracion: '2h 00m', descripcion: 'Mantenimiento de base de datos' },
    { id: 4, ticketId: 5658, titulo: 'Factura al credito', fecha: '2026-01-18', horaInicio: '08:00', horaFin: '09:30', duracion: '1h 30m', descripcion: 'Llamada con el cliente' },
  ]);

  // Calcular duracion
  const calcularDuracion = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return '';
    
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFin.split(':').map(Number);
    
    let totalMinutos = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (totalMinutos < 0) totalMinutos += 24 * 60;
    
    const hrs = Math.floor(totalMinutos / 60);
    const mins = totalMinutos % 60;
    return `${hrs}h ${mins}m`;
  };

  // Guardar registro
  const guardarRegistro = (e) => {
    e.preventDefault();
    
    if (!registro.ticketId || !registro.horaInicio || !registro.horaFin) {
      alert('Complete los campos obligatorios');
      return;
    }

    const ticketSeleccionado = ticketsAsignados.find(t => t.id.toString() === registro.ticketId);
    
    const nuevoRegistro = {
      id: Date.now(),
      ticketId: parseInt(registro.ticketId),
      titulo: ticketSeleccionado?.titulo || 'Ticket #' + registro.ticketId,
      fecha: registro.fecha,
      horaInicio: registro.horaInicio,
      horaFin: registro.horaFin,
      duracion: calcularDuracion(registro.horaInicio, registro.horaFin),
      descripcion: registro.descripcion
    };

    setHistorial([nuevoRegistro, ...historial]);
    setMostrarFormulario(false);
    setRegistro({
      ticketId: '',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '',
      horaFin: '',
      descripcion: ''
    });
  };

  // Eliminar registro
  const eliminarRegistro = (id) => {
    if (window.confirm('¿Eliminar este registro de tiempo?')) {
      setHistorial(historial.filter(r => r.id !== id));
    }
  };

  // Calcular tiempo total de hoy
  const calcularTiempoHoy = () => {
    const hoy = new Date().toISOString().split('T')[0];
    let totalMinutos = 0;
    
    historial.filter(r => r.fecha === hoy).forEach(r => {
      const match = r.duracion.match(/(\d+)h\s*(\d+)m/);
      if (match) {
        totalMinutos += parseInt(match[1]) * 60 + parseInt(match[2]);
      }
    });

    const hrs = Math.floor(totalMinutos / 60);
    const mins = totalMinutos % 60;
    return `${hrs}h ${mins}m`;
  };

  // Calcular tiempo total de la semana
  const calcularTiempoSemana = () => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    
    let totalMinutos = 0;
    
    historial.forEach(r => {
      const fechaRegistro = new Date(r.fecha);
      if (fechaRegistro >= inicioSemana) {
        const match = r.duracion.match(/(\d+)h\s*(\d+)m/);
        if (match) {
          totalMinutos += parseInt(match[1]) * 60 + parseInt(match[2]);
        }
      }
    });

    const hrs = Math.floor(totalMinutos / 60);
    const mins = totalMinutos % 60;
    return `${hrs}h ${mins}m`;
  };

  // Agrupar historial por fecha
  const agruparPorFecha = () => {
    const grupos = {};
    historial.forEach(r => {
      if (!grupos[r.fecha]) {
        grupos[r.fecha] = [];
      }
      grupos[r.fecha].push(r);
    });
    return grupos;
  };

  const historialAgrupado = agruparPorFecha();
  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className="checkinout-contenedor">
      {/* Encabezado */}
      <div className="checkinout-encabezado">
        <h1><FaClock /> Registro de Tiempo</h1>
        <button className="boton-nuevo-registro" onClick={() => setMostrarFormulario(true)}>
          <FaPlus /> Nuevo Registro
        </button>
      </div>

      {/* Resumen */}
      <div className="resumen-tiempo">
        <div className="resumen-tarjeta azul">
          <FaClock className="resumen-icono" />
          <div>
            <h3>{calcularTiempoHoy()}</h3>
            <p>Tiempo hoy</p>
          </div>
        </div>
        <div className="resumen-tarjeta verde">
          <FaCheckCircle className="resumen-icono" />
          <div>
            <h3>{historial.filter(r => r.fecha === hoy).length}</h3>
            <p>Registros hoy</p>
          </div>
        </div>
        <div className="resumen-tarjeta naranja">
          <FaHistory className="resumen-icono" />
          <div>
            <h3>{calcularTiempoSemana()}</h3>
            <p>Esta semana</p>
          </div>
        </div>
        <div className="resumen-tarjeta morado">
          <FaTicketAlt className="resumen-icono" />
          <div>
            <h3>{ticketsAsignados.length}</h3>
            <p>Tickets asignados</p>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="historial-contenedor">
        <h2><FaHistory /> Historial de Registros</h2>
        
        {Object.keys(historialAgrupado).length === 0 ? (
          <p className="sin-registros">No hay registros de tiempo</p>
        ) : (
          Object.keys(historialAgrupado)
            .sort((a, b) => new Date(b) - new Date(a))
            .map(fecha => (
              <div key={fecha} className="grupo-fecha">
                <h3 className="fecha-titulo">
                  {fecha === hoy ? 'Hoy' : fecha}
                  <span className="fecha-total">
                    Total: {historialAgrupado[fecha].reduce((acc, r) => {
                      const match = r.duracion.match(/(\d+)h\s*(\d+)m/);
                      if (match) return acc + parseInt(match[1]) * 60 + parseInt(match[2]);
                      return acc;
                    }, 0) > 0 ? 
                      `${Math.floor(historialAgrupado[fecha].reduce((acc, r) => {
                        const match = r.duracion.match(/(\d+)h\s*(\d+)m/);
                        if (match) return acc + parseInt(match[1]) * 60 + parseInt(match[2]);
                        return acc;
                      }, 0) / 60)}h ${historialAgrupado[fecha].reduce((acc, r) => {
                        const match = r.duracion.match(/(\d+)h\s*(\d+)m/);
                        if (match) return acc + parseInt(match[1]) * 60 + parseInt(match[2]);
                        return acc;
                      }, 0) % 60}m` : '0h 0m'}
                  </span>
                </h3>
                
                <div className="lista-registros">
                  {historialAgrupado[fecha].map(registro => (
                    <div key={registro.id} className="registro-item">
                      <div className="registro-hora">
                        <span className="hora">{registro.horaInicio}</span>
                        <span className="separador">-</span>
                        <span className="hora">{registro.horaFin}</span>
                      </div>
                      
                      <div className="registro-info">
                        <div className="registro-ticket">
                          <span className="ticket-id">#{registro.ticketId}</span>
                          <span className="ticket-titulo">{registro.titulo}</span>
                        </div>
                        {registro.descripcion && (
                          <p className="registro-descripcion">{registro.descripcion}</p>
                        )}
                      </div>
                      
                      <div className="registro-duracion">
                        <span className="duracion-badge">{registro.duracion}</span>
                      </div>
                      
                      <button className="boton-eliminar" onClick={() => eliminarRegistro(registro.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Modal Formulario */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-encabezado">
              <h2><FaPlus /> Registrar Tiempo</h2>
              <button className="boton-cerrar" onClick={() => setMostrarFormulario(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={guardarRegistro} className="formulario-registro">
              <div className="campo-grupo">
                <label>Ticket *</label>
                <select
                  value={registro.ticketId}
                  onChange={(e) => setRegistro({...registro, ticketId: e.target.value})}
                  required
                >
                  <option value="">Seleccionar ticket</option>
                  {ticketsAsignados.map(ticket => (
                    <option key={ticket.id} value={ticket.id}>
                      #{ticket.id} - {ticket.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo-grupo">
                <label>Fecha *</label>
                <input
                  type="date"
                  value={registro.fecha}
                  onChange={(e) => setRegistro({...registro, fecha: e.target.value})}
                  required
                />
              </div>

              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Hora Inicio *</label>
                  <input
                    type="time"
                    value={registro.horaInicio}
                    onChange={(e) => setRegistro({...registro, horaInicio: e.target.value})}
                    required
                  />
                </div>

                <div className="campo-grupo">
                  <label>Hora Fin *</label>
                  <input
                    type="time"
                    value={registro.horaFin}
                    onChange={(e) => setRegistro({...registro, horaFin: e.target.value})}
                    required
                  />
                </div>
              </div>

              {registro.horaInicio && registro.horaFin && (
                <div className="duracion-preview">
                  <FaClock /> Duracion: <strong>{calcularDuracion(registro.horaInicio, registro.horaFin)}</strong>
                </div>
              )}

              <div className="campo-grupo">
                <label>Descripcion del trabajo realizado</label>
                <textarea
                  value={registro.descripcion}
                  onChange={(e) => setRegistro({...registro, descripcion: e.target.value})}
                  placeholder="Describa las actividades realizadas..."
                  rows="3"
                />
              </div>

              <div className="modal-acciones">
                <button type="button" className="boton-cancelar" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </button>
                <button type="submit" className="boton-guardar">
                  <FaCheckCircle /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default  CheckInOut;