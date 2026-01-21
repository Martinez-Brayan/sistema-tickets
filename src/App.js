//Componente Principal con sistema de roles
import React, { useState } from 'react';
import { ProveedorAutenticacion, useAutenticacion } from './contextos/ContextoAutenticacion';
import Login from './componentes/autenticacion/Login';
import LayoutAdmin from './componentes/comunes/LayoutAdmin';
import LayoutAgente from './componentes/comunes/LayoutAgente';
import LayoutCliente from './componentes/comunes/LayoutCliente';
import MiCalendario from './componentes/calendario/MiCalendario';
import Dashboard from './paginas/Dashboard';
import Tickets from './paginas/Tickets';
import ChatPage from './paginas/ChatPage';
import Usuarios from './paginas/Usuarios';
import CalendarioPage from './paginas/CalendarioPage';
import MiCalendarioPage from './paginas/MiCalendarioPage';
import CheckInOutPage from './paginas/CheckInOutPage';
import ReportesPage from './paginas/ReportesPage';
import ConfiguracionPage from './paginas/ConfiguracionPage';


// Dashboard  para Agente
function DashboardAgente() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#1a1a2e', marginBottom: '20px' }}>Mi Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#3498db', color: 'white', padding: '25px', borderRadius: '10px' }}>
          <h3 style={{ margin: 0 }}>5</h3>
          <p style={{ margin: '5px 0 0' }}>Tickets Asignados</p>
        </div>
        <div style={{ background: '#f39c12', color: 'white', padding: '25px', borderRadius: '10px' }}>
          <h3 style={{ margin: 0 }}>2</h3>
          <p style={{ margin: '5px 0 0' }}>En Proceso</p>
        </div>
        <div style={{ background: '#27ae60', color: 'white', padding: '25px', borderRadius: '10px' }}>
          <h3 style={{ margin: 0 }}>12</h3>
          <p style={{ margin: '5px 0 0' }}>Resueltos Hoy</p>
        </div>
        <div style={{ background: '#e74c3c', color: 'white', padding: '25px', borderRadius: '10px' }}>
          <h3 style={{ margin: 0 }}>1</h3>
          <p style={{ margin: '5px 0 0' }}>Urgentes</p>
        </div>
      </div>
    </div>
  );
}

//nueva solicitud para Cliente
function NuevaSolicitud() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviado, setEnviado] = useState(false);

  const enviarSolicitud = (e) => {
    e.preventDefault();
    if (titulo && descripcion) {
      setEnviado(true);
      setTitulo('');
      setDescripcion('');
      setTimeout(() => setEnviado(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ color: '#1a1a2e', marginBottom: '20px' }}>Nueva Solicitud</h1>
      
      {enviado && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          ¡Solicitud enviada correctamente! Un agente se comunicará pronto.
        </div>
      )}
      
      <form onSubmit={enviarSolicitud} style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Título del problema *</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Describa brevemente su problema"
            style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Descripción detallada *</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Proporcione todos los detalles posibles..."
            rows="5"
            style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '5px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
            required
          />
        </div>
        
        <button type="submit" style={{ width: '100%', padding: '14px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          Enviar Solicitud
        </button>
      </form>
    </div>
  );
}

// Lista de tickets del cliente
function MisTicketsCliente() {
  const tickets = [
    { id: 101, titulo: 'No puedo acceder al sistema', estado: 'En Proceso', fecha: '17/01/2026', agente: 'Ca' },
    { id: 98, titulo: 'Error al generar reporte', estado: 'Resuelto', fecha: '15/01/2026', agente: 'María García' },
    { id: 95, titulo: 'Solicitud de nuevo acceso', estado: 'Resuelto', fecha: '10/01/2026', agente: ' Ruiz' },
  ];

  return (
    <div>
      <h1 style={{ color: '#1a1a2e', marginBottom: '20px' }}>Mis Tickets</h1>
      <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Título</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Estado</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Agente</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>#{ticket.id}</td>
                <td style={{ padding: '15px' }}>{ticket.titulo}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    padding: '5px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px',
                    background: ticket.estado === 'Resuelto' ? '#e8f5e9' : '#fff3e0',
                    color: ticket.estado === 'Resuelto' ? '#388e3c' : '#f57c00'
                  }}>
                    {ticket.estado}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>{ticket.agente}</td>
                <td style={{ padding: '15px' }}>{ticket.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

  // Páginas para Administrador
  const renderizarPaginaAdmin = () => {
    switch (paginaActual) {
      case 'inicio':
        return <Dashboard />;
      case 'tickets':
        return <Tickets />;
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

  // Páginas para Agente
  const renderizarPaginaAgente = () => {
    switch (paginaActual) {
      case 'inicio':
        return <DashboardAgente />;
      case 'mis-tickets':
        return <Tickets />;
      case 'chat':
        return <ChatPage />;
      case 'mi-calendario':
        return <MiCalendarioPage />;
      case 'registro-tiempo':
        return <CheckInOutPage />;
      default:
        return <DashboardAgente />;
    }
  };

  // Páginas para Cliente
  const renderizarPaginaCliente = () => {
    switch (paginaActual) {
      case 'nueva-solicitud':
        return <NuevaSolicitud />;
      case 'mis-tickets':
        return <MisTicketsCliente />;
      case 'chat':
        return <ChatPage />;
      case 'historial':
        return <aun no hecho="Historial de tickets" />;
      default:
        return <NuevaSolicitud />;
    }
  };

  // segun según rol
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

// Componente principal con el proveedor
function App() {
  return (
    <ProveedorAutenticacion>
      <AppContenido />
    </ProveedorAutenticacion>
  );
}

export default App;