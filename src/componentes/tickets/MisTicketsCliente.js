import React, { useState, useEffect } from 'react';
import { FaEye, FaSpinner, FaTicketAlt } from 'react-icons/fa';
import { ticketService } from '../../servicios/supabase';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import DetalleTicket from './DetalleTicket';
import './MisTicketsCliente.css';

function MisTicketsCliente() {
  const { usuario } = useAutenticacion();
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [vistaDetalle, setVistaDetalle] = useState(false);

  // Cargar tickets del cliente
  useEffect(() => {
    cargarTickets();
  }, [usuario]);

  const cargarTickets = async () => {
    try {
      setCargando(true);
      const data = await ticketService.obtenerTodos({ creadorId: usuario.id });
      setTickets(data || []);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar tickets
  const ticketsFiltrados = tickets.filter(ticket => {
    if (filtroEstado === 'todos') return true;
    if (filtroEstado === 'activos') return ['ABIERTO', 'EN_PROCESO', 'EN_ESPERA'].includes(ticket.estado);
    if (filtroEstado === 'cerrados') return ['RESUELTO', 'CERRADO'].includes(ticket.estado);
    return ticket.estado === filtroEstado;
  });

  // Ver detalle del ticket
  const verTicket = async (ticket) => {
    try {
      const ticketCompleto = await ticketService.obtenerPorId(ticket.id);
      setTicketSeleccionado(ticketCompleto);
      setVistaDetalle(true);
    } catch (error) {
      console.error('Error al cargar ticket:', error);
    }
  };

  // Volver a la lista
  const volverALista = () => {
    setVistaDetalle(false);
    setTicketSeleccionado(null);
    cargarTickets(); // Recargar por si hubo cambios
  };

  // Formatear fecha
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

  // Obtener clase de estado
  const getClaseEstado = (estado) => {
    const clases = {
      'ABIERTO': 'estado-abierto',
      'EN_PROCESO': 'estado-proceso',
      'EN_ESPERA': 'estado-espera',
      'RESUELTO': 'estado-resuelto',
      'CERRADO': 'estado-cerrado'
    };
    return clases[estado] || '';
  };

  // Obtener clase de prioridad
  const getClasePrioridad = (prioridad) => {
    const clases = {
      'BAJA': 'prioridad-baja',
      'MEDIA': 'prioridad-media',
      'ALTA': 'prioridad-alta',
      'URGENTE': 'prioridad-urgente'
    };
    return clases[prioridad] || '';
  };

  // Si está viendo detalle
  if (vistaDetalle && ticketSeleccionado) {
    return (
      <DetalleTicket 
        ticket={ticketSeleccionado}
        onVolver={volverALista}
        esCliente={true}
      />
    );
  }

  return (
    <div className="mis-tickets-cliente">
      <div className="tickets-header">
        <h1><FaTicketAlt /> Mis Tickets</h1>
        <select 
          value={filtroEstado} 
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="filtro-select"
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="cerrados">Cerrados</option>
          <option value="ABIERTO">Abierto</option>
          <option value="EN_PROCESO">En Proceso</option>
          <option value="EN_ESPERA">En Espera</option>
          <option value="RESUELTO">Resuelto</option>
          <option value="CERRADO">Cerrado</option>
        </select>
      </div>

      {cargando ? (
        <div className="cargando">
          <FaSpinner className="spin" /> Cargando tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="sin-tickets">
          <FaTicketAlt className="icono-vacio" />
          <p>No tienes tickets registrados</p>
          <p className="subtexto">Crea una nueva solicitud para comenzar</p>
        </div>
      ) : ticketsFiltrados.length === 0 ? (
        <div className="sin-tickets">
          <p>No hay tickets con el filtro seleccionado</p>
        </div>
      ) : (
        <div className="tickets-lista">
          {ticketsFiltrados.map(ticket => (
            <div key={ticket.id} className="ticket-card" onClick={() => verTicket(ticket)}>
              <div className="ticket-card-header">
                <span className="ticket-folio">{ticket.folio}</span>
                <span className={`ticket-estado ${getClaseEstado(ticket.estado)}`}>
                  {ticket.estado.replace('_', ' ')}
                </span>
              </div>
              <h3 className="ticket-asunto">{ticket.asunto}</h3>
              <div className="ticket-card-info">
                <span className={`ticket-prioridad ${getClasePrioridad(ticket.prioridad)}`}>
                  {ticket.prioridad}
                </span>
                <span className="ticket-fecha">{formatearFecha(ticket.fechaCreacion)}</span>
              </div>
              <div className="ticket-card-footer">
                <span className="ticket-agente">
                  Agente: {ticket.agente ? `${ticket.agente.nombre} ${ticket.agente.apellido}` : 'Sin asignar'}
                </span>
                <button className="btn-ver" onClick={(e) => { e.stopPropagation(); verTicket(ticket); }}>
                  <FaEye /> Ver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MisTicketsCliente;