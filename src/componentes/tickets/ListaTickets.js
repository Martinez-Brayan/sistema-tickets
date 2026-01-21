import React, { useState } from 'react';
import { FaSearch, FaEye, FaEdit, FaTrash, FaTicketAlt } from 'react-icons/fa';
import DetalleTicket from './DetalleTicket';
import './ListaTickets.css';

function ListaTickets({ esAgente = false, titulo = "Gestión de Tickets" }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [vistaDetalle, setVistaDetalle] = useState(false);

  // Datos dummy para pruebas
  const [tickets, setTickets] = useState([
    {
      id: 1,
      titulo: 'Error en facturación',
      solicitante: 'Juan Pérez',
      empresa: 'Empresa A',
      agente: 'Agente 1',
      estado: 'Abierto',
      prioridad: 'Alta',
      fechaCreacion: '2023-01-15T10:00:00',
      descripcion: 'No puedo generar facturas del mes.'
    },
    {
      id: 2,
      titulo: 'Solicitud de acceso',
      solicitante: 'María López',
      empresa: 'Empresa B',
      agente: 'Agente 1',
      estado: 'En Proceso',
      prioridad: 'Media',
      fechaCreacion: '2023-01-16T14:30:00',
      descripcion: 'Necesito acceso al módulo de reportes.'
    },
    {
      id: 3,
      titulo: 'Fallo en login',
      solicitante: 'Carlos Ruiz',
      empresa: 'Empresa C',
      agente: null,
      estado: 'En Espera de Usuario',
      prioridad: 'Baja',
      fechaCreacion: '2023-01-17T09:15:00',
      descripcion: 'Olvide mi contraseña y no recibo el correo.'
    }
  ]);

  // Filtrar tickets
  const ticketsFiltrados = tickets.filter(ticket => {
    const coincideBusqueda = ticket.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                            ticket.solicitante?.toLowerCase().includes(busqueda.toLowerCase()) ||
                            ticket.empresa?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'todos' || ticket.estado === filtroEstado;
    const coincidePrioridad = filtroPrioridad === 'todos' || ticket.prioridad === filtroPrioridad;
    return coincideBusqueda && coincideEstado && coincidePrioridad;
  });

  // Ver detalle del ticket
  const verTicket = (ticket) => {
    setTicketSeleccionado(ticket);
    setVistaDetalle(true);
  };

  // Volver a la lista
  const volverALista = () => {
    setVistaDetalle(false);
    setTicketSeleccionado(null);
  };

  // Actualizar ticket desde detalle
  const actualizarTicket = (ticketActualizado) => {
    setTickets(tickets.map(t => 
      t.id === ticketActualizado.id ? ticketActualizado : t
    ));
  };

  // Eliminar ticket (solo admin)
  const eliminarTicket = (id) => {
    if (window.confirm('¿Eliminar este ticket?')) {
      setTickets(tickets.filter(t => t.id !== id));
    }
  };

  // Obtener clase de estado
  const getClaseEstado = (estado) => {
    const clases = {
      'Abierto': 'estado-abierto',
      'En Proceso': 'estado-proceso',
      'En Espera de Usuario': 'estado-espera',
      'Resuelto': 'estado-resuelto',
      'Cerrado': 'estado-cerrado'
    };
    return clases[estado] || '';
  };

  // Obtener clase de prioridad
  const getClasePrioridad = (prioridad) => {
    const clases = {
      'Alta': 'prioridad-alta',
      'Media': 'prioridad-media',
      'Baja': 'prioridad-baja'
    };
    return clases[prioridad] || '';
  };

  // Si esta en vista detalle, mostrar DetalleTicket
  if (vistaDetalle && ticketSeleccionado) {
    return (
      <DetalleTicket 
        ticket={ticketSeleccionado} 
        onVolver={volverALista}
        onActualizar={actualizarTicket}
      />
    );
  }

  return (
    <div className="lista-tickets">
      <div className="tickets-encabezado">
        <h1>{titulo}</h1>
      </div>

      <div className="tickets-filtros">
        <div className="campo-busqueda">
          <FaSearch className="icono-busqueda" />
          <input
            type="text"
            placeholder="Buscar por titulo, solicitante o empresa..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="Abierto">Abierto</option>
          <option value="En Proceso">En Proceso</option>
          <option value="En Espera de Usuario">En Espera de Usuario</option>
          <option value="Resuelto">Resuelto</option>
          <option value="Cerrado">Cerrado</option>
        </select>

        <select value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)}>
          <option value="todos">Todas las prioridades</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      {tickets.length === 0 ? (
        <div className="sin-datos">
          <FaTicketAlt className="sin-datos-icono" />
          <p>{esAgente ? 'No tienes tickets asignados' : 'No hay tickets registrados'}</p>
        </div>
      ) : (
        <>
          <div className="tickets-contador">
            Mostrando {ticketsFiltrados.length} de {tickets.length} tickets
          </div>

          <div className="tickets-tabla-contenedor">
            <table className="tickets-tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titulo</th>
                  <th>Empresa</th>
                  <th>Solicitante</th>
                  {!esAgente && <th>Agente</th>}
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ticketsFiltrados.map(ticket => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id}</td>
                    <td>{ticket.titulo}</td>
                    <td>{ticket.empresa || '-'}</td>
                    <td>{ticket.solicitante || '-'}</td>
                    {!esAgente && <td>{ticket.agente || 'Sin asignar'}</td>}
                    <td>
                      <span className={`estado-badge ${getClaseEstado(ticket.estado)}`}>
                        {ticket.estado}
                      </span>
                    </td>
                    <td>
                      <span className={`prioridad-badge ${getClasePrioridad(ticket.prioridad)}`}>
                        {ticket.prioridad}
                      </span>
                    </td>
                    <td>{new Date(ticket.fechaCreacion).toLocaleDateString()}</td>
                    <td className="columna-acciones">
                      <button className="boton-accion ver" title="Ver" onClick={() => verTicket(ticket)}>
                        <FaEye />
                      </button>
                      {!esAgente && (
                        <button className="boton-accion eliminar" title="Eliminar" onClick={() => eliminarTicket(ticket.id)}>
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default ListaTickets;