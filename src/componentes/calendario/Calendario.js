import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaSpinner, FaMapMarkerAlt, FaUser, FaTrash, FaClock } from 'react-icons/fa';
import { eventoService, usuarioService } from '../../servicios/supabase';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import './Calendario.css';

function Calendario({ soloMisEventos = false }) {
  const { usuario } = useAutenticacion();
  const [fechaActual, setFechaActual] = useState(new Date());
  const [eventos, setEventos] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'REUNION',
    fechaInicio: '',
    fechaFin: '',
    todoElDia: false,
    agenteId: '',
    clienteNombre: '',
    ubicacion: '',
    color: '#3498db'
  });

  const tiposEvento = [
    { value: 'REUNION', label: 'Reunión', color: '#3498db' },
    { value: 'CAMPO', label: 'Salida a Campo', color: '#27ae60' },
    { value: 'ATENCION', label: 'Atención al Cliente', color: '#9b59b6' },
    { value: 'OTRO', label: 'Otro', color: '#95a5a6' }
  ];

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, [fechaActual, soloMisEventos]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (soloMisEventos && usuario?.id) {
      const subscription = eventoService.suscribirCambios(usuario.id, () => {
        cargarDatos();
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [soloMisEventos, usuario]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
      const finMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0, 23, 59, 59);
      
      let eventosData;
      if (soloMisEventos) {
        eventosData = await eventoService.obtenerPorRango(
          inicioMes.toISOString(),
          finMes.toISOString(),
          usuario.id
        );
      } else {
        eventosData = await eventoService.obtenerPorRango(
          inicioMes.toISOString(),
          finMes.toISOString()
        );
        
        const agentesData = await usuarioService.obtenerAgentes();
        setAgentes(agentesData || []);
      }
      
      setEventos(eventosData || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const mesAnterior = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1));
  };

  const mesSiguiente = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1));
  };

  const obtenerDiasDelMes = () => {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicio = primerDia.getDay();

    const dias = [];
    
    for (let i = 0; i < diaInicio; i++) {
      const dia = new Date(año, mes, -diaInicio + i + 1);
      dias.push({ fecha: dia, esOtroMes: true });
    }

    for (let i = 1; i <= diasEnMes; i++) {
      dias.push({ fecha: new Date(año, mes, i), esOtroMes: false });
    }

    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push({ fecha: new Date(año, mes + 1, i), esOtroMes: true });
    }

    return dias;
  };

  const obtenerEventosDelDia = (fecha) => {
    return eventos.filter(evento => {
      const fechaEvento = new Date(evento.fechaInicio);
      return fechaEvento.toDateString() === fecha.toDateString();
    });
  };

  const abrirModalNuevo = (fecha = null) => {
    const fechaBase = fecha || new Date();
    const fechaStr = new Date(fechaBase.getTime() - fechaBase.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    setNuevoEvento({
      titulo: '',
      descripcion: '',
      tipo: 'REUNION',
      fechaInicio: fechaStr,
      fechaFin: '',
      todoElDia: false,
      agenteId: soloMisEventos ? usuario.id : '',
      clienteNombre: '',
      ubicacion: '',
      color: '#3498db'
    });
    setEventoSeleccionado(null);
    setMostrarModal(true);
  };

  const abrirModalEvento = (evento) => {
    const fechaInicio = new Date(evento.fechaInicio);
    const fechaInicioStr = new Date(fechaInicio.getTime() - fechaInicio.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    
    let fechaFinStr = '';
    if (evento.fechaFin) {
      const fechaFin = new Date(evento.fechaFin);
      fechaFinStr = new Date(fechaFin.getTime() - fechaFin.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }

    setNuevoEvento({
      titulo: evento.titulo,
      descripcion: evento.descripcion || '',
      tipo: evento.tipo,
      fechaInicio: fechaInicioStr,
      fechaFin: fechaFinStr,
      todoElDia: evento.todoElDia,
      agenteId: evento.agenteId,
      clienteNombre: evento.clienteNombre || '',
      ubicacion: evento.ubicacion || '',
      color: evento.color || '#3498db'
    });
    setEventoSeleccionado(evento);
    setMostrarModal(true);
  };

  const guardarEvento = async () => {
    if (!nuevoEvento.titulo.trim()) {
      alert('Ingrese un título');
      return;
    }
    if (!nuevoEvento.fechaInicio) {
      alert('Seleccione una fecha');
      return;
    }
    if (!soloMisEventos && !nuevoEvento.agenteId) {
      alert('Seleccione un agente');
      return;
    }

    setGuardando(true);

    try {
      const datosEvento = {
        ...nuevoEvento,
        agenteId: soloMisEventos ? usuario.id : nuevoEvento.agenteId
      };

      if (eventoSeleccionado) {
        await eventoService.actualizar(eventoSeleccionado.id, datosEvento);
      } else {
        await eventoService.crear(datosEvento, usuario.id);
      }

      setMostrarModal(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error al guardar evento:', error);
      alert('Error al guardar el evento: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarEvento = async () => {
    if (!eventoSeleccionado) return;
    if (!window.confirm('¿Eliminar este evento?')) return;

    try {
      await eventoService.eliminar(eventoSeleccionado.id);
      setMostrarModal(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el evento');
    }
  };

  const cambiarTipo = (tipo) => {
    const tipoInfo = tiposEvento.find(t => t.value === tipo);
    setNuevoEvento({
      ...nuevoEvento,
      tipo,
      color: tipoInfo?.color || '#3498db'
    });
  };

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const nombreMes = fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const hoy = new Date();

  return (
    <div className="calendario-container">
      <div className="calendario-header">
        <h1>{soloMisEventos ? 'Mi Calendario' : 'Calendario de Agentes'}</h1>
        <button className="btn-nuevo-evento" onClick={() => abrirModalNuevo()}>
          <FaPlus /> Nuevo Evento
        </button>
      </div>

      <div className="calendario-navegacion">
        <button onClick={mesAnterior}><FaChevronLeft /></button>
        <span className="mes-actual">{nombreMes}</span>
        <button onClick={mesSiguiente}><FaChevronRight /></button>
      </div>

      {cargando ? (
        <div className="cargando-calendario">
          <FaSpinner className="spin" /> Cargando...
        </div>
      ) : (
        <div className="calendario-grid">
          {diasSemana.map(dia => (
            <div key={dia} className="dia-semana">{dia}</div>
          ))}

          {obtenerDiasDelMes().map((dia, index) => {
            const eventosDelDia = obtenerEventosDelDia(dia.fecha);
            const esHoy = dia.fecha.toDateString() === hoy.toDateString();

            return (
              <div 
                key={index} 
                className={`dia-celda ${dia.esOtroMes ? 'otro-mes' : ''} ${esHoy ? 'hoy' : ''}`}
                onClick={() => !dia.esOtroMes && abrirModalNuevo(dia.fecha)}
              >
                <span className="dia-numero">{dia.fecha.getDate()}</span>
                <div className="eventos-dia">
                  {eventosDelDia.slice(0, 3).map(evento => (
                    <div 
                      key={evento.id} 
                      className="evento-item"
                      style={{ backgroundColor: evento.color || '#3498db' }}
                      onClick={(e) => { e.stopPropagation(); abrirModalEvento(evento); }}
                      title={`${evento.titulo} - ${formatearHora(evento.fechaInicio)}`}
                    >
                      <FaClock className="evento-icono" />
                      {evento.titulo}
                    </div>
                  ))}
                  {eventosDelDia.length > 3 && (
                    <span className="mas-eventos">+{eventosDelDia.length - 3} más</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-evento">
            <div className="modal-header">
              <h3>{eventoSeleccionado ? 'Editar Evento' : 'Nuevo Evento'}</h3>
              <button onClick={() => setMostrarModal(false)}><FaTimes /></button>
            </div>

            <div className="modal-body">
              <div className="campo-grupo">
                <label>Título *</label>
                <input 
                  type="text"
                  value={nuevoEvento.titulo}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, titulo: e.target.value})}
                  placeholder="Título del evento"
                />
              </div>

              <div className="campo-grupo">
                <label>Tipo *</label>
                <select value={nuevoEvento.tipo} onChange={(e) => cambiarTipo(e.target.value)}>
                  {tiposEvento.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              {!soloMisEventos && (
                <div className="campo-grupo">
                  <label><FaUser /> Agente *</label>
                  <select 
                    value={nuevoEvento.agenteId}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, agenteId: e.target.value})}
                  >
                    <option value="">Seleccionar agente...</option>
                    {agentes.map(agente => (
                      <option key={agente.id} value={agente.id}>
                        {agente.nombre} {agente.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Fecha y hora inicio *</label>
                  <input 
                    type="datetime-local"
                    value={nuevoEvento.fechaInicio}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, fechaInicio: e.target.value})}
                  />
                </div>
                <div className="campo-grupo">
                  <label>Fecha y hora fin</label>
                  <input 
                    type="datetime-local"
                    value={nuevoEvento.fechaFin}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, fechaFin: e.target.value})}
                  />
                </div>
              </div>

              {(nuevoEvento.tipo === 'CAMPO' || nuevoEvento.tipo === 'ATENCION') && (
                <>
                  <div className="campo-grupo">
                    <label>Cliente</label>
                    <input 
                      type="text"
                      value={nuevoEvento.clienteNombre}
                      onChange={(e) => setNuevoEvento({...nuevoEvento, clienteNombre: e.target.value})}
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  <div className="campo-grupo">
                    <label><FaMapMarkerAlt /> Ubicación</label>
                    <input 
                      type="text"
                      value={nuevoEvento.ubicacion}
                      onChange={(e) => setNuevoEvento({...nuevoEvento, ubicacion: e.target.value})}
                      placeholder="Dirección o ubicación"
                    />
                  </div>
                </>
              )}

              <div className="campo-grupo">
                <label>Descripción</label>
                <textarea 
                  value={nuevoEvento.descripcion}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, descripcion: e.target.value})}
                  placeholder="Detalles adicionales..."
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              {eventoSeleccionado && !soloMisEventos && (
                <button className="btn-eliminar" onClick={eliminarEvento}>
                  <FaTrash /> Eliminar
                </button>
              )}
              <button className="btn-cancelar" onClick={() => setMostrarModal(false)}>
                Cancelar
              </button>
              <button className="btn-guardar" onClick={guardarEvento} disabled={guardando}>
                {guardando ? <FaSpinner className="spin" /> : null}
                {guardando ? 'Guardando...' : (eventoSeleccionado ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendario;