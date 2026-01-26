import React, { useState, useEffect } from 'react';
import { 
  FaArrowLeft, FaSave, FaPaperPlane, FaEnvelope, FaClock, FaUser, FaBuilding, 
  FaPhone, FaAt, FaHistory, FaPaperclip, FaBold, FaItalic, FaUnderline, 
  FaStrikethrough, FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaLink, FaImage, FaTable, FaCode, FaExpand, FaSmile, FaTimes, FaPlus, FaTrash,
  FaEye, FaEyeSlash, FaSpinner
} from 'react-icons/fa';
import { comentarioService, ticketService } from '../../servicios/supabase';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import './DetalleTicket.css';

function DetalleTicket({ ticket, onVolver, esCliente = false }) {
  const { usuario } = useAutenticacion();
  const [tabActiva, setTabActiva] = useState('historial');
  const [comentarios, setComentarios] = useState([]);
  const [cargandoComentarios, setCargandoComentarios] = useState(true);
  const [enviando, setEnviando] = useState(false);
  
  const [nuevoMensaje, setNuevoMensaje] = useState({
    contenido: '',
    esInterno: false,
    notificarCorreo: false
  });

  const [anexos, setAnexos] = useState([]);
  const [filtroHistorial, setFiltroHistorial] = useState('todos');

  const [datosTicket, setDatosTicket] = useState({
    id: ticket?.id || '',
    folio: ticket?.folio || '',
    asunto: ticket?.asunto || '',
    descripcion: ticket?.descripcion || '',
    prioridad: ticket?.prioridad || 'MEDIA',
    estado: ticket?.estado || 'ABIERTO',
    fechaCreacion: ticket?.fechaCreacion || '',
    fechaActualizacion: ticket?.fechaActualizacion || '',
    creador: ticket?.creador || null,
    agente: ticket?.agente || null,
    categoria: ticket?.categoria || null
  });

  // Cargar comentarios al montar
  useEffect(() => {
    cargarComentarios();
    
    // Suscribirse a nuevos comentarios en tiempo real
    const subscription = comentarioService.suscribirCambios(ticket.id, (payload) => {
      if (payload.new) {
        // Recargar comentarios cuando hay uno nuevo
        cargarComentarios();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [ticket.id]);

  const cargarComentarios = async () => {
    try {
      setCargandoComentarios(true);
      const data = await comentarioService.obtenerPorTicket(ticket.id);
      setComentarios(data || []);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setCargandoComentarios(false);
    }
  };

  // Enviar comentario
  const enviarComentario = async () => {
    if (!nuevoMensaje.contenido.trim()) {
      alert('Escriba un mensaje');
      return;
    }

    setEnviando(true);

    try {
      await comentarioService.crear({
        contenido: nuevoMensaje.contenido,
        esInterno: nuevoMensaje.esInterno,
        ticketId: ticket.id
      }, usuario.id);

      // Limpiar formulario
      setNuevoMensaje({
        contenido: '',
        esInterno: false,
        notificarCorreo: false
      });
      setAnexos([]);

      // Recargar comentarios
      await cargarComentarios();

    } catch (error) {
      console.error('Error al enviar comentario:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  };

  // Actualizar estado del ticket
  const actualizarEstado = async (nuevoEstado) => {
    try {
      await ticketService.actualizar(ticket.id, { estado: nuevoEstado });
      setDatosTicket({ ...datosTicket, estado: nuevoEstado });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  // Subir anexo (local por ahora)
  const subirAnexo = (e) => {
    const archivos = Array.from(e.target.files);
    const nuevosAnexos = archivos.map(archivo => ({
      id: Date.now() + Math.random(),
      nombre: archivo.name,
      tamaño: archivo.size,
      publico: true
    }));
    setAnexos([...anexos, ...nuevosAnexos]);
  };

  const eliminarAnexo = (id) => setAnexos(anexos.filter(a => a.id !== id));
  const togglePublicoAnexo = (id) => setAnexos(anexos.map(a => a.id === id ? { ...a, publico: !a.publico } : a));

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatearTamaño = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Filtrar comentarios
  const comentariosFiltrados = comentarios.filter(c => {
    if (filtroHistorial === 'todos') return true;
    if (filtroHistorial === 'publicos') return !c.esInterno;
    if (filtroHistorial === 'internos') return c.esInterno;
    return true;
  });

  // Obtener clase según rol del autor
  const getClaseAutor = (rol) => {
    if (rol === 'CLIENTE') return 'autor-cliente';
    if (rol === 'AGENTE') return 'autor-agente';
    if (rol === 'ADMIN' || rol === 'JEFE') return 'autor-admin';
    return '';
  };

  return (
    <div className="detalle-ticket">
      {/* Header */}
      <div className="detalle-header">
        <div className="header-izquierda">
          <button className="boton-volver" onClick={onVolver}><FaArrowLeft /></button>
          <span className="ticket-numero">{datosTicket.folio}</span>
          <h1 className="ticket-titulo-header">{datosTicket.asunto}</h1>
        </div>
        <div className="header-derecha">
          {!esCliente && (
            <div className="header-campo">
              <label>Estado:</label>
              <select 
                value={datosTicket.estado} 
                onChange={(e) => actualizarEstado(e.target.value)}
              >
                <option value="ABIERTO">Abierto</option>
                <option value="EN_PROGRESO">En Progreso</option>
                <option value="EN_ESPERA">En Espera</option>
                <option value="RESUELTO">Resuelto</option>
                <option value="CERRADO">Cerrado</option>
              </select>
            </div>
          )}
          <button className="boton-icono cerrar" title="Cerrar" onClick={onVolver}><FaTimes /></button>
        </div>
      </div>

      {/* Contenido */}
      <div className="detalle-contenido">
        {/* Panel izquierdo - Info del cliente */}
        <div className="panel-cliente">
          <div className="cliente-info">
            <div className="cliente-avatar"><FaBuilding /></div>
            <div className="cliente-datos">
              <h3>{datosTicket.creador?.nombre} {datosTicket.creador?.apellido}</h3>
              <p><FaAt /> {datosTicket.creador?.email || '-'}</p>
            </div>
          </div>
          
          <div className="ticket-info-lateral">
            <div className="info-item">
              <label>Estado</label>
              <span className={`badge-estado estado-${datosTicket.estado?.toLowerCase()}`}>
                {datosTicket.estado?.replace('_', ' ')}
              </span>
            </div>
            <div className="info-item">
              <label>Prioridad</label>
              <span className={`badge-prioridad prioridad-${datosTicket.prioridad?.toLowerCase()}`}>
                {datosTicket.prioridad}
              </span>
            </div>
            <div className="info-item">
              <label>Agente</label>
              <span>{datosTicket.agente ? `${datosTicket.agente.nombre} ${datosTicket.agente.apellido}` : 'Sin asignar'}</span>
            </div>
            <div className="info-item">
              <label>Creado</label>
              <span>{formatearFecha(datosTicket.fechaCreacion)}</span>
            </div>
          </div>
        </div>

        {/* Panel central */}
        <div className="panel-central">
          {/* Descripción del ticket */}
          <div className="ticket-descripcion-box">
            <h3>Descripción</h3>
            <p>{datosTicket.descripcion || 'Sin descripción'}</p>
          </div>

          {/* Tabs */}
          <div className="ticket-tabs">
            <button 
              className={tabActiva === 'historial' ? 'activo' : ''} 
              onClick={() => setTabActiva('historial')}
            >
              <FaHistory /> Conversación
            </button>
            <button 
              className={tabActiva === 'datos' ? 'activo' : ''} 
              onClick={() => setTabActiva('datos')}
            >
              Detalles
            </button>
          </div>

          {/* Contenido de tabs */}
          <div className="chat-layout">
            {tabActiva === 'historial' && (
              <div className="chat-contenedor">
                {/* Historial de comentarios */}
                <div className="chat-mensajes">
                  {!esCliente && (
                    <div className="filtro-comentarios">
                      <select value={filtroHistorial} onChange={(e) => setFiltroHistorial(e.target.value)}>
                        <option value="todos">Todos los mensajes</option>
                        <option value="publicos">Solo públicos</option>
                        <option value="internos">Solo internos</option>
                      </select>
                    </div>
                  )}

                  {cargandoComentarios ? (
                    <div className="cargando-comentarios">
                      <FaSpinner className="spin" /> Cargando mensajes...
                    </div>
                  ) : comentariosFiltrados.length === 0 ? (
                    <div className="sin-comentarios">
                      <p>No hay mensajes aún</p>
                      <p className="subtexto">Sé el primero en escribir</p>
                    </div>
                  ) : (
                    <div className="lista-comentarios">
                      {comentariosFiltrados.map(comentario => (
                        <div 
                          key={comentario.id} 
                          className={`comentario-item ${getClaseAutor(comentario.autor?.rol)} ${comentario.esInterno ? 'interno' : ''}`}
                        >
                          <div className="comentario-header">
                            <span className="comentario-autor">
                              {comentario.autor?.nombre} {comentario.autor?.apellido}
                            </span>
                            <span className="comentario-rol">
                              {comentario.autor?.rol}
                            </span>
                            {comentario.esInterno && (
                              <span className="badge-interno">INTERNO</span>
                            )}
                            <span className="comentario-fecha">
                              {formatearFecha(comentario.fechaCreacion)}
                            </span>
                          </div>
                          <div className="comentario-contenido">
                            {comentario.contenido}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formulario nuevo mensaje */}
                <div className="nuevo-mensaje">
                  <textarea 
                    placeholder="Escriba su mensaje..."
                    value={nuevoMensaje.contenido}
                    onChange={(e) => setNuevoMensaje({...nuevoMensaje, contenido: e.target.value})}
                    rows="3"
                    disabled={enviando}
                  />
                  
                  <div className="mensaje-opciones">
                    <div className="opciones-izquierda">
                      {!esCliente && (
                        <label className="opcion-checkbox">
                          <input 
                            type="checkbox" 
                            checked={nuevoMensaje.esInterno}
                            onChange={(e) => setNuevoMensaje({...nuevoMensaje, esInterno: e.target.checked})}
                          />
                          Nota interna
                        </label>
                      )}
                      <label className="btn-anexo">
                        <FaPaperclip /> Adjuntar
                        <input type="file" multiple onChange={subirAnexo} hidden />
                      </label>
                    </div>
                    
                    <button 
                      className="btn-enviar-mensaje" 
                      onClick={enviarComentario}
                      disabled={enviando || !nuevoMensaje.contenido.trim()}
                    >
                      {enviando ? <FaSpinner className="spin" /> : <FaPaperPlane />}
                      {enviando ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>

                  {/* Anexos */}
                  {anexos.length > 0 && (
                    <div className="anexos-preview">
                      {anexos.map(a => (
                        <div key={a.id} className="anexo-item">
                          <FaPaperclip /> {a.nombre}
                          <button onClick={() => eliminarAnexo(a.id)}><FaTimes /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tabActiva === 'datos' && (
              <div className="datos-ticket">
                <div className="datos-seccion">
                  <h4>Información del ticket</h4>
                  <div className="datos-grid">
                    <div className="dato-item">
                      <label>Folio</label>
                      <span>{datosTicket.folio}</span>
                    </div>
                    <div className="dato-item">
                      <label>Estado</label>
                      <span>{datosTicket.estado}</span>
                    </div>
                    <div className="dato-item">
                      <label>Prioridad</label>
                      <span>{datosTicket.prioridad}</span>
                    </div>
                    <div className="dato-item">
                      <label>Categoría</label>
                      <span>{datosTicket.categoria?.nombre || '-'}</span>
                    </div>
                    <div className="dato-item">
                      <label>Fecha creación</label>
                      <span>{formatearFecha(datosTicket.fechaCreacion)}</span>
                    </div>
                    <div className="dato-item">
                      <label>Última actualización</label>
                      <span>{formatearFecha(datosTicket.fechaActualizacion)}</span>
                    </div>
                  </div>
                </div>

                <div className="datos-seccion">
                  <h4>Cliente</h4>
                  <div className="datos-grid">
                    <div className="dato-item">
                      <label>Nombre</label>
                      <span>{datosTicket.creador?.nombre} {datosTicket.creador?.apellido}</span>
                    </div>
                    <div className="dato-item">
                      <label>Email</label>
                      <span>{datosTicket.creador?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="datos-seccion">
                  <h4>Agente asignado</h4>
                  <div className="datos-grid">
                    <div className="dato-item">
                      <label>Nombre</label>
                      <span>{datosTicket.agente ? `${datosTicket.agente.nombre} ${datosTicket.agente.apellido}` : 'Sin asignar'}</span>
                    </div>
                    <div className="dato-item">
                      <label>Email</label>
                      <span>{datosTicket.agente?.email || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleTicket;