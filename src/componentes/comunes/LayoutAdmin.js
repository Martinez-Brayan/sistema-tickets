import React, { useState } from 'react';
import { FaHome, FaTicketAlt, FaUsers, FaCalendarAlt, FaChartBar, FaCog, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import Notificaciones from '../notificaciones/Notificaciones';
import './Layout.css';

function LayoutAdmin({ children, onCambiarPagina, paginaActual }) {
  const [menuAbierto, setMenuAbierto] = useState(true);
  const { usuario, cerrarSesion } = useAutenticacion();

  const alternarMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const handleVerTicket = (ticketId) => {
    console.log('Ver ticket:', ticketId);
    onCambiarPagina('tickets');
  };

  return (
    <div className="layout-contenedor">
      <aside className={`layout-menu ${menuAbierto ? 'abierto' : 'cerrado'}`}>
        <div className="menu-encabezado">
          <h2>{menuAbierto ? '🎫 HelpDesk' : '🎫'}</h2>
          {menuAbierto && <span className="rol-indicador admin">Admin</span>}
        </div>
        
        <nav className="menu-navegacion">
          <button 
            onClick={() => onCambiarPagina('inicio')} 
            className={`menu-enlace ${paginaActual === 'inicio' ? 'activo' : ''}`}
          >
            <FaHome className="menu-icono" />
            {menuAbierto && <span>Dashboard</span>}
          </button>
          
          <button 
            onClick={() => onCambiarPagina('tickets')} 
            className={`menu-enlace ${paginaActual === 'tickets' ? 'activo' : ''}`}
          >
            <FaTicketAlt className="menu-icono" />
            {menuAbierto && <span>Tickets</span>}
          </button>
          
          <button 
            onClick={() => onCambiarPagina('usuarios')} 
            className={`menu-enlace ${paginaActual === 'usuarios' ? 'activo' : ''}`}
          >
            <FaUsers className="menu-icono" />
            {menuAbierto && <span>Usuarios</span>}
          </button>

          <button 
            onClick={() => onCambiarPagina('calendario')} 
            className={`menu-enlace ${paginaActual === 'calendario' ? 'activo' : ''}`}
          >
            <FaCalendarAlt className="menu-icono" />
            {menuAbierto && <span>Calendario</span>}
          </button>

          <button 
            onClick={() => onCambiarPagina('reportes')} 
            className={`menu-enlace ${paginaActual === 'reportes' ? 'activo' : ''}`}
          >
            <FaChartBar className="menu-icono" />
            {menuAbierto && <span>Reportes</span>}
          </button>

          <button 
            onClick={() => onCambiarPagina('configuracion')} 
            className={`menu-enlace ${paginaActual === 'configuracion' ? 'activo' : ''}`}
          >
            <FaCog className="menu-icono" />
            {menuAbierto && <span>Configuración</span>}
          </button>
        </nav>

        <div className="menu-pie">
          <button onClick={cerrarSesion} className="menu-enlace boton-salir">
            <FaSignOutAlt className="menu-icono" />
            {menuAbierto && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <div className="layout-principal">
        <header className="layout-encabezado">
          <button className="boton-menu" onClick={alternarMenu}>
            <FaBars />
          </button>
          <div className="encabezado-derecha">
            <Notificaciones onVerTicket={handleVerTicket} />
            <div className="encabezado-usuario">
              <span>Bienvenido, <strong>{usuario?.nombre}</strong></span>
            </div>
          </div>
        </header>

        <main className="layout-contenido">
          {children}
        </main>
      </div>
    </div>
  );
}

export default LayoutAdmin;