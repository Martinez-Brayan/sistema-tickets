import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaCalendarAlt, FaMapMarkerAlt,FaVideo,FaUser,FaClock } from 'react-icons/fa';
import './Calendario.css';

function Calendario() {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [agenteSeleccionado, setAgenteSeleccionado] = useState('todos');
  
  const [eventos, setEventos] = useState([
    { id: 1, titulo: '', agente: ' ', agenteId: '', tipo: '', fecha: '', horaInicio: '', horaFin: '', ubicacion: '' },
    { id: 2, titulo: '', agente: ' ', agenteId: '', tipo: '', fecha: '', horaInicio: '', horaFin: '', ubicacion: '' },
    { id: 3, titulo: '', agente: ' ', agenteId: '', tipo: '', fecha: '', horaInicio: '', horaFin: '', ubicacion: '' },
    { id: 4, titulo: '', agente: '', agenteId: '', tipo: '', fecha: '', horaInicio: '', horaFin: '', ubicacion: '' },
    { id: 5, titulo: '', agente: ' ', agenteId: '', tipo: 'campo', fecha: '', horaInicio: '', horaFin: '', ubicacion: '' }
  ]);

  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: '', agenteId: '', tipo: 'reunion', fecha: '', horaInicio: '', horaFin: '', ubicacion: ''
  });

  const agentes = [
    { id: 2, nombre: ' ' },
    { id: 3, nombre: '' }
  ];

  const mesAnterior = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1));
  };

  const mesSiguiente = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1));
  };

  const obtenerDiasDelMes = () => {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicio = primerDia.getDay();
    const dias = [];
    
    const mesAnteriorUltimoDia = new Date(year, month, 0).getDate();
    for (let i = diaInicio - 1; i >= 0; i--) {
      dias.push({ dia: mesAnteriorUltimoDia - i, mesActual: false, fecha: new Date(year, month - 1, mesAnteriorUltimoDia - i) });
    }

    for (let i = 1; i <= diasEnMes; i++) {
      dias.push({ dia: i, mesActual: true, fecha: new Date(year, month, i) });
    }

    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push({ dia: i, mesActual: false, fecha: new Date(year, month + 1, i) });
    }

    return dias;
  };

  const obtenerEventosDelDia = (fecha) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return eventos.filter(evento => {
      const coincideFecha = evento.fecha === fechaStr;
      const coincideAgente = agenteSeleccionado === 'todos' || evento.agenteId.toString() === agenteSeleccionado;
      return coincideFecha && coincideAgente;
    });
  };

  const formatearMesAnio = () => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;
  };

  const esHoy = (fecha) => {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
  };

  const guardarEvento = (e) => {
    e.preventDefault();
    if (!nuevoEvento.titulo || !nuevoEvento.agenteId || !nuevoEvento.fecha) {
      alert('Complete los campos obligatorios');
      return;
    }
    const agenteInfo = agentes.find(a => a.id.toString() === nuevoEvento.agenteId);
    const evento = { ...nuevoEvento, id: Date.now(), agente: agenteInfo?.nombre || '', agenteId: parseInt(nuevoEvento.agenteId) };
    setEventos([...eventos, evento]);
    setMostrarFormulario(false);
    setNuevoEvento({ titulo: '', agenteId: '', tipo: 'reunion', fecha: '', horaInicio: '', horaFin: '', ubicacion: '' });
  };

  const eliminarEvento = (id) => {
    if (window.confirm('Eliminar este evento?')) {
      setEventos(eventos.filter(e => e.id !== id));
    }
  };

  return (
    <div className="calendario-contenedor">
      <div className="calendario-encabezado">
        <h1>Calendario de Agentes</h1>
        <button className="boton-nuevo-evento" onClick={() => setMostrarFormulario(true)}>
          <FaPlus /> Nuevo Evento
        </button>
      </div>

      <div className="calendario-controles">
        <div className="navegacion-fecha">
          <button onClick={mesAnterior}><FaChevronLeft /></button>
          <h2>{formatearMesAnio()}</h2>
          <button onClick={mesSiguiente}><FaChevronRight /></button>
        </div>

        <div className="filtro-agente">
          <label>Agente:</label>
          <select value={agenteSeleccionado} onChange={(e) => setAgenteSeleccionado(e.target.value)}>
            <option value="todos">Todos</option>
            {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="calendario-grid">
        <div className="dias-semana">
          {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(dia => (
            <div key={dia} className="dia-semana">{dia}</div>
          ))}
        </div>

        <div className="dias-mes">
          {obtenerDiasDelMes().map((dia, index) => {
            const eventosDelDia = obtenerEventosDelDia(dia.fecha);
            return (
              <div key={index} className={`dia-celda ${!dia.mesActual ? 'otro-mes' : ''} ${esHoy(dia.fecha) ? 'hoy' : ''}`}>
                <span className="numero-dia">{dia.dia}</span>
                <div className="eventos-dia">
                  {eventosDelDia.slice(0, 2).map(evento => (
                    <div key={evento.id} className={`evento-mini ${evento.tipo}`} onClick={() => eliminarEvento(evento.id)} title={evento.titulo}>
                      {evento.tipo === 'campo' ? <FaMapMarkerAlt /> : <FaVideo />}
                      <span>{evento.titulo.substring(0, 12)}...</span>
                    </div>
                  ))}
                  {eventosDelDia.length > 2 && <div className="mas-eventos">+{eventosDelDia.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="proximos-eventos">
        <h3>Proximos Eventos</h3>
        <div className="lista-eventos">
          {eventos.filter(e => new Date(e.fecha) >= new Date()).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).slice(0, 5).map(evento => (
            <div key={evento.id} className={`evento-card ${evento.tipo}`}>
              <div className="evento-fecha-card">
                <span className="evento-dia">{new Date(evento.fecha).getDate()}</span>
                <span className="evento-mes">{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][new Date(evento.fecha).getMonth()]}</span>
              </div>
              <div className="evento-info">
                <h4>{evento.titulo}</h4>
                <p><FaUser /> {evento.agente}</p>
                <p><FaClock /> {evento.horaInicio} - {evento.horaFin}</p>
                <p><FaMapMarkerAlt /> {evento.ubicacion}</p>
              </div>
              <span className={`evento-badge ${evento.tipo}`}>{evento.tipo === 'campo' ? 'Campo' : 'Reunion'}</span>
            </div>
          ))}
        </div>
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-encabezado">
              <h2>Nuevo Evento</h2>
              <button className="boton-cerrar" onClick={() => setMostrarFormulario(false)}><FaTimes /></button>
            </div>
            <form onSubmit={guardarEvento} className="formulario-evento">
              <div className="campo-grupo">
                <label>Titulo *</label>
                <input type="text" value={nuevoEvento.titulo} onChange={(e) => setNuevoEvento({...nuevoEvento, titulo: e.target.value})} required />
              </div>
              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Agente *</label>
                  <select value={nuevoEvento.agenteId} onChange={(e) => setNuevoEvento({...nuevoEvento, agenteId: e.target.value})} required>
                    <option value="">Seleccionar</option>
                    {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>
                <div className="campo-grupo">
                  <label>Tipo</label>
                  <select value={nuevoEvento.tipo} onChange={(e) => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}>
                    <option value="reunion">Reunion</option>
                    <option value="campo">Salida a Campo</option>
                  </select>
                </div>
              </div>
              <div className="campo-grupo">
                <label>Fecha *</label>
                <input type="date" value={nuevoEvento.fecha} onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})} required />
              </div>
              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Hora Inicio</label>
                  <input type="time" value={nuevoEvento.horaInicio} onChange={(e) => setNuevoEvento({...nuevoEvento, horaInicio: e.target.value})} />
                </div>
                <div className="campo-grupo">
                  <label>Hora Fin</label>
                  <input type="time" value={nuevoEvento.horaFin} onChange={(e) => setNuevoEvento({...nuevoEvento, horaFin: e.target.value})} />
                </div>
              </div>
              <div className="campo-grupo">
                <label>Ubicacion</label>
                <input type="text" value={nuevoEvento.ubicacion} onChange={(e) => setNuevoEvento({...nuevoEvento, ubicacion: e.target.value})} />
              </div>
              <div className="modal-acciones">
                <button type="button" className="boton-cancelar" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                <button type="submit" className="boton-guardar">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendario;