import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserShield, FaUser, FaHeadset, FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import { usuarioService } from '../../servicios/supabase';
import './ListaUsuarios.css';

function ListaUsuarios() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarios, setUsuarios] = useState([]);

  const [formUsuario, setFormUsuario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'CLIENTE',
    telefono: '',
    empresa: '',
    direccion: '',
    activo: true
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const data = await usuarioService.obtenerTodos();
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setCargando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const texto = `${usuario.nombre} ${usuario.apellido || ''} ${usuario.email} ${usuario.empresa || ''}`.toLowerCase();
    const coincideBusqueda = texto.includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === 'todos' || usuario.rol === filtroRol;
    return coincideBusqueda && coincideRol;
  });

  const abrirModalNuevo = () => {
    setUsuarioEditando(null);
    setFormUsuario({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'CLIENTE',
      telefono: '',
      empresa: '',
      direccion: '',
      activo: true
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setFormUsuario({
      nombre: usuario.nombre,
      apellido: usuario.apellido || '',
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      telefono: usuario.telefono || '',
      empresa: usuario.empresa || '',
      direccion: usuario.direccion || '',
      activo: usuario.activo
    });
    setMostrarModal(true);
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    
    if (!formUsuario.nombre || !formUsuario.email) {
      alert('Complete los campos obligatorios');
      return;
    }

    if (!usuarioEditando && !formUsuario.password) {
      alert('Ingrese una contraseña');
      return;
    }

    setGuardando(true);

    try {
      if (usuarioEditando) {
        const datosActualizar = {
          nombre: formUsuario.nombre,
          apellido: formUsuario.apellido,
          email: formUsuario.email,
          rol: formUsuario.rol,
          telefono: formUsuario.telefono,
          empresa: formUsuario.empresa,
          direccion: formUsuario.direccion,
          activo: formUsuario.activo
        };
        
        if (formUsuario.password) {
          datosActualizar.password = formUsuario.password;
        }

        await usuarioService.actualizar(usuarioEditando.id, datosActualizar);
      } else {
        await usuarioService.crear({
          nombre: formUsuario.nombre,
          apellido: formUsuario.apellido,
          email: formUsuario.email,
          password: formUsuario.password,
          rol: formUsuario.rol,
          telefono: formUsuario.telefono,
          empresa: formUsuario.empresa,
          direccion: formUsuario.direccion,
          activo: formUsuario.activo
        });
      }

      setMostrarModal(false);
      await cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;

    try {
      await usuarioService.eliminar(id);
      await cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar usuario');
    }
  };

  const obtenerIconoRol = (rol) => {
    switch (rol) {
      case 'ADMIN': 
      case 'JEFE':
        return <FaUserShield className="icono-rol admin" />;
      case 'AGENTE': 
        return <FaHeadset className="icono-rol agente" />;
      case 'CLIENTE': 
        return <FaUser className="icono-rol cliente" />;
      default: 
        return <FaUser className="icono-rol" />;
    }
  };

  const obtenerEtiquetaRol = (rol) => {
    const etiquetas = {
      'ADMIN': 'Administrador',
      'JEFE': 'Jefe',
      'AGENTE': 'Agente',
      'CLIENTE': 'Cliente'
    };
    return etiquetas[rol] || rol;
  };

  return (
    <div className="lista-usuarios">
      <div className="usuarios-encabezado">
        <h1>Gestión de Usuarios</h1>
        <button className="boton-nuevo" onClick={abrirModalNuevo}>
          <FaPlus /> Nuevo Usuario
        </button>
      </div>

      <div className="usuarios-filtros">
        <div className="campo-busqueda">
          <FaSearch className="icono-busqueda" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o empresa..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
          <option value="todos">Todos los roles</option>
          <option value="ADMIN">Administrador</option>
          <option value="JEFE">Jefe</option>
          <option value="AGENTE">Agente</option>
          <option value="CLIENTE">Cliente</option>
        </select>
      </div>

      {cargando ? (
        <div className="cargando">
          <FaSpinner className="spin" /> Cargando usuarios...
        </div>
      ) : usuarios.length === 0 ? (
        <div className="sin-datos">
          <FaUser className="sin-datos-icono" />
          <p>No hay usuarios registrados</p>
          <button className="boton-nuevo" onClick={abrirModalNuevo}>
            <FaPlus /> Crear primer usuario
          </button>
        </div>
      ) : (
        <div className="usuarios-tabla-contenedor">
          <table className="usuarios-tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Empresa</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(usuario => (
                <tr key={usuario.id}>
                  <td>
                    <div className="usuario-info">
                      <div className="usuario-avatar">
                        {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0) || ''}
                      </div>
                      <div>
                        <div className="usuario-nombre">{usuario.nombre} {usuario.apellido}</div>
                        <div className="usuario-correo">{usuario.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{usuario.empresa || '-'}</td>
                  <td>
                    <div className="usuario-rol">
                      {obtenerIconoRol(usuario.rol)}
                      <span>{obtenerEtiquetaRol(usuario.rol)}</span>
                    </div>
                  </td>
                  <td>{usuario.telefono || '-'}</td>
                  <td>
                    <span className={`estado-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="columna-acciones">
                    <button className="boton-accion editar" onClick={() => abrirModalEditar(usuario)}>
                      <FaEdit />
                    </button>
                    <button className="boton-accion eliminar" onClick={() => eliminarUsuario(usuario.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Usuario */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-encabezado">
              <h2>{usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="boton-cerrar" onClick={() => setMostrarModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={guardarUsuario} className="formulario-modal">
              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formUsuario.nombre}
                    onChange={(e) => setFormUsuario({...formUsuario, nombre: e.target.value})}
                    placeholder="Nombre"
                    required
                  />
                </div>
                <div className="campo-grupo">
                  <label>Apellido</label>
                  <input
                    type="text"
                    value={formUsuario.apellido}
                    onChange={(e) => setFormUsuario({...formUsuario, apellido: e.target.value})}
                    placeholder="Apellido"
                  />
                </div>
              </div>

              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Correo electrónico *</label>
                  <input
                    type="email"
                    value={formUsuario.email}
                    onChange={(e) => setFormUsuario({...formUsuario, email: e.target.value})}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                <div className="campo-grupo">
                  <label>{usuarioEditando ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</label>
                  <input
                    type="password"
                    value={formUsuario.password}
                    onChange={(e) => setFormUsuario({...formUsuario, password: e.target.value})}
                    placeholder="********"
                    required={!usuarioEditando}
                  />
                </div>
              </div>

              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Rol *</label>
                  <select
                    value={formUsuario.rol}
                    onChange={(e) => setFormUsuario({...formUsuario, rol: e.target.value})}
                  >
                    <option value="CLIENTE">Cliente</option>
                    <option value="AGENTE">Agente</option>
                    <option value="JEFE">Jefe</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div className="campo-grupo">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={formUsuario.telefono}
                    onChange={(e) => setFormUsuario({...formUsuario, telefono: e.target.value})}
                    placeholder="+507 6000-0000"
                  />
                </div>
              </div>

              {/* Campos adicionales para clientes */}
              {formUsuario.rol === 'CLIENTE' && (
                <>
                  <div className="campo-grupo">
                    <label>Empresa / Compañía</label>
                    <input
                      type="text"
                      value={formUsuario.empresa}
                      onChange={(e) => setFormUsuario({...formUsuario, empresa: e.target.value})}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div className="campo-grupo">
                    <label>Dirección</label>
                    <input
                      type="text"
                      value={formUsuario.direccion}
                      onChange={(e) => setFormUsuario({...formUsuario, direccion: e.target.value})}
                      placeholder="Dirección de la empresa"
                    />
                  </div>
                </>
              )}

              <div className="campo-grupo">
                <label>Estado</label>
                <select
                  value={formUsuario.activo}
                  onChange={(e) => setFormUsuario({...formUsuario, activo: e.target.value === 'true'})}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <div className="modal-acciones">
                <button type="button" className="boton-cancelar" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="boton-guardar" disabled={guardando}>
                  {guardando ? <FaSpinner className="spin" /> : <FaSave />}
                  {guardando ? 'Guardando...' : (usuarioEditando ? 'Guardar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListaUsuarios;