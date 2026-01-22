// LayoutAgente.js - Layout para Agente
import React, { useState } from 'react';
import { FaHome, FaTicketAlt, FaComments, FaCalendarAlt, FaSignOutAlt, FaBars, FaClock } from 'react-icons/fa';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import './Layout.css';

function LayoutAgente({ children, onCambiarPagina, paginaActual }) {
  const [menuAbierto, setMenuAbierto] = useState(true);
  const { usuario, cerrarSesion } = useAutenticacion();

  const alternarMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  return (
    <div className="layout-contenedor">
      <aside className={`layout-menu ${menuAbierto ? 'abierto' : 'cerrado'}`}>
        <div className="menu-encabezado">
          <h2>{menuAbierto ? '🎫 HelpDesk' : '🎫'}</h2>
          {menuAbierto && <span className="rol-indicador agente">Agente</span>}
        </div>
        
        <nav className="menu-navegacion">
          <button 
            onClick={() => onCambiarPagina('inicio')} 
            className={`menu-enlace ${paginaActual === 'inicio' ? 'activo' : ''}`}
          >
            <FaHome className="menu-icono" />
            {menuAbierto && <span>Mi Dashboard</span>}
          </button>
          
          <button 
            onClick={() => onCambiarPagina('mis-tickets')} 
            className={`menu-enlace ${paginaActual === 'mis-tickets' ? 'activo' : ''}`}
          >
            <FaTicketAlt className="menu-icono" />
            {menuAbierto && <span>Mis Tickets</span>}
          </button>
          
          <button 
            onClick={() => onCambiarPagina('mi-calendario')} 
            className={`menu-enlace ${paginaActual === 'mi-calendario' ? 'activo' : ''}`}
          >
            <FaCalendarAlt className="menu-icono" />
            {menuAbierto && <span>Mi Calendario</span>}
          </button>

          <button 
            onClick={() => onCambiarPagina('registro-tiempo')} 
            className={`menu-enlace ${paginaActual === 'registro-tiempo' ? 'activo' : ''}`}
          >
            <FaClock className="menu-icono" />
            {menuAbierto && <span>Check-IN/OUT</span>}
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
          <div className="encabezado-usuario">
            <span>Bienvenido, <strong>{usuario?.nombre}</strong></span>
          </div>
        </header>

        <main className="layout-contenido">
          {children}
        </main>
      </div>
    </div>
  );
}

export default LayoutAgente;