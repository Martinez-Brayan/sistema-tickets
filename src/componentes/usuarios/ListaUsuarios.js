import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserShield, FaUser, FaHeadset, FaBuilding, FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import { usuarioService } from '../../servicios/supabase';
import './ListaUsuarios.css';

function ListaUsuarios() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [vistaActual, setVistaActual] = useState('usuarios');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  // Modal states
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [mostrarModalEmpresa, setMostrarModalEmpresa] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [empresaEditando, setEmpresaEditando] = useState(null);

  // Datos de Supabase
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);

  // Formulario usuario
  const [formUsuario, setFormUsuario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'CLIENTE',
    departamentoId: '',
    activo: true
  });

  // Formulario empresa
  const [formEmpresa, setFormEmpresa] = useState({
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    correo: '',
    contactoPrincipal: '',
    activo: true
  });

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
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

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const nombreCompleto = `${usuario.nombre} ${usuario.apellido || ''}`.toLowerCase();
    const coincideBusqueda = nombreCompleto.includes(busqueda.toLowerCase()) ||
                            usuario.email?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === 'todos' || usuario.rol === filtroRol;
    return coincideBusqueda && coincideRol;
  });

  // Filtrar empresas
  const empresasFiltradas = empresas.filter(empresa => {
    return empresa.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
           empresa.ruc?.toLowerCase().includes(busqueda.toLowerCase());
  });

  // Abrir modal nuevo usuario
  const abrirModalNuevoUsuario = () => {
    setUsuarioEditando(null);
    setFormUsuario({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'CLIENTE',
      departamentoId: '',
      activo: true
    });
    setMostrarModalUsuario(true);
  };

  // Abrir modal editar usuario
  const abrirModalEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setFormUsuario({
      nombre: usuario.nombre,
      apellido: usuario.apellido || '',
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      departamentoId: usuario.departamentoId || '',
      activo: usuario.activo
    });
    setMostrarModalUsuario(true);
  };

  // Guardar usuario
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
        // Editar
        const datosActualizar = {
          nombre: formUsuario.nombre,
          apellido: formUsuario.apellido,
          email: formUsuario.email,
          rol: formUsuario.rol,
          activo: formUsuario.activo
        };
        
        // Solo actualizar password si se ingresó uno nuevo
        if (formUsuario.password) {
          datosActualizar.password = formUsuario.password;
        }

        await usuarioService.actualizar(usuarioEditando.id, datosActualizar);
      } else {
        // Nuevo
        await usuarioService.crear({
          nombre: formUsuario.nombre,
          apellido: formUsuario.apellido,
          email: formUsuario.email,
          password: formUsuario.password,
          rol: formUsuario.rol,
          activo: formUsuario.activo
        });
      }

      setMostrarModalUsuario(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;

    try {
      await usuarioService.eliminar(id);
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar usuario');
    }
  };

  // Abrir modal nueva empresa
  const abrirModalNuevaEmpresa = () => {
    setEmpresaEditando(null);
    setFormEmpresa({
      nombre: '',
      ruc: '',
      direccion: '',
      telefono: '',
      correo: '',
      contactoPrincipal: '',
      activo: true
    });
    setMostrarModalEmpresa(true);
  };

  // Abrir modal editar empresa
  const abrirModalEditarEmpresa = (empresa) => {
    setEmpresaEditando(empresa);
    setFormEmpresa({
      nombre: empresa.nombre,
      ruc: empresa.ruc || '',
      direccion: empresa.direccion || '',
      telefono: empresa.telefono || '',
      correo: empresa.correo || '',
      contactoPrincipal: empresa.contactoPrincipal || '',
      activo: empresa.activo
    });
    setMostrarModalEmpresa(true);
  };

  // Guardar empresa (por ahora local, falta tabla en Supabase)
  const guardarEmpresa = (e) => {
    e.preventDefault();
    
    if (!formEmpresa.nombre) {
      alert('Ingrese el nombre de la empresa');
      return;
    }

    if (empresaEditando) {
      setEmpresas(empresas.map(e => 
        e.id === empresaEditando.id ? { ...e, ...formEmpresa } : e
      ));
    } else {
      const nuevaEmpresa = {
        id: Date.now(),
        ...formEmpresa,
        fechaCreacion: new Date().toISOString()
      };
      setEmpresas([...empresas, nuevaEmpresa]);
    }

    setMostrarModalEmpresa(false);
  };

  // Eliminar empresa
  const eliminarEmpresa = (id) => {
    if (window.confirm('¿Eliminar esta empresa?')) {
      setEmpresas(empresas.filter(e => e.id !== id));
    }
  };

  // Obtener icono de rol
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

  // Obtener etiqueta de rol
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
      {/* Tabs */}
      <div className="usuarios-tabs">
        <button 
          className={vistaActual === 'usuarios' ? 'activo' : ''} 
          onClick={() => setVistaActual('usuarios')}
        >
          <FaUser /> Usuarios
        </button>
        <button 
          className={vistaActual === 'empresas' ? 'activo' : ''} 
          onClick={() => setVistaActual('empresas')}
        >
          <FaBuilding /> Empresas
        </button>
      </div>

      {/* Vista Usuarios */}
      {vistaActual === 'usuarios' && (
        <>
          <div className="usuarios-encabezado">
            <h1>Gestión de Usuarios</h1>
            <button className="boton-nuevo" onClick={abrirModalNuevoUsuario}>
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
              <button className="boton-nuevo" onClick={abrirModalNuevoUsuario}>
                <FaPlus /> Crear primer usuario
              </button>
            </div>
          ) : (
            <div className="usuarios-tabla-contenedor">
              <table className="usuarios-tabla">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Último Acceso</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(usuario => (
                    <tr key={usuario.id}>
                      <td>
                        <div className="usuario-info">
                          <div className="usuario-avatar">
                            {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
                          </div>
                          <div>
                            <div className="usuario-nombre">{usuario.nombre} {usuario.apellido}</div>
                            <div className="usuario-correo">{usuario.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="usuario-rol">
                          {obtenerIconoRol(usuario.rol)}
                          <span>{obtenerEtiquetaRol(usuario.rol)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`estado-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="fecha-acceso">
                        {usuario.ultimoAcceso 
                          ? new Date(usuario.ultimoAcceso).toLocaleDateString('es-ES')
                          : 'Nunca'
                        }
                      </td>
                      <td className="columna-acciones">
                        <button className="boton-accion editar" onClick={() => abrirModalEditarUsuario(usuario)}>
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
        </>
      )}

      {/* Vista Empresas */}
      {vistaActual === 'empresas' && (
        <>
          <div className="usuarios-encabezado">
            <h1>Gestión de Empresas</h1>
            <button className="boton-nuevo" onClick={abrirModalNuevaEmpresa}>
              <FaPlus /> Nueva Empresa
            </button>
          </div>

          <div className="usuarios-filtros">
            <div className="campo-busqueda">
              <FaSearch className="icono-busqueda" />
              <input
                type="text"
                placeholder="Buscar por nombre o RUC..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {empresas.length === 0 ? (
            <div className="sin-datos">
              <FaBuilding className="sin-datos-icono" />
              <p>No hay empresas registradas</p>
              <button className="boton-nuevo" onClick={abrirModalNuevaEmpresa}>
                <FaPlus /> Crear primera empresa
              </button>
            </div>
          ) : (
            <div className="usuarios-tabla-contenedor">
              <table className="usuarios-tabla">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>RUC</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empresasFiltradas.map(empresa => (
                    <tr key={empresa.id}>
                      <td>
                        <div className="usuario-info">
                          <div className="empresa-avatar"><FaBuilding /></div>
                          <div>
                            <div className="usuario-nombre">{empresa.nombre}</div>
                            <div className="usuario-correo">{empresa.correo}</div>
                          </div>
                        </div>
                      </td>
                      <td>{empresa.ruc || '-'}</td>
                      <td>{empresa.contactoPrincipal || '-'}</td>
                      <td>{empresa.telefono || '-'}</td>
                      <td>
                        <span className={`estado-badge ${empresa.activo ? 'activo' : 'inactivo'}`}>
                          {empresa.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="columna-acciones">
                        <button className="boton-accion editar" onClick={() => abrirModalEditarEmpresa(empresa)}>
                          <FaEdit />
                        </button>
                        <button className="boton-accion eliminar" onClick={() => eliminarEmpresa(empresa.id)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal Usuario */}
      {mostrarModalUsuario && (
        <div className="modal-overlay">
          <div className="modal-contenido modal-grande">
            <div className="modal-encabezado">
              <h2>{usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="boton-cerrar" onClick={() => setMostrarModalUsuario(false)}>
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
                  <label>Estado</label>
                  <select
                    value={formUsuario.activo}
                    onChange={(e) => setFormUsuario({...formUsuario, activo: e.target.value === 'true'})}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="modal-acciones">
                <button type="button" className="boton-cancelar" onClick={() => setMostrarModalUsuario(false)}>
                  Cancelar
                </button>
                <button type="submit" className="boton-guardar" disabled={guardando}>
                  {guardando ? <FaSpinner className="spin" /> : <FaSave />}
                  {guardando ? 'Guardando...' : (usuarioEditando ? 'Guardar Cambios' : 'Crear Usuario')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Empresa */}
      {mostrarModalEmpresa && (
        <div className="modal-overlay">
          <div className="modal-contenido modal-grande">
            <div className="modal-encabezado">
              <h2>{empresaEditando ? 'Editar Empresa' : 'Nueva Empresa'}</h2>
              <button className="boton-cerrar" onClick={() => setMostrarModalEmpresa(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={guardarEmpresa} className="formulario-modal">
              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Nombre de la empresa *</label>
                  <input
                    type="text"
                    value={formEmpresa.nombre}
                    onChange={(e) => setFormEmpresa({...formEmpresa, nombre: e.target.value})}
                    placeholder="Nombre comercial"
                    required
                  />
                </div>

                <div className="campo-grupo">
                  <label>RUC / NIT</label>
                  <input
                    type="text"
                    value={formEmpresa.ruc}
                    onChange={(e) => setFormEmpresa({...formEmpresa, ruc: e.target.value})}
                    placeholder="Número de identificación fiscal"
                  />
                </div>
              </div>

              <div className="campo-grupo">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formEmpresa.direccion}
                  onChange={(e) => setFormEmpresa({...formEmpresa, direccion: e.target.value})}
                  placeholder="Dirección de la empresa"
                />
              </div>

              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={formEmpresa.telefono}
                    onChange={(e) => setFormEmpresa({...formEmpresa, telefono: e.target.value})}
                    placeholder="+507 000-0000"
                  />
                </div>

                <div className="campo-grupo">
                  <label>Correo</label>
                  <input
                    type="email"
                    value={formEmpresa.correo}
                    onChange={(e) => setFormEmpresa({...formEmpresa, correo: e.target.value})}
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>

              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Contacto principal</label>
                  <input
                    type="text"
                    value={formEmpresa.contactoPrincipal}
                    onChange={(e) => setFormEmpresa({...formEmpresa, contactoPrincipal: e.target.value})}
                    placeholder="Nombre del contacto"
                  />
                </div>

                <div className="campo-grupo">
                  <label>Estado</label>
                  <select
                    value={formEmpresa.activo}
                    onChange={(e) => setFormEmpresa({...formEmpresa, activo: e.target.value === 'true'})}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="modal-acciones">
                <button type="button" className="boton-cancelar" onClick={() => setMostrarModalEmpresa(false)}>
                  Cancelar
                </button>
                <button type="submit" className="boton-guardar">
                  <FaSave /> {empresaEditando ? 'Guardar Cambios' : 'Crear Empresa'}
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