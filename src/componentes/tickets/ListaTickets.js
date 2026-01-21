//Componente para listar y gestionar tickets
import React, { useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaFilter } from 'react-icons/fa';
import './ListaTickets.css';

function ListaTickets({ onNuevoTicket, onVerTicket }) {
  // Estado para búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');

  // Datos de ejemplo (después vendrán del servidor)
  const [tickets, setTickets] = useState([
    {
      id: 1,
      titulo: 'Error en el sistema de pagos',
      descripcion: 'El sistema no procesa pagos con tarjeta',
      estado: 'Abierto',
      prioridad: 'Alta',
      categoria: 'Incidente',
      solicitante: 'Juan Pérez',
      agente: 'María García',
      fechaCreacion: '2026-01-17',
      fechaActualizacion: '2026-01-17'
    },
    {
      id: 2,
      titulo: 'Solicitud de nuevo usuario',
      descripcion: 'Crear cuenta para nuevo empleado',
      estado: 'En Proceso',
      prioridad: 'Media',
      categoria: 'Solicitud',
      solicitante: 'Ana López',
      agente: ' Ruiz',
      fechaCreacion: '2026-01-16',
      fechaActualizacion: '2026-01-17'
    },
    {
      id: 3,
      titulo: 'Actualización de contraseña',
      descripcion: 'Usuario olvidó su contraseña',
      estado: 'Resuelto',
      prioridad: 'Baja',
      categoria: 'Solicitud',
      solicitante: ' Sánchez',
      agente: 'María García',
      fechaCreacion: '2026-01-15',
      fechaActualizacion: '2026-01-16'
    },
    {
      id: 4,
      titulo: 'Falla en impresora',
      descripcion: 'La impresora del piso 3 no funciona',
      estado: 'En Espera de Usuario',
      prioridad: 'Media',
      categoria: 'Incidente',
      solicitante: ' Martínez',
      agente: ' Ruiz',
      fechaCreacion: '2026-01-14',
      fechaActualizacion: '2026-01-15'
    },
    {
      id: 5,
      titulo: 'Instalación de software',
      descripcion: 'Instalar Office en equipo nuevo',
      estado: 'Abierto',
      prioridad: 'Baja',
      categoria: 'Solicitud',
      solicitante: 'Roberto Díaz',
      agente: 'Sin asignar',
      fechaCreacion: '2026-01-17',
      fechaActualizacion: '2026-01-17'
    }
  ]);

  // Función para eliminar ticket
  const eliminarTicket = (id) => {
    if (window.confirm('¿Está seguro de eliminar este ticket?')) {
      setTickets(tickets.filter(ticket => ticket.id !== id));
    }
  };

  // Filtrar tickets según búsqueda y filtros
  const ticketsFiltrados = tickets.filter(ticket => {
    const coincideBusqueda = ticket.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            ticket.solicitante.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'todos' || ticket.estado === filtroEstado;
    const coincidePrioridad = filtroPrioridad === 'todos' || ticket.prioridad === filtroPrioridad;
    
    return coincideBusqueda && coincideEstado && coincidePrioridad;
  });

  // Función obtener clase CSS según estado
  const obtenerClaseEstado = (estado) => {
    const clases = {
      'Abierto': 'estado-abierto',
      'En Proceso': 'estado-proceso',
      'En Espera de Usuario': 'estado-espera',
      'Resuelto': 'estado-resuelto'
    };
    return clases[estado] || '';
  };

  // Función para obtener clase CSS según prioridad
  const obtenerClasePrioridad = (prioridad) => {
    const clases = {
      'Alta': 'prioridad-alta',
      'Media': 'prioridad-media',
      'Baja': 'prioridad-baja'
    };
    return clases[prioridad] || '';
  };

  return (
    <div className="lista-tickets">
      {/* Encabezado */}
      <div className="tickets-encabezado">
        <h1>Gestión de Tickets</h1>
        <button className="boton-nuevo" onClick={onNuevoTicket}>
          <FaPlus /> Nuevo Ticket
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="tickets-filtros">
        <div className="campo-busqueda">
          <FaSearch className="icono-busqueda" />
          <input
            type="text"
            placeholder="Buscar por título o solicitante..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="grupo-filtros">
          <FaFilter className="icono-filtro" />
          
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="Abierto">Abierto</option>
            <option value="En Proceso">En Proceso</option>
            <option value="En Espera de Usuario">En Espera de Usuario</option>
            <option value="Resuelto">Resuelto</option>
          </select>

          <select 
            value={filtroPrioridad} 
            onChange={(e) => setFiltroPrioridad(e.target.value)}
          >
            <option value="todos">Todas las prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Tabla de tickets */}
      <div className="tickets-tabla-contenedor">
        <table className="tickets-tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Solicitante</th>
              <th>Agente</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ticketsFiltrados.map(ticket => (
              <tr key={ticket.id}>
                <td>#{ticket.id.toString().padStart(3, '0')}</td>
                <td className="columna-titulo">{ticket.titulo}</td>
                <td>{ticket.solicitante}</td>
                <td>{ticket.agente}</td>
                <td>
                  <span className={`estado ${obtenerClaseEstado(ticket.estado)}`}>
                    {ticket.estado}
                  </span>
                </td>
                <td>
                  <span className={`prioridad ${obtenerClasePrioridad(ticket.prioridad)}`}>
                    {ticket.prioridad}
                  </span>
                </td>
                <td>{ticket.fechaCreacion}</td>
                <td className="columna-acciones">
                  <button 
                    className="boton-accion boton-ver"
                    onClick={() => onVerTicket && onVerTicket(ticket)}
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="boton-accion boton-editar"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="boton-accion boton-eliminar"
                    onClick={() => eliminarTicket(ticket.id)}
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ticketsFiltrados.length === 0 && (
          <div className="sin-resultados">
            No se encontraron tickets con los filtros seleccionados
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="tickets-resumen">
        Mostrando {ticketsFiltrados.length} de {tickets.length} tickets
      </div>
    </div>
  );
}

export default ListaTickets;