import React, { useState } from 'react';
import { FaBell, FaTimes, FaTicketAlt, FaComment, FaCheck, FaTrash } from 'react-icons/fa';
import './Notificaciones.css';

function Notificaciones({ onVerTicket }) {
  const [mostrarPanel, setMostrarPanel] = useState(false);
  
  // Notificaciones - vendrán de Supabase
  const [notificaciones, setNotificaciones] = useState([]);

  // Contar no leídas
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  // Marcar como leída
  const marcarLeida = (id) => {
    setNotificaciones(notificaciones.map(n => 
      n.id === id ? { ...n, leida: true } : n
    ));
  };

  // Marcar todas como leídas
  const marcarTodasLeidas = () => {
    setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
  };

  // Eliminar notificación
  const eliminarNotificacion = (id) => {
    setNotificaciones(notificaciones.filter(n => n.id !== id));
  };

  // Limpiar todas
  const limpiarTodas = () => {
    setNotificaciones([]);
  };

  // Ver ticket desde notificación
  const handleVerTicket = (notif) => {
    marcarLeida(notif.id);
    setMostrarPanel(false);
    if (onVerTicket) {
      onVerTicket(notif.ticketId);
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
      case 'nuevo-ticket':
        return <FaTicketAlt className="notif-icono nuevo" />;
      case 'respuesta':
        return <FaComment className="notif-icono respuesta" />;
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
              {notificaciones.length === 0 ? (
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
                      <span className="notif-fecha">{formatearFecha(notif.fecha)}</span>
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