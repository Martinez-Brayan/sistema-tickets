import React, { useState } from 'react';
import { ProveedorAutenticacion, useAutenticacion } from './contextos/ContextoAutenticacion';
import Login from './componentes/autenticacion/Login';
import LayoutAdmin from './componentes/comunes/LayoutAdmin';
import LayoutAgente from './componentes/comunes/LayoutAgente';
import LayoutCliente from './componentes/comunes/LayoutCliente';
import Dashboard from './paginas/Dashboard';
import Usuarios from './paginas/Usuarios';
import CalendarioPage from './paginas/CalendarioPage';
import MiCalendarioPage from './paginas/MiCalendarioPage';
import CheckInOutPage from './paginas/CheckInOutPage';
import ReportesPage from './paginas/ReportesPage';
import ConfiguracionPage from './paginas/ConfiguracionPage';
import ListaTickets from './componentes/tickets/ListaTickets';
import NuevaSolicitud from './componentes/solicitud/NuevaSolicitud';

// Dashboard para Agente
function DashboardAgente() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#1a1a2e', marginBottom: '20px' }}>Mi Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#3498db', color: 'white', padding: '25px', borderRadius: '10px' }}>
          <p style={{ margin: '5px 0 0' }}>Tickets Asignados</p>
        </div>
        <div style={{ background: '#f39c12', color: 'white', padding: '25px', borderRadius: '10px' }}>
          <p style={{ margin: '5px 0 0' }}>En Proceso</p>
        </div>
        <div style={{ background: '#27ae60', color: 'white', padding: '25px', borderRadius: '10px' }}>
          <p style={{ margin: '5px 0 0' }}>Resueltos Hoy</p>
        </div>
        <div style={{ background: '#e74c3c', color: 'white', padding: '25px', borderRadius: '10px' }}>
          <p style={{ margin: '5px 0 0' }}>Urgentes</p>
        </div>
      </div>
    </div>
  );
}

// Lista de tickets del cliente
function MisTicketsCliente() {
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [tickets] = useState([]);

  const ticketsFiltrados = tickets.filter(ticket => {
    if (filtroEstado === 'todos') return true;
    if (filtroEstado === 'activos') return ['Abierto', 'En Proceso', 'En Espera de Usuario'].includes(ticket.estado);
    if (filtroEstado === 'cerrados') return ['Resuelto', 'Cerrado'].includes(ticket.estado);
    return ticket.estado === filtroEstado;
  });

  return (
    <div className="mis-tickets-cliente">
      <div className="mis-tickets-encabezado">
        <h1>Mis Tickets</h1>
        <select 
          value={filtroEstado} 
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="filtro-select"
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="cerrados">Cerrados</option>
          <option value="Abierto">Abierto</option>
          <option value="En Proceso">En Proceso</option>
          <option value="En Espera de Usuario">En Espera</option>
          <option value="Resuelto">Resuelto</option>
          <option value="Cerrado">Cerrado</option>
        </select>
      </div>

      {tickets.length === 0 ? (
        <div className="sin-tickets">
          <p>No tienes tickets registrados</p>
        </div>
      ) : ticketsFiltrados.length === 0 ? (
        <div className="sin-tickets">
          <p>No hay tickets con el filtro seleccionado</p>
        </div>
      ) : (
        <div className="tickets-lista">
          {ticketsFiltrados.map(ticket => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <span className="ticket-id">#{ticket.id}</span>
                <span className={`ticket-estado ${ticket.estado.toLowerCase().replace(/ /g, '-')}`}>
                  {ticket.estado}
                </span>
              </div>
              <h3 className="ticket-titulo">{ticket.titulo}</h3>
              <div className="ticket-detalles">
                <span>Agente: {ticket.agente || 'Sin asignar'}</span>
                <span>Fecha: {ticket.fecha}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .mis-tickets-cliente { padding: 10px; }
        .mis-tickets-encabezado { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .mis-tickets-encabezado h1 { margin: 0; color: #1a1a2e; }
        .filtro-select { padding: 10px 15px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px; cursor: pointer; }
        .sin-tickets { text-align: center; padding: 60px 20px; background: white; border-radius: 10px; color: #999; }
        .tickets-lista { display: flex; flex-direction: column; gap: 15px; }
        .ticket-card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .ticket-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .ticket-id { font-weight: bold; color: #3498db; }
        .ticket-estado { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .ticket-estado.abierto { background: #e3f2fd; color: #1976d2; }
        .ticket-estado.en-proceso { background: #fff3e0; color: #f57c00; }
        .ticket-estado.en-espera-de-usuario { background: #f3e5f5; color: #7b1fa2; }
        .ticket-estado.resuelto { background: #e8f5e9; color: #388e3c; }
        .ticket-estado.cerrado { background: #eceff1; color: #607d8b; }
        .ticket-titulo { margin: 0 0 10px; font-size: 16px; color: #333; }
        .ticket-detalles { display: flex; gap: 20px; font-size: 13px; color: #666; }
      `}</style>
    </div>
  );
}

// Componente interno que usa el contexto
function AppContenido() {
  const { autenticado, usuario } = useAutenticacion();
  const [paginaActual, setPaginaActual] = useState('inicio');

  const cambiarPagina = (pagina) => {
    setPaginaActual(pagina);
  };

  if (!autenticado) {
    return <Login />;
  }

  const renderizarPaginaAdmin = () => {
    switch (paginaActual) {
      case 'inicio':
        return <Dashboard />;
      case 'tickets':
        return <ListaTickets titulo="Todos los tickets" />;
      case 'usuarios':
        return <Usuarios />;
      case 'calendario':
        return <CalendarioPage />;
      case 'reportes':
        return <ReportesPage />;
      case 'configuracion':
        return <ConfiguracionPage />;
      default:
        return <Dashboard />;
    }
  };

  const renderizarPaginaAgente = () => {
    switch (paginaActual) {
      case 'dashboard':
        return <DashboardAgente />;
      case 'mis-tickets':
        return <ListaTickets esAgente={true} titulo="Mis Tickets Asignados" />;
      case 'mi-calendario':
        return <MiCalendarioPage />;
      case 'registro-tiempo':
        return <CheckInOutPage />;
      default:
        return <DashboardAgente />;
    }
  };

  const renderizarPaginaCliente = () => {
    switch (paginaActual) {
      case 'nueva-solicitud':
        return <NuevaSolicitud />;
      case 'mis-tickets':
        return <MisTicketsCliente />;
      default:
        return <NuevaSolicitud />;
    }
  };

  if (usuario.rol === 'administrador') {
    return (
      <LayoutAdmin onCambiarPagina={cambiarPagina} paginaActual={paginaActual}>
        {renderizarPaginaAdmin()}
      </LayoutAdmin>
    );
  }

  if (usuario.rol === 'agente') {
    return (
      <LayoutAgente onCambiarPagina={cambiarPagina} paginaActual={paginaActual}>
        {renderizarPaginaAgente()}
      </LayoutAgente>
    );
  }

  if (usuario.rol === 'cliente') {
    return (
      <LayoutCliente onCambiarPagina={cambiarPagina} paginaActual={paginaActual}>
        {renderizarPaginaCliente()}
      </LayoutCliente>
    );
  }

  return <Login />;
}

function App() {
  return (
    <ProveedorAutenticacion>
      <AppContenido />
    </ProveedorAutenticacion>
  );
}
export default App;