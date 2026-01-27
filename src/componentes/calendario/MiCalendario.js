import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaClock, FaVideo, FaCalendarAlt, FaSpinner, FaBuilding } from 'react-icons/fa';
import { eventoService } from '../../servicios/supabase';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import './MiCalendario.css';

function MiCalendario() {
  const { usuario } = useAutenticacion();
  const [fechaActual, setFechaActual] = useState(new Date());
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEventos();
  }, [fechaActual, usuario]);

  useEffect(() => {
    if (usuario?.id) {
      const subscription = eventoService.suscribirCambios(usuario.id, () => {
        cargarEventos();
      });
      return () => subscription.unsubscribe();
    }
  }, [usuario]);

  const cargarEventos = async () => {
    if (!usuario?.id) return;
    try {
      setCargando(true);
      const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
      const finMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0, 23, 59, 59);
      
      const eventosData = await eventoService.obtenerPorRango(
        inicioMes.toISOString(),
        finMes.toISOString(),
        usuario.id
      );
      setEventos(eventosData || []);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setCargando(false);
    }
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
    return eventos.filter(evento => new Date(evento.fechaInicio).toDateString() === fecha.toDateString());
  };

  const formatearMesAnio = () => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;
  };

  const esHoy = (fecha) => {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Cálculos de resumen
  const eventosHoy = eventos.filter(e => new Date(e.fechaInicio).toDateString() === new Date().toDateString());
  const proximosEventos = eventos
    .filter(e => new Date(e.fechaInicio) >= new Date())
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
    .slice(0, 5);

  if (cargando) {
    return (
      <div className="contenedor-calendario-agente">
        <div className="cargando">
          <FaSpinner className="spin" /> Cargando calendario...
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor-calendario-agente">
      {/* Resumen Superior */}
      <div className="resumen-dia">
        <div className="resumen-tarjeta hoy">
          <FaCalendarAlt className="resumen-icono" />
          <div className="resumen-info">
            <h3>{eventosHoy.length}</h3>
            <p>Eventos hoy</p>
          </div>
        </div>
        <div className="resumen-tarjeta campo">
          <FaMapMarkerAlt className="resumen-icono" />
          <div className="resumen-info">
            <h3>{eventos.filter(e => e.tipo === 'CAMPO').length}</h3>
            <p>Salidas a campo</p>
          </div>
        </div>
        <div className="resumen-tarjeta reunion">
          <FaVideo className="resumen-icono" />
          <div className="resumen-info">
            <h3>{eventos.filter(e => e.tipo === 'REUNION').length}</h3>
            <p>Reuniones</p>
          </div>
        </div>
        <div className="resumen-tarjeta atencion">
          <FaBuilding className="resumen-icono" />
          <div className="resumen-info">
            <h3>{eventos.filter(e => e.tipo === 'ATENCION').length}</h3>
            <p>Atención cliente</p>
          </div>
        </div>
      </div>

      <div className="calendario-contenido">
        <div className="calendario-principal">
          <div className="calendario-controles">
            <div className="navegacion-fecha">
              <button onClick={() => setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1))}><FaChevronLeft /></button>
              <h3>{formatearMesAnio()}</h3>
              <button onClick={() => setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1))}><FaChevronRight /></button>
            </div>
            <button className="boton-hoy" onClick={() => setFechaActual(new Date())}>Hoy</button>
          </div>

          <div className="calendario-grid">
            <div className="dias-semana">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
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
                      {eventosDelDia.slice(0, 3).map(evento => (
                        <div 
                          key={evento.id} 
                          className="evento-punto"
                          style={{ backgroundColor: evento.color || '#3498db' }}
                          title={evento.titulo}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lista Lateral */}
        <div className="proximos-eventos">
          <h3>Próximos Eventos</h3>
          <div className="lista-eventos">
            {proximosEventos.map(evento => (
              <div key={evento.id} className="evento-item" style={{ borderLeftColor: evento.color || '#3498db' }}>
                <div className="evento-fecha">
                  <span className="dia">{new Date(evento.fechaInicio).getDate()}</span>
                  <span className="mes">{new Date(evento.fechaInicio).toLocaleString('es-ES', { month: 'short' })}</span>
                </div>
                <div className="evento-detalle">
                  <h4>{evento.titulo}</h4>
                  <p><FaClock /> {formatearHora(evento.fechaInicio)}</p>
                  {evento.clienteNombre && <p><FaBuilding /> {evento.clienteNombre}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MiCalendario;