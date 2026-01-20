// LayoutCliente.js - Layout para Cliente
import React, { useState } from 'react';
import { FaPlus, FaTicketAlt, FaComments, FaSignOutAlt, FaBars, FaHistory } from 'react-icons/fa';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import './Layout.css';

function LayoutCliente({ children, onCambiarPagina, paginaActual }) {
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
          {menuAbierto && <span className="rol-indicador cliente">Cliente</span>}
        </div>
        
        <nav className="menu-navegacion">
          <button 
            onClick={() => onCambiarPagina('nueva-solicitud')} 
            className={`menu-enlace ${paginaActual === 'nueva-solicitud' ? 'activo' : ''}`}
          >
            <FaPlus className="menu-icono" />
            {menuAbierto && <span>Nueva Solicitud</span>}
          </button>
          
          <button 
            onClick={() => onCambiarPagina('mis-tickets')} 
            className={`menu-enlace ${paginaActual === 'mis-tickets' ? 'activo' : ''}`}
          >
            <FaTicketAlt className="menu-icono" />
            {menuAbierto && <span>Mis Tickets</span>}
          </button>
          
          <button 
            onClick={() => onCambiarPagina('chat')} 
            className={`menu-enlace ${paginaActual === 'chat' ? 'activo' : ''}`}
          >
            <FaComments className="menu-icono" />
            {menuAbierto && <span>Chat con Soporte</span>}
          </button>

          <button 
            onClick={() => onCambiarPagina('historial')} 
            className={`menu-enlace ${paginaActual === 'historial' ? 'activo' : ''}`}
          >
            <FaHistory className="menu-icono" />
            {menuAbierto && <span>Historial</span>}
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

export default LayoutCliente;