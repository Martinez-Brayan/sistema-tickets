// Layout.js - Estructura principal de la aplicación
import React, { useState } from 'react';
import { FaTicketAlt, FaUsers, FaComments, FaChartBar, FaCog, FaSignOutAlt, FaBars, FaHome } from 'react-icons/fa';
import './Layout.css';

function Layout({ children, onCerrarSesion, onCambiarPagina, paginaActual }) {
  // Estado para controlar si el menú está abierto o cerrado
  const [menuAbierto, setMenuAbierto] = useState(true);

  // Función para alternar el menú
  const alternarMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  // Función para manejar clic en enlace del menú
  const manejarClicMenu = (pagina) => {
    if (onCambiarPagina) {
      onCambiarPagina(pagina);
    }
  };

  return (
    <div className="layout-contenedor">
      {/* Menú Lateral */}
      <aside className={`layout-menu ${menuAbierto ? 'abierto' : 'cerrado'}`}>
        <div className="menu-encabezado">
          <h2>{menuAbierto ? '🎫 HelpDesk' : '🎫'}</h2>
        </div>
        
        <nav className="menu-navegacion">
          <button 
            onClick={() => manejarClicMenu('inicio')} 
            className={`menu-enlace ${paginaActual === 'inicio' ? 'activo' : ''}`}
          >
            <FaHome className="menu-icono" />
            {menuAbierto && <span>Inicio</span>}
          </button>
          
          <button 
            onClick={() => manejarClicMenu('tickets')} 
            className={`menu-enlace ${paginaActual === 'tickets' ? 'activo' : ''}`}
          >
            <FaTicketAlt className="menu-icono" />
            {menuAbierto && <span>Tickets</span>}
          </button>
          
          <button 
            onClick={() => manejarClicMenu('chat')} 
            className={`menu-enlace ${paginaActual === 'chat' ? 'activo' : ''}`}
          >
            <FaComments className="menu-icono" />
            {menuAbierto && <span>Chat</span>}
          </button>
          
          <button 
            onClick={() => manejarClicMenu('usuarios')} 
            className={`menu-enlace ${paginaActual === 'usuarios' ? 'activo' : ''}`}
          >
            <FaUsers className="menu-icono" />
            {menuAbierto && <span>Usuarios</span>}
          </button>
          
          <button 
            onClick={() => manejarClicMenu('reportes')} 
            className={`menu-enlace ${paginaActual === 'reportes' ? 'activo' : ''}`}
          >
            <FaChartBar className="menu-icono" />
            {menuAbierto && <span>Reportes</span>}
          </button>
          
          <button 
            onClick={() => manejarClicMenu('configuracion')} 
            className={`menu-enlace ${paginaActual === 'configuracion' ? 'activo' : ''}`}
          >
            <FaCog className="menu-icono" />
            {menuAbierto && <span>Configuración</span>}
          </button>
        </nav>

        <div className="menu-pie">
          <button onClick={onCerrarSesion} className="menu-enlace boton-salir">
            <FaSignOutAlt className="menu-icono" />
            {menuAbierto && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="layout-principal">
        {/* Encabezado */}
        <header className="layout-encabezado">
          <button className="boton-menu" onClick={alternarMenu}>
            <FaBars />
          </button>
          <div className="encabezado-usuario">
            <span>Bienvenido, <strong>Administrador</strong></span>
          </div>
        </header>

        {/* Área de Contenido */}
        <main className="layout-contenido">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;