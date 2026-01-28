import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaTicketAlt, FaComment, FaCheck, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import { notificacionService } from '../../servicios/supabase';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import './Notificaciones.css';

function Notificaciones({ onVerTicket }) {
  const { usuario } = useAutenticacion();
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Cargar notificaciones al montar
  useEffect(() => {
    if (usuario?.id) {
      cargarNotificaciones();
            
      // Suscribirse a nuevas notificaciones en tiempo real
      const subscription = notificacionService.suscribirCambios(usuario.id, (payload) => {
        if (payload.new) {
          // Agregar nueva notificación al inicio
          setNotificaciones(prev => [payload.new, ...prev]);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [usuario]);

  const cargarNotificaciones = async () => {
    try {
      setCargando(true);
      const data = await notificacionService.obtener(usuario.id);
      setNotificaciones(data || []);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  // Contar no leídas
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  // Marcar como leída
  const marcarLeida = async (id) => {
    try {
      await notificacionService.marcarLeida(id);
      setNotificaciones(notificaciones.map(n => 
        n.id === id ? { ...n, leida: true } : n
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Marcar todas como leídas
  const marcarTodasLeidas = async () => {
    try {
      await notificacionService.marcarTodasLeidas(usuario.id);
      setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Eliminar notificación
  const eliminarNotificacion = async (id) => {
    try {
      await notificacionService.eliminar(id);
      setNotificaciones(notificaciones.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Limpiar todas
  const limpiarTodas = async () => {
    try {
      await notificacionService.eliminarTodas(usuario.id);
      setNotificaciones([]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Ver ticket desde notificación
  const handleVerTicket = (notif) => {
    marcarLeida(notif.id);
    setMostrarPanel(false);
    if (onVerTicket && notif.enlace) {
      // Extraer el ID del ticket del enlace
      const ticketId = notif.enlace.split('/').pop();
      onVerTicket(ticketId);
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const notifFecha = new Date(fecha);
    const diffMs = ahora - notifFecha;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;
    return notifFecha.toLocaleDateString();
  };

  // Obtener icono según tipo
  const getIcono = (tipo) => {
    switch (tipo) {
      case 'TICKET_NUEVO':
        return <FaTicketAlt className="notif-icono nuevo" />;
      case 'TICKET_ASIGNADO':
        return <FaTicketAlt className="notif-icono asignado" />;
      case 'COMENTARIO_NUEVO':
        return <FaComment className="notif-icono respuesta" />;
      case 'EVENTO_NUEVO':
      case 'EVENTO_RECORDATORIO':
        return <FaCalendarAlt className="notif-icono evento" />;
      default:
        return <FaBell className="notif-icono" />;
    }
  };

  return (
    <div className="notificaciones-contenedor">
      <button 
        className={`boton-campana ${noLeidas > 0 ? 'tiene-notif' : ''}`}
        onClick={() => setMostrarPanel(!mostrarPanel)}
      >
        <FaBell />
        {noLeidas > 0 && (
          <span className="contador-notif">{noLeidas > 99 ? '99+' : noLeidas}</span>
        )}
      </button>

      {mostrarPanel && (
        <>
          <div className="overlay-notif" onClick={() => setMostrarPanel(false)}></div>
          <div className="panel-notificaciones">
            <div className="panel-header">
              <h3>Notificaciones</h3>
              <div className="panel-acciones">
                {noLeidas > 0 && (
                  <button onClick={marcarTodasLeidas} title="Marcar todas como leídas">
                    <FaCheck />
                  </button>
                )}
                {notificaciones.length > 0 && (
                  <button onClick={limpiarTodas} title="Limpiar todas">
                    <FaTrash />
                  </button>
                )}
                <button onClick={() => setMostrarPanel(false)}>
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="panel-lista">
              {cargando ? (
                <div className="sin-notificaciones">
                  <p>Cargando...</p>
                </div>
              ) : notificaciones.length === 0 ? (
                <div className="sin-notificaciones">
                  <FaBell className="icono-vacio" />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                notificaciones.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notificacion-item ${!notif.leida ? 'no-leida' : ''}`}
                    onClick={() => handleVerTicket(notif)}
                  >
                    {getIcono(notif.tipo)}
                    <div className="notif-contenido">
                      <p className="notif-titulo">{notif.titulo}</p>
                      <p className="notif-mensaje">{notif.mensaje}</p>
                      <span className="notif-fecha">{formatearFecha(notif.fechaCreacion)}</span>
                    </div>
                    <button 
                      className="btn-eliminar-notif"
                      onClick={(e) => { e.stopPropagation(); eliminarNotificacion(notif.id); }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Notificaciones;