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
    return eventos.filter(evento => {
      const fechaEvento = new Date(evento.fechaInicio);
      return fechaEvento.toDateString() === fecha.toDateString();
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

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const eventosHoy = eventos.filter(e => {
    const fechaEvento = new Date(e.fechaInicio);
    const hoy = new Date();
    return fechaEvento.toDateString() === hoy.toDateString();
  });

  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);
  
  const proximosEventos = eventos
    .filter(e => new Date(e.fechaInicio) >= hoyInicio)
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
    .slice(0, 5);

  const eventosCampo = eventos.filter(e => e.tipo === 'CAMPO').length;
  const eventosReunion = eventos.filter(e => e.tipo === 'REUNION').length;
  const eventosAtencion = eventos.filter(e => e.tipo === 'ATENCION').length;

  if (cargando) {
    return (
      <div className="mc-contenedor">
        <div className="mc-cargando">
          <FaSpinner className="mc-spin" /> Cargando calendario...
        </div>
      </div>
    );
  }

  return (
    <div className="mc-contenedor">
      {/* Tarjetas resumen */}
      <div className="mc-resumen">
        <div className="mc-tarjeta mc-tarjeta-hoy">
          <FaCalendarAlt className="mc-tarjeta-icono" />
          <div className="mc-tarjeta-info">
            <h3>{eventosHoy.length}</h3>
            <p>Eventos hoy</p>
          </div>
        </div>
        <div className="mc-tarjeta mc-tarjeta-campo">
          <FaMapMarkerAlt className="mc-tarjeta-icono" />
          <div className="mc-tarjeta-info">
            <h3>{eventosCampo}</h3>
            <p>Salidas a campo</p>
          </div>
        </div>
        <div className="mc-tarjeta mc-tarjeta-reunion">
          <FaVideo className="mc-tarjeta-icono" />
          <div className="mc-tarjeta-info">
            <h3>{eventosReunion}</h3>
            <p>Reuniones</p>
          </div>
        </div>
        <div className="mc-tarjeta mc-tarjeta-atencion">
          <FaBuilding className="mc-tarjeta-icono" />
          <div className="mc-tarjeta-info">
            <h3>{eventosAtencion}</h3>
            <p>Atención cliente</p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mc-contenido">
        {/* Calendario */}
        <div className="mc-calendario">
          <div className="mc-calendario-header">
            <h2>Mi Calendario</h2>
          </div>

          <div className="mc-calendario-nav">
            <div className="mc-nav-fechas">
              <button onClick={mesAnterior}><FaChevronLeft /></button>
              <h3>{formatearMesAnio()}</h3>
              <button onClick={mesSiguiente}><FaChevronRight /></button>
            </div>
            <button className="mc-btn-hoy" onClick={irAHoy}>Hoy</button>
          </div>

          <div className="mc-grid">
            <div className="mc-dias-semana">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                <div key={dia} className="mc-dia-nombre">{dia}</div>
              ))}
            </div>

            <div className="mc-dias-mes">
              {obtenerDiasDelMes().map((dia, index) => {
                const eventosDelDia = obtenerEventosDelDia(dia.fecha);
                return (
                  <div 
                    key={index} 
                    className={`mc-dia ${!dia.mesActual ? 'mc-dia-otro' : ''} ${esHoy(dia.fecha) ? 'mc-dia-hoy' : ''}`}
                  >
                    <span className="mc-dia-num">{dia.dia}</span>
                    <div className="mc-dia-eventos">
                      {eventosDelDia.slice(0, 3).map(evento => (
                        <div 
                          key={evento.id} 
                          className="mc-evento-punto"
                          style={{ backgroundColor: evento.color || '#3498db' }}
                          title={`${evento.titulo} - ${formatearHora(evento.fechaInicio)}`}
                        />
                      ))}
                      {eventosDelDia.length > 3 && (
                        <span className="mc-mas">+{eventosDelDia.length - 3}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Próximos eventos */}
        <div className="mc-proximos">
          <h3>Próximos Eventos</h3>
          <div className="mc-lista-eventos">
            {proximosEventos.length === 0 ? (
              <p className="mc-sin-eventos">No tienes eventos próximos</p>
            ) : (
              proximosEventos.map(evento => (
                <div key={evento.id} className="mc-evento-item" style={{ borderLeftColor: evento.color || '#3498db' }}>
                  <div className="mc-evento-fecha">
                    <span className="mc-evento-dia">{new Date(evento.fechaInicio).getDate()}</span>
                    <span className="mc-evento-mes">
                      {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][new Date(evento.fechaInicio).getMonth()]}
                    </span>
                  </div>
                  <div className="mc-evento-detalle">
                    <h4>{evento.titulo}</h4>
                    <p><FaClock /> {formatearHora(evento.fechaInicio)}</p>
                    {evento.ubicacion && <p><FaMapMarkerAlt /> {evento.ubicacion}</p>}
                    {evento.clienteNombre && <p><FaBuilding /> {evento.clienteNombre}</p>}
                  </div>
                  <span className="mc-evento-tipo" style={{ backgroundColor: evento.color || '#3498db' }}>
                    {evento.tipo}
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