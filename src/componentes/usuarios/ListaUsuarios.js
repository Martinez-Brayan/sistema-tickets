//- Gestión de usuarios del sistema
import React, { useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserShield, FaUser, FaHeadset, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './ListaUsuarios.css';

function ListaUsuarios() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');

  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: 'Maria Garcia', correo: 'maria@empresa.com', rol: 'Administrador', estado: 'Activo', disponible: true, equipo: 'Soporte N1' },
    { id: 2, nombre: ' Ruiz', correo: 'agente@empresa.com', rol: 'Agente', estado: 'Activo', disponible: true, equipo: 'Soporte N1' },
    { id: 3, nombre: ' Lopez', correo: 'lopez@empresa.com', rol: 'Agente', estado: 'Activo', disponible: false, equipo: 'Soporte N2' },
    { id: 4, nombre: ' Perez', correo: 'juan@cliente.com', rol: 'Cliente', estado: 'Activo', disponible: true, equipo: '-' },
    { id: 5, nombre: ' Martinez', correo: 'martinez@cliente.com', rol: 'Cliente', estado: 'Inactivo', disponible: false, equipo: '-' }
  ]);

  const alternarDisponibilidad = (id) => {
    setUsuarios(usuarios.map(usuario => {
      if (usuario.id === id) {
        return { ...usuario, disponible: !usuario.disponible };
      }
      return usuario;
    }));
  };

  const eliminarUsuario = (id) => {
    if (window.confirm('Esta seguro de eliminar este usuario?')) {
      setUsuarios(usuarios.filter(usuario => usuario.id !== id));
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            usuario.correo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === 'todos' || usuario.rol === filtroRol;
    return coincideBusqueda && coincideRol;
  });

  const obtenerIconoRol = (rol) => {
    switch (rol) {
      case 'Administrador': return <FaUserShield className="icono-rol admin" />;
      case 'Agente': return <FaHeadset className="icono-rol agente" />;
      case 'Cliente': return <FaUser className="icono-rol cliente" />;
      default: return <FaUser className="icono-rol" />;
    }
  };

  return (
    <div className="lista-usuarios">
      <div className="usuarios-encabezado">
        <h1>Gestion de Usuarios</h1>
        <button className="boton-nuevo">
          <FaPlus /> Nuevo Usuario
        </button>
      </div>
      
      <div className="usuarios-filtros">
        <div className="campo-busqueda">
          <FaSearch className="icono-busqueda" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
          <option value="todos">Todos los roles</option>
          <option value="Administrador">Administrador</option>
          <option value="Agente">Agente</option>
          <option value="Cliente">Cliente</option>
        </select>
      </div>

      <div className="usuatios-tabla-contenedor">
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Equipo</th>
              <th>Disponible</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr key={usuario.id}>
                <td>
                  <div className="usuario-info">
                    <div className="usuario-avatar">{usuario.nombre.charAt(0)}</div>
                    <div>
                      <div className="usuario-nombre">{usuario.nombre}</div>
                      <div className="usuario-correo">{usuario.correo}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="usuario-rol">
                    {obtenerIconoRol(usuario.rol)}
                    <span>{usuario.rol}</span>
                  </div>
                </td>
                <td>{usuario.equipo}</td>
                <td>
                  <button className="boton-disponibilidad" onClick={() => alternarDisponibilidad(usuario.id)}>
                    {usuario.disponible ? <FaToggleOn className="toggle-on" /> : <FaToggleOff className="toggle-off" />}
                  </button>
                </td>
                <td>
                  <span className={`estado-usuario ${usuario.estado.toLowerCase()}`}>{usuario.estado}</span>
                </td>
                <td className="columna-acciones">
                  <button className="boton-accion boton-editar"><FaEdit /></button>
                  <button className="boton-accion boton-eliminar" onClick={() => eliminarUsuario(usuario.id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListaUsuarios;