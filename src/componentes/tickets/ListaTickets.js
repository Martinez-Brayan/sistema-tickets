import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaTrash, FaTicketAlt, FaSpinner, FaUserPlus } from 'react-icons/fa';
import { ticketService, usuarioService } from '../../servicios/supabase';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import DetalleTicket from './DetalleTicket';
import './ListaTickets.css';

function ListaTickets({ titulo = "Todos los Tickets", esAgente = false }) {
  const { usuario } = useAutenticacion();
  const [tickets, setTickets] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [vistaDetalle, setVistaDetalle] = useState(false);
  const [mostrarModalAsignar, setMostrarModalAsignar] = useState(false);
  const [ticketParaAsignar, setTicketParaAsignar] = useState(null);
  const [agenteSeleccionado, setAgenteSeleccionado] = useState('');

  // Cargar tickets y agentes
  useEffect(() => {
    cargarDatos();
  }, [usuario, esAgente]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar tickets
      const filtros = esAgente ? { agenteId: usuario.id } : {};
      const dataTickets = await ticketService.obtenerTodos(filtros);
      setTickets(dataTickets || []);

      // Cargar agentes (solo para admin)
      if (!esAgente) {
        const dataAgentes = await usuarioService.obtenerAgentes();
        setAgentes(dataAgentes || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar tickets
  const ticketsFiltrados = tickets.filter(ticket => {
    const coincideBusqueda = 
      ticket.folio?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ticket.asunto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ticket.creador?.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideEstado = filtroEstado === 'todos' || ticket.estado === filtroEstado;
    const coincidePrioridad = filtroPrioridad === 'todos' || ticket.prioridad === filtroPrioridad;

    return coincideBusqueda && coincideEstado && coincidePrioridad;
  });

  // Ver detalle
  const verTicket = async (ticket) => {
    try {
      const ticketCompleto = await ticketService.obtenerPorId(ticket.id);
      setTicketSeleccionado(ticketCompleto);
      setVistaDetalle(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Volver a lista
  const volverALista = () => {
    setVistaDetalle(false);
    setTicketSeleccionado(null);
    cargarDatos();
  };

  // Abrir modal asignar
  const abrirModalAsignar = (ticket, e) => {
    e.stopPropagation();
    setTicketParaAsignar(ticket);
    setAgenteSeleccionado(ticket.agenteId || '');
    setMostrarModalAsignar(true);
  };

// Asignar agente
const asignarAgente = async () => {
  if (!ticketParaAsignar || !agenteSeleccionado) return;

  try {
    console.log('Asignando:', {
      ticketId: ticketParaAsignar.id,
      agenteId: agenteSeleccionado
    });
    
    await ticketService.actualizar(ticketParaAsignar.id, { 
      agenteId: agenteSeleccionado,
      estado: 'EN_PROGRESO'
    });
    setMostrarModalAsignar(false);
    setTicketParaAsignar(null);
    cargarDatos();
  } catch (error) {
    console.error('Error detallado:', JSON.stringify(error, null, 2));
    console.error('Mensaje:', error.message);
  }
};

  // Eliminar ticket
  const eliminarTicket = async (ticket, e) => {
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar ticket ${ticket.folio}?`)) return;

    try {
      await ticketService.eliminar(ticket.id);
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
    }
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

  // Clases de estado
  const getClaseEstado = (estado) => {
    const clases = {
      'ABIERTO': 'estado-abierto',
      'EN_PROGRESO': 'estado-proceso',
      'EN_ESPERA': 'estado-espera',
      'RESUELTO': 'estado-resuelto',
      'CERRADO': 'estado-cerrado'
    };
    return clases[estado] || '';
  };

  // Clases de prioridad
  const getClasePrioridad = (prioridad) => {
    const clases = {
      'BAJA': 'prioridad-baja',
      'MEDIA': 'prioridad-media',
      'ALTA': 'prioridad-alta',
      'URGENTE': 'prioridad-urgente'
    };
    return clases[prioridad] || '';
  };

  // Vista detalle
  if (vistaDetalle && ticketSeleccionado) {
    return (
      <DetalleTicket 
        ticket={ticketSeleccionado}
        onVolver={volverALista}
        esCliente={false}
      />
    );
  }

  return (
    <div className="lista-tickets">
      <div className="lista-header">
        <h1><FaTicketAlt /> {titulo}</h1>
      </div>

      {/* Filtros */}
      <div className="lista-filtros">
        <div className="filtro-busqueda">
          <FaSearch className="icono-busqueda" />
          <input
            type="text"
            placeholder="Buscar por folio, asunto o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="ABIERTO">Abierto</option>
          <option value="EN_PROGRESO">En Progreso</option>
          <option value="EN_ESPERA">En Espera</option>
          <option value="RESUELTO">Resuelto</option>
          <option value="CERRADO">Cerrado</option>
        </select>

        <select value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)}>
          <option value="todos">Todas las prioridades</option>
          <option value="BAJA">Baja</option>
          <option value="MEDIA">Media</option>
          <option value="ALTA">Alta</option>
          <option value="URGENTE">Urgente</option>
        </select>
      </div>

      {/* Tabla */}
      {cargando ? (
        <div className="cargando">
          <FaSpinner className="spin" /> Cargando tickets...
        </div>
      ) : ticketsFiltrados.length === 0 ? (
        <div className="sin-tickets">
          <FaTicketAlt className="icono-vacio" />
          <p>No hay tickets</p>
        </div>
      ) : (
        <table className="tickets-tabla">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Asunto</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Agente</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ticketsFiltrados.map(ticket => (
              <tr key={ticket.id} onClick={() => verTicket(ticket)}>
                <td className="celda-folio">{ticket.folio}</td>
                <td className="celda-asunto">{ticket.asunto}</td>
                <td>{ticket.creador ? `${ticket.creador.nombre} ${ticket.creador.apellido || ''}` : '-'}</td>
                <td>
                  <span className={`badge-estado ${getClaseEstado(ticket.estado)}`}>
                    {ticket.estado?.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`badge-prioridad ${getClasePrioridad(ticket.prioridad)}`}>
                    {ticket.prioridad}
                  </span>
                </td>
                <td>
                  {ticket.agente 
                    ? `${ticket.agente.nombre} ${ticket.agente.apellido || ''}`
                    : <span className="sin-asignar">Sin asignar</span>
                  }
                </td>
                <td className="celda-fecha">{formatearFecha(ticket.fechaCreacion)}</td>
                <td className="celda-acciones">
                  <button className="btn-accion ver" onClick={(e) => { e.stopPropagation(); verTicket(ticket); }} title="Ver">
                    <FaEye />
                  </button>
                  {!esAgente && (
                    <button className="btn-accion asignar" onClick={(e) => abrirModalAsignar(ticket, e)} title="Asignar">
                      <FaUserPlus />
                    </button>
                  )}
                  {!esAgente && (
                    <button className="btn-accion eliminar" onClick={(e) => eliminarTicket(ticket, e)} title="Eliminar">
                      <FaTrash />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Asignar Agente */}
      {mostrarModalAsignar && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h3>Asignar Agente</h3>
            <p>Ticket: <strong>{ticketParaAsignar?.folio}</strong></p>
            
            <select 
              value={agenteSeleccionado} 
              onChange={(e) => setAgenteSeleccionado(e.target.value)}
              className="select-agente"
            >
              <option value="">Seleccionar agente...</option>
              {agentes.map(agente => (
                <option key={agente.id} value={agente.id}>
                  {agente.nombre} {agente.apellido} ({agente.email})
                </option>
              ))}
            </select>

            <div className="modal-acciones">
              <button className="btn-cancelar" onClick={() => setMostrarModalAsignar(false)}>
                Cancelar
              </button>
              <button 
                className="btn-confirmar" 
                onClick={asignarAgente}
                disabled={!agenteSeleccionado}
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListaTickets;