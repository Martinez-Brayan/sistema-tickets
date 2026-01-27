import React, { useState, useEffect } from 'react';
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
import MisTicketsCliente from './componentes/tickets/MisTicketsCliente';

// Dashboard para Agente
function DashboardAgente() {
  const [estadisticas, setEstadisticas] = useState({
    asignados: 0,
    enProgreso: 0,
    resueltos: 0,
    urgentes: 0
  });
  const [cargando, setCargando] = useState(true);
  const usuarioId = localStorage.getItem('usuarioId');

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const { ticketService } = await import('./servicios/supabase');
      const tickets = await ticketService.obtenerTodos({ agenteId: usuarioId });
      
      setEstadisticas({
        asignados: tickets.length,
        enProgreso: tickets.filter(t => t.estado === 'EN_PROGRESO').length,
        resueltos: tickets.filter(t => t.estado === 'RESUELTO' || t.estado === 'CERRADO').length,
        urgentes: tickets.filter(t => t.prioridad === 'URGENTE' && t.estado !== 'CERRADO').length
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#1a1a2e', marginBottom: '20px' }}>Mi Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#3498db', color: 'white', padding: '25px', borderRadius: '10px' }}>
          <h3 style={{ margin: 0 }}>{estadisticas.asignados}</h3>
          <p style={{ margin: '5px 0 0' }}>Tickets Asignados</p>
        </div>
        <div style={{ background: '#f39c12', color: 'white', padding: '25px', borderRadius: '10px' }}>
          <h3 style={{ margin: 0 }}>{estadisticas.enProgreso}</h3>
          <p style={{ margin: '5px 0 0' }}>En Progreso</p>
        </div>
        <div style={{ background: '#27ae60', color: 'white', padding: '25px', borderRadius: '10px' }}>
          <h3 style={{ margin: 0 }}>{estadisticas.resueltos}</h3>
          <p style={{ margin: '5px 0 0' }}>Resueltos</p>
        </div>
        <div style={{ background: '#e74c3c', color: 'white', padding: '25px', borderRadius: '10px' }}>
          <h3 style={{ margin: 0 }}>{estadisticas.urgentes}</h3>
          <p style={{ margin: '5px 0 0' }}>Urgentes</p>
        </div>
      </div>
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
        return <CheckInOutPage/>;
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