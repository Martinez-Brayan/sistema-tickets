import React, { useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserShield, FaUser, FaHeadset, FaBuilding, FaTimes, FaSave } from 'react-icons/fa';
import './ListaUsuarios.css';

function ListaUsuarios() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [vistaActual, setVistaActual] = useState('usuarios');
  
  // Modal states
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [mostrarModalEmpresa, setMostrarModalEmpresa] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [empresaEditando, setEmpresaEditando] = useState(null);

  // Datos - estos vendran de Supabase
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);

  // Formulario usuario
  const [formUsuario, setFormUsuario] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    rol: 'cliente',
    empresaId: '',
    telefono: '',
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

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = usuario.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                            usuario.correo?.toLowerCase().includes(busqueda.toLowerCase());
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
      correo: '',
      contrasena: '',
      rol: 'cliente',
      empresaId: '',
      telefono: '',
      activo: true
    });
    setMostrarModalUsuario(true);
  };

  // Abrir modal editar usuario
  const abrirModalEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setFormUsuario({
      nombre: usuario.nombre,
      correo: usuario.correo,
      contrasena: '',
      rol: usuario.rol,
      empresaId: usuario.empresaId || '',
      telefono: usuario.telefono || '',
      activo: usuario.activo
    });
    setMostrarModalUsuario(true);
  };

  // Guardar usuario
  const guardarUsuario = (e) => {
    e.preventDefault();
    
    if (!formUsuario.nombre || !formUsuario.correo) {
      alert('Complete los campos obligatorios');
      return;
    }

    if (!usuarioEditando && !formUsuario.contrasena) {
      alert('Ingrese una contrasena');
      return;
    }

    if (usuarioEditando) {
      // Editar
      setUsuarios(usuarios.map(u => 
        u.id === usuarioEditando.id ? { ...u, ...formUsuario } : u
      ));
    } else {
      // Nuevo
      const nuevoUsuario = {
        id: Date.now(),
        ...formUsuario,
        fechaCreacion: new Date().toISOString()
      };
      setUsuarios([...usuarios, nuevoUsuario]);
    }

    setMostrarModalUsuario(false);
  };

  // Eliminar usuario
  const eliminarUsuario = (id) => {
    if (window.confirm('¿Eliminar este usuario?')) {
      setUsuarios(usuarios.filter(u => u.id !== id));
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

  // Guardar empresa
  const guardarEmpresa = (e) => {
    e.preventDefault();
    
    if (!formEmpresa.nombre) {
      alert('Ingrese el nombre de la empresa');
      return;
    }

    if (empresaEditando) {
      // Editar
      setEmpresas(empresas.map(e => 
        e.id === empresaEditando.id ? { ...e, ...formEmpresa } : e
      ));
    } else {
      // Nueva
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
    if (window.confirm('¿Eliminar esta empresa? Los usuarios asociados quedaran sin empresa.')) {
      setEmpresas(empresas.filter(e => e.id !== id));
    }
  };

  // Obtener icono de rol
  const obtenerIconoRol = (rol) => {
    switch (rol) {
      case 'administrador': return <FaUserShield className="icono-rol admin" />;
      case 'agente': return <FaHeadset className="icono-rol agente" />;
      case 'cliente': return <FaUser className="icono-rol cliente" />;
      default: return <FaUser className="icono-rol" />;
    }
  };

  // Obtener nombre de empresa
  const obtenerNombreEmpresa = (empresaId) => {
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa ? empresa.nombre : '-';
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
            <h1>Gestion de Usuarios</h1>
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
              <option value="administrador">Administrador</option>
              <option value="agente">Agente</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>

          {usuarios.length === 0 ? (
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
                    <th>Empresa</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(usuario => (
                    <tr key={usuario.id}>
                      <td>
                        <div className="usuario-info">
                          <div className="usuario-avatar">{usuario.nombre?.charAt(0)}</div>
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
                      <td>{obtenerNombreEmpresa(usuario.empresaId)}</td>
                      <td>
                        <span className={`estado-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
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
            <h1>Gestion de Empresas</h1>
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
                    <th>Telefono</th>
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
              <div className="campo-grupo">
                <label>Nombre completo *</label>
                <input
                  type="text"
                  value={formUsuario.nombre}
                  onChange={(e) => setFormUsuario({...formUsuario, nombre: e.target.value})}
                  placeholder="Nombre del usuario"
                  required
                />
              </div>

              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Correo electronico *</label>
                  <input
                    type="email"
                    value={formUsuario.correo}
                    onChange={(e) => setFormUsuario({...formUsuario, correo: e.target.value})}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="campo-grupo">
                  <label>{usuarioEditando ? 'Nueva contrasena (dejar vacio para no cambiar)' : 'Contrasena *'}</label>
                  <input
                    type="password"
                    value={formUsuario.contrasena}
                    onChange={(e) => setFormUsuario({...formUsuario, contrasena: e.target.value})}
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
                    <option value="cliente">Cliente</option>
                    <option value="agente">Agente</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div className="campo-grupo">
                  <label>Empresa</label>
                  <select
                    value={formUsuario.empresaId}
                    onChange={(e) => setFormUsuario({...formUsuario, empresaId: e.target.value})}
                  >
                    <option value="">Sin empresa</option>
                    {empresas.map(empresa => (
                      <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Telefono</label>
                  <input
                    type="text"
                    value={formUsuario.telefono}
                    onChange={(e) => setFormUsuario({...formUsuario, telefono: e.target.value})}
                    placeholder="+507 6000-0000"
                  />
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
                <button type="submit" className="boton-guardar">
                  <FaSave /> {usuarioEditando ? 'Guardar Cambios' : 'Crear Usuario'}
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
                    placeholder="Numero de identificacion fiscal"
                  />
                </div>
              </div>

              <div className="campo-grupo">
                <label>Direccion</label>
                <input
                  type="text"
                  value={formEmpresa.direccion}
                  onChange={(e) => setFormEmpresa({...formEmpresa, direccion: e.target.value})}
                  placeholder="Direccion de la empresa"
                />
              </div>

              <div className="campo-fila">
                <div className="campo-grupo">
                  <label>Telefono</label>
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