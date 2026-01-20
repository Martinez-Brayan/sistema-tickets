import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaClock, FaVideo, FaCalendarAlt } from 'react-icons/fa';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import './MiCalendario.css';

function MiCalendario() {
  const { usuario } = useAutenticacion();
  const [fechaActual, setFechaActual] = useState(new Date());
  
  // Eventos del agente (simulados - en produccion vendrian del servidor)
  const [eventos] = useState([
    { id: 1, titulo: 'Visita cliente', tipo: 'campo', fecha: '2026-01-20', horaInicio: '09:00', horaFin: '11:00', ubicacion: 'Oficinas', descripcion: 'Revision de equipos de red', agenteId: 2 },
    { id: 2, titulo: 'Mantenimiento preventivo', tipo: 'campo', fecha: '2026-01-22', horaInicio: '08:00', horaFin: '12:00', ubicacion: 'Data Center Principal', descripcion: 'Revision de servidores', agenteId: 2 },
    { id: 3, titulo: 'Instalacion de equipos', tipo: 'campo', fecha: '2026-01-25', horaInicio: '09:00', horaFin: '17:00', ubicacion: 'Panama', descripcion: 'Instalacion completa', agenteId: 2 },
    { id: 4, titulo: 'Reunion con equipo', tipo: 'reunion', fecha: '2026-01-21', horaInicio: '14:00', horaFin: '15:00', ubicacion: 'Sala Virtual Teams', descripcion: 'Planificacion semanal', agenteId: 2 },
    { id: 5, titulo: 'Capacitacion cliente', tipo: 'reunion', fecha: '2026-01-23', horaInicio: '10:00', horaFin: '12:00', ubicacion: 'Virtual', descripcion: 'Entrenamiento sistema nuevo', agenteId: 2 },
    { id: 6, titulo: 'Soporte remoto', tipo: 'reunion', fecha: '2026-01-27', horaInicio: '15:00', horaFin: '16:30', ubicacion: 'Virtual', descripcion: 'Atencion cliente VIP', agenteId: 2 },
  ]);

  // Filtrar solo eventos del agente actual
  const misEventos = eventos.filter(e => e.agenteId === usuario.id || e.agenteId === 2);

  const mesAnterior = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1));
  };

  const mesSiguiente = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1));
  };

  const irAHoy = () => {
    setFechaActual(new Date());
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
    return misEventos.filter(evento => evento.fecha === fechaStr);
  };

  const formatearMesAnio = () => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;
  };

  const esHoy = (fecha) => {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
  };

  // Obtener eventos de hoy
  const eventosHoy = misEventos.filter(e => {
    const hoy = new Date().toISOString().split('T')[0];
    return e.fecha === hoy;
  });

  // Obtener proximos eventos
  const proximosEventos = misEventos
    .filter(e => new Date(e.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 5);

  return (
    <div className="mi-calendario">
      {/* Resumen del dia */}
      <div className="resumen-dia">
        <div className="resumen-tarjeta hoy">
          <FaCalendarAlt className="resumen-icono" />
          <div className="resumen-info">
            <h3>Hoy</h3>
            <p>{eventosHoy.length} {eventosHoy.length === 1 ? 'evento' : 'eventos'} programados</p>
          </div>
        </div>
        <div className="resumen-tarjeta campo">
          <FaMapMarkerAlt className="resumen-icono" />
          <div className="resumen-info">
            <h3>{misEventos.filter(e => e.tipo === 'campo').length}</h3>
            <p>Salidas a campo</p>
          </div>
        </div>
        <div className="resumen-tarjeta reunion">
          <FaVideo className="resumen-icono" />
          <div className="resumen-info">
            <h3>{misEventos.filter(e => e.tipo === 'reunion').length}</h3>
            <p>Reuniones</p>
          </div>
        </div>
      </div>

      <div className="calendario-contenido">
        {/* Calendario */}
        <div className="calendario-principal">
          <div className="calendario-encabezado">
            <h2>Mi Calendario</h2>
          </div>

          <div className="calendario-controles">
            <div className="navegacion-fecha">
              <button onClick={mesAnterior}><FaChevronLeft /></button>
              <h3>{formatearMesAnio()}</h3>
              <button onClick={mesSiguiente}><FaChevronRight /></button>
            </div>
            <button className="boton-hoy" onClick={irAHoy}>Hoy</button>
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
                      {eventosDelDia.map(evento => (
                        <div key={evento.id} className={`evento-punto ${evento.tipo}`} title={evento.titulo}></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lista de proximos eventos */}
        <div className="proximos-eventos">
          <h3>Proximos Eventos</h3>
          <div className="lista-eventos">
            {proximosEventos.length === 0 ? (
              <p className="sin-eventos">No tienes eventos proximos</p>
            ) : (
              proximosEventos.map(evento => (
                <div key={evento.id} className={`evento-item ${evento.tipo}`}>
                  <div className="evento-fecha">
                    <span className="dia">{new Date(evento.fecha).getDate()}</span>
                    <span className="mes">{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][new Date(evento.fecha).getMonth()]}</span>
                  </div>
                  <div className="evento-detalle">
                    <h4>{evento.titulo}</h4>
                    <p><FaClock /> {evento.horaInicio} - {evento.horaFin}</p>
                    <p><FaMapMarkerAlt /> {evento.ubicacion}</p>
                  </div>
                  <span className={`tipo-badge ${evento.tipo}`}>
                    {evento.tipo === 'campo' ? 'Campo' : 'Reunion'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MiCalendario;