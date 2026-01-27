import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaClock, FaCheckCircle, FaExclamationTriangle, FaUsers, FaSpinner } from 'react-icons/fa';
import { ticketService, usuarioService } from '../servicios/supabase';
import './Dashboard.css';

function Dashboard() {
  const [estadisticas, setEstadisticas] = useState({
    totalTickets: 0,
    ticketsAbiertos: 0,
    ticketsEnProgreso: 0,
    ticketsResueltos: 0,
    ticketsUrgentes: 0,
    totalAgentes: 0
  });
  const [ticketsRecientes, setTicketsRecientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar todos los tickets
      const tickets = await ticketService.obtenerTodos();
      
      // Calcular estadísticas
      const stats = {
        totalTickets: tickets.length,
        ticketsAbiertos: tickets.filter(t => t.estado === 'ABIERTO').length,
        ticketsEnProgreso: tickets.filter(t => t.estado === 'EN_PROGRESO').length,
        ticketsResueltos: tickets.filter(t => t.estado === 'RESUELTO' || t.estado === 'CERRADO').length,
        ticketsUrgentes: tickets.filter(t => t.prioridad === 'URGENTE' && t.estado !== 'CERRADO').length,
        totalAgentes: 0
      };

      // Cargar agentes
      const agentes = await usuarioService.obtenerAgentes();
      stats.totalAgentes = agentes?.length || 0;

      setEstadisticas(stats);
      setTicketsRecientes(tickets.slice(0, 5));

    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (cargando) {
    return (
      <div className="dashboard-cargando">
        <FaSpinner className="spin" /> Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {/* Tarjetas de estadísticas */}
      <div className="dashboard-cards">
        <div className="dashboard-card azul">
          <div className="card-icono"><FaTicketAlt /></div>
          <div className="card-info">
            <h3>{estadisticas.totalTickets}</h3>
            <p>Total Tickets</p>
          </div>
        </div>

        <div className="dashboard-card naranja">
          <div className="card-icono"><FaClock /></div>
          <div className="card-info">
            <h3>{estadisticas.ticketsAbiertos}</h3>
            <p>Abiertos</p>
          </div>
        </div>

        <div className="dashboard-card morado">
          <div className="card-icono"><FaClock /></div>
          <div className="card-info">
            <h3>{estadisticas.ticketsEnProgreso}</h3>
            <p>En Progreso</p>
          </div>
        </div>

        <div className="dashboard-card verde">
          <div className="card-icono"><FaCheckCircle /></div>
          <div className="card-info">
            <h3>{estadisticas.ticketsResueltos}</h3>
            <p>Resueltos</p>
          </div>
        </div>

        <div className="dashboard-card rojo">
          <div className="card-icono"><FaExclamationTriangle /></div>
          <div className="card-info">
            <h3>{estadisticas.ticketsUrgentes}</h3>
            <p>Urgentes</p>
          </div>
        </div>

        <div className="dashboard-card gris">
          <div className="card-icono"><FaUsers /></div>
          <div className="card-info">
            <h3>{estadisticas.totalAgentes}</h3>
            <p>Agentes</p>
          </div>
        </div>
      </div>

      {/* Tickets recientes */}
      <div className="dashboard-seccion">
        <h2>Tickets Recientes</h2>
        {ticketsRecientes.length === 0 ? (
          <p className="sin-datos">No hay tickets registrados</p>
        ) : (
          <table className="tabla-tickets-recientes">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Asunto</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ticketsRecientes.map(ticket => (
                <tr key={ticket.id}>
                  <td className="folio">{ticket.folio}</td>
                  <td>{ticket.asunto}</td>
                  <td>{ticket.creador?.nombre} {ticket.creador?.apellido}</td>
                  <td>
                    <span className={`badge estado-${ticket.estado?.toLowerCase()}`}>
                      {ticket.estado?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge prioridad-${ticket.prioridad?.toLowerCase()}`}>
                      {ticket.prioridad}
                    </span>
                  </td>
                  <td>{formatearFecha(ticket.fechaCreacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;