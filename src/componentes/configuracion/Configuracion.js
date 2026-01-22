import React, { useState } from 'react';
import { FaCog, FaBuilding, FaClock, FaEnvelope, FaShieldAlt, FaSave, FaEdit } from 'react-icons/fa';
import './Configuracion.css';

function Configuracion() {
  const [seccionActiva, setSeccionActiva] = useState('general');

  // Estados para configuracion general
  const [configGeneral, setConfigGeneral] = useState({
    nombreEmpresa: 'Mi Empresa S.A.',
    correoSoporte: 'soporte@miempresa.com',
    telefonoSoporte: '+507 123-4567',
    horarioAtencion: '8:00 AM - 5:00 PM',
    diasLaborales: 'Lunes a Viernes',
    zonaHoraria: 'America/Panama'
  });

  // Estados para prioridades
  const [prioridades] = useState([
    { id: 1, nombre: 'Alta', tiempoRespuesta: '2 horas', tiempoResolucion: '8 horas', color: '#e74c3c' },
    { id: 2, nombre: 'Media', tiempoRespuesta: '4 horas', tiempoResolucion: '24 horas', color: '#f39c12' },
    { id: 3, nombre: 'Baja', tiempoRespuesta: '8 horas', tiempoResolucion: '48 horas', color: '#27ae60' }
  ]);

  // Estados para roles
  const [roles] = useState([
    { id: 1, nombre: 'Administrador', permisos: ['todo'], descripcion: 'Acceso completo al sistema' },
    { id: 2, nombre: 'Agente', permisos: ['tickets', 'chat', 'calendario'], descripcion: 'Atencion de tickets y chat' },
    { id: 3, nombre: 'Cliente', permisos: ['mis-tickets', 'chat'], descripcion: 'Crear y ver sus tickets' }
  ]);

  // Estados para notificaciones
  const [configNotificaciones, setConfigNotificaciones] = useState({
    emailNuevoTicket: true,
    emailTicketAsignado: true,
    emailTicketResuelto: true,
    emailComentario: false,
    recordatorioTicketPendiente: true,
    diasRecordatorio: 3
  });

  // Guardar configuracion general
  const guardarConfigGeneral = () => {
    alert('Configuracion general guardada correctamente');
  };

  // Guardar notificaciones
  const guardarNotificaciones = () => {
    alert('Configuracion de notificaciones guardada correctamente');
  };

  return (
    <div className="configuracion-contenedor">
      {/* Menu lateral */}
      <div className="config-menu">
        <h2><FaCog /> Configuracion</h2>
        <nav>
          <button 
            className={seccionActiva === 'general' ? 'activo' : ''} 
            onClick={() => setSeccionActiva('general')}
          >
            <FaBuilding /> General
          </button>
          <button 
            className={seccionActiva === 'prioridades' ? 'activo' : ''} 
            onClick={() => setSeccionActiva('prioridades')}
          >
            <FaClock /> Prioridades y SLA
          </button>
          <button 
            className={seccionActiva === 'roles' ? 'activo' : ''} 
            onClick={() => setSeccionActiva('roles')}
          >
            <FaShieldAlt /> Roles y Permisos
          </button>
          <button 
            className={seccionActiva === 'notificaciones' ? 'activo' : ''} 
            onClick={() => setSeccionActiva('notificaciones')}
          >
            <FaEnvelope /> Notificaciones
          </button>
        </nav>
      </div>

      {/* Contenido */}
      <div className="config-contenido">
        {/* Seccion General */}
        {seccionActiva === 'general' && (
          <div className="config-seccion">
            <h3><FaBuilding /> Configuracion General</h3>
            <p className="seccion-descripcion">Informacion basica de la empresa y el sistema de soporte.</p>
            
            <div className="formulario-config">
              <div className="campo-config">
                <label>Nombre de la Empresa</label>
                <input 
                  type="text" 
                  value={configGeneral.nombreEmpresa}
                  onChange={(e) => setConfigGeneral({...configGeneral, nombreEmpresa: e.target.value})}
                />
              </div>

              <div className="campo-config">
                <label>Correo de Soporte</label>
                <input 
                  type="email" 
                  value={configGeneral.correoSoporte}
                  onChange={(e) => setConfigGeneral({...configGeneral, correoSoporte: e.target.value})}
                />
              </div>

              <div className="campo-config">
                <label>Telefono de Soporte</label>
                <input 
                  type="text" 
                  value={configGeneral.telefonoSoporte}
                  onChange={(e) => setConfigGeneral({...configGeneral, telefonoSoporte: e.target.value})}
                />
              </div>

              <div className="campo-fila">
                <div className="campo-config">
                  <label>Horario de Atencion</label>
                  <input 
                    type="text" 
                    value={configGeneral.horarioAtencion}
                    onChange={(e) => setConfigGeneral({...configGeneral, horarioAtencion: e.target.value})}
                  />
                </div>

                <div className="campo-config">
                  <label>Dias Laborales</label>
                  <input 
                    type="text" 
                    value={configGeneral.diasLaborales}
                    onChange={(e) => setConfigGeneral({...configGeneral, diasLaborales: e.target.value})}
                  />
                </div>
              </div>

              <div className="campo-config">
                <label>Zona Horaria</label>
                <select 
                  value={configGeneral.zonaHoraria}
                  onChange={(e) => setConfigGeneral({...configGeneral, zonaHoraria: e.target.value})}
                >
                  <option value="America/Panama">America/Panama (UTC-5)</option>
                  <option value="America/Bogota">America/Bogota (UTC-5)</option>
                  <option value="America/Mexico_City">America/Mexico City (UTC-6)</option>
                  <option value="America/New_York">America/New York (UTC-5)</option>
                </select>
              </div>

              <button className="boton-guardar" onClick={guardarConfigGeneral}>
                <FaSave /> Guardar Cambios
              </button>
            </div>
          </div>
        )}

        {/* Seccion Prioridades */}
        {seccionActiva === 'prioridades' && (
          <div className="config-seccion">
            <h3><FaClock /> Prioridades y SLA</h3>
            <p className="seccion-descripcion">Define los tiempos de respuesta y resolucion segun la prioridad.</p>

            <div className="lista-items">
              {prioridades.map(prioridad => (
                <div key={prioridad.id} className="item-config prioridad-item">
                  <div className="prioridad-color" style={{ background: prioridad.color }}></div>
                  <div className="item-info">
                    <h4>{prioridad.nombre}</h4>
                    <div className="prioridad-tiempos">
                      <span>Respuesta: <strong>{prioridad.tiempoRespuesta}</strong></span>
                      <span>Resolucion: <strong>{prioridad.tiempoResolucion}</strong></span>
                    </div>
                  </div>
                  <button className="boton-editar">
                    <FaEdit />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seccion Roles */}
        {seccionActiva === 'roles' && (
          <div className="config-seccion">
            <h3><FaShieldAlt /> Roles y Permisos</h3>
            <p className="seccion-descripcion">Configura los roles del sistema y sus permisos.</p>

            <div className="lista-items">
              {roles.map(rol => (
                <div key={rol.id} className="item-config rol-item">
                  <div className="item-info">
                    <h4>{rol.nombre}</h4>
                    <p>{rol.descripcion}</p>
                    <div className="permisos-lista">
                      {rol.permisos.map((permiso, index) => (
                        <span key={index} className="permiso-badge">{permiso}</span>
                      ))}
                    </div>
                  </div>
                  <button className="boton-editar">
                    <FaEdit />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seccion Notificaciones */}
        {seccionActiva === 'notificaciones' && (
          <div className="config-seccion">
            <h3><FaEnvelope /> Configuracion de Notificaciones</h3>
            <p className="seccion-descripcion">Define cuando se envian notificaciones por correo.</p>

            <div className="formulario-config">
              <div className="grupo-opciones">
                <h4>Notificaciones por Correo</h4>
                
                <label className="opcion-check">
                  <input 
                    type="checkbox" 
                    checked={configNotificaciones.emailNuevoTicket}
                    onChange={(e) => setConfigNotificaciones({...configNotificaciones, emailNuevoTicket: e.target.checked})}
                  />
                  <span>Enviar correo cuando se crea un nuevo ticket</span>
                </label>

                <label className="opcion-check">
                  <input 
                    type="checkbox" 
                    checked={configNotificaciones.emailTicketAsignado}
                    onChange={(e) => setConfigNotificaciones({...configNotificaciones, emailTicketAsignado: e.target.checked})}
                  />
                  <span>Enviar correo al agente cuando se le asigna un ticket</span>
                </label>

                <label className="opcion-check">
                  <input 
                    type="checkbox" 
                    checked={configNotificaciones.emailTicketResuelto}
                    onChange={(e) => setConfigNotificaciones({...configNotificaciones, emailTicketResuelto: e.target.checked})}
                  />
                  <span>Enviar correo al cliente cuando su ticket es resuelto</span>
                </label>

                <label className="opcion-check">
                  <input 
                    type="checkbox" 
                    checked={configNotificaciones.emailComentario}
                    onChange={(e) => setConfigNotificaciones({...configNotificaciones, emailComentario: e.target.checked})}
                  />
                  <span>Enviar correo cuando hay un nuevo comentario</span>
                </label>
              </div>

              <div className="grupo-opciones">
                <h4>Recordatorios</h4>
                
                <label className="opcion-check">
                  <input 
                    type="checkbox" 
                    checked={configNotificaciones.recordatorioTicketPendiente}
                    onChange={(e) => setConfigNotificaciones({...configNotificaciones, recordatorioTicketPendiente: e.target.checked})}
                  />
                  <span>Enviar recordatorio de tickets pendientes</span>
                </label>

                {configNotificaciones.recordatorioTicketPendiente && (
                  <div className="campo-config inline">
                    <label>Enviar recordatorio despues de</label>
                    <input 
                      type="number" 
                      value={configNotificaciones.diasRecordatorio}
                      onChange={(e) => setConfigNotificaciones({...configNotificaciones, diasRecordatorio: parseInt(e.target.value)})}
                      min="1"
                      max="30"
                    />
                    <span>dias sin actividad</span>
                  </div>
                )}
              </div>

              <button className="boton-guardar" onClick={guardarNotificaciones}>
                <FaSave /> Guardar Cambios
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Configuracion;