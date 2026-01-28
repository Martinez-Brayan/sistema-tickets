import React, { useState, useEffect } from 'react';
import { 
  FaArrowLeft, FaPaperPlane, FaClock, FaBuilding, 
  FaAt, FaHistory, FaPaperclip, FaTimes, FaSpinner,
  FaDownload, FaTrash, FaFile, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel
} from 'react-icons/fa';
import { comentarioService, ticketService, archivoService } from '../../servicios/supabase';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import './DetalleTicket.css';

function DetalleTicket({ ticket, onVolver, esCliente = false }) {
  const { usuario } = useAutenticacion();
  const [tabActiva, setTabActiva] = useState('historial');
  const [comentarios, setComentarios] = useState([]);
  const [adjuntos, setAdjuntos] = useState([]);
  const [cargandoComentarios, setCargandoComentarios] = useState(true);
  const [cargandoAdjuntos, setCargandoAdjuntos] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  
  const [nuevoMensaje, setNuevoMensaje] = useState({
    contenido: '',
    esInterno: false
  });

  const [archivosParaSubir, setArchivosParaSubir] = useState([]);
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

  // Cargar comentarios y adjuntos al montar
  useEffect(() => {
    cargarComentarios();
    cargarAdjuntos();
    
    const subscription = comentarioService.suscribirCambios(ticket.id, (payload) => {
      if (payload.new) {
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

  const cargarAdjuntos = async () => {
    try {
      setCargandoAdjuntos(true);
      const data = await archivoService.obtenerPorTicket(ticket.id);
      setAdjuntos(data || []);
    } catch (error) {
      console.error('Error al cargar adjuntos:', error);
    } finally {
      setCargandoAdjuntos(false);
    }
  };

  // Enviar comentario
  const enviarComentario = async () => {
    if (!nuevoMensaje.contenido.trim() && archivosParaSubir.length === 0) {
      alert('Escriba un mensaje o adjunte un archivo');
      return;
    }

    setEnviando(true);

    try {
      // Subir archivos primero
      if (archivosParaSubir.length > 0) {
        setSubiendoArchivo(true);
        for (const archivo of archivosParaSubir) {
          await archivoService.subir(archivo, ticket.id);
        }
        setSubiendoArchivo(false);
        await cargarAdjuntos();
      }

      // Crear comentario si hay contenido
      if (nuevoMensaje.contenido.trim()) {
        await comentarioService.crear({
          contenido: nuevoMensaje.contenido,
          esInterno: nuevoMensaje.esInterno,
          ticketId: ticket.id
        }, usuario.id);
      }

      // Limpiar formulario
      setNuevoMensaje({ contenido: '', esInterno: false });
      setArchivosParaSubir([]);
      await cargarComentarios();

    } catch (error) {
      console.error('Error al enviar:', error);
      alert('Error al enviar: ' + error.message);
    } finally {
      setEnviando(false);
      setSubiendoArchivo(false);
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

  // Seleccionar archivos para subir
  const seleccionarArchivos = (e) => {
    const archivos = Array.from(e.target.files);
    // Validar tamaño (máx 10MB por archivo)
    const archivosValidos = archivos.filter(a => {
      if (a.size > 10 * 1024 * 1024) {
        alert(`El archivo ${a.name} excede el límite de 10MB`);
        return false;
      }
      return true;
    });
    setArchivosParaSubir([...archivosParaSubir, ...archivosValidos]);
  };

  const eliminarArchivoParaSubir = (index) => {
    setArchivosParaSubir(archivosParaSubir.filter((_, i) => i !== index));
  };

  // Eliminar adjunto de Supabase
  const eliminarAdjunto = async (adjunto) => {
    if (!window.confirm('¿Eliminar este archivo?')) return;
    
    try {
      await archivoService.eliminar(adjunto.id, adjunto.url);
      await cargarAdjuntos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar archivo');
    }
  };

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
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Obtener icono según tipo de archivo
  const getIconoArchivo = (tipo) => {
    if (!tipo) return <FaFile />;
    if (tipo.includes('pdf')) return <FaFilePdf className="icono-pdf" />;
    if (tipo.includes('image')) return <FaFileImage className="icono-imagen" />;
    if (tipo.includes('word') || tipo.includes('document')) return <FaFileWord className="icono-word" />;
    if (tipo.includes('excel') || tipo.includes('sheet')) return <FaFileExcel className="icono-excel" />;
    return <FaFile />;
  };

  // Filtrar comentarios
  const comentariosFiltrados = comentarios.filter(c => {
    if (filtroHistorial === 'todos') return true;
    if (filtroHistorial === 'publicos') return !c.esInterno;
    if (filtroHistorial === 'internos') return c.esInterno;
    return true;
  });

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
        {/* Panel izquierdo */}
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

          {/* Adjuntos en panel lateral */}
          <div className="adjuntos-lateral">
            <h4><FaPaperclip /> Archivos adjuntos ({adjuntos.length})</h4>
            {cargandoAdjuntos ? (
              <p className="cargando-mini"><FaSpinner className="spin" /> Cargando...</p>
            ) : adjuntos.length === 0 ? (
              <p className="sin-adjuntos">Sin archivos adjuntos</p>
            ) : (
              <div className="lista-adjuntos">
                {adjuntos.map(adj => (
                  <div key={adj.id} className="adjunto-item">
                    {getIconoArchivo(adj.tipo)}
                    <div className="adjunto-info">
                      <a href={adj.url} target="_blank" rel="noopener noreferrer" title={adj.nombre}>
                        {adj.nombre.length > 20 ? adj.nombre.substring(0, 20) + '...' : adj.nombre}
                      </a>
                      <span className="adjunto-tamaño">{formatearTamaño(adj.tamaño)}</span>
                    </div>
                    <div className="adjunto-acciones">
                      <a href={adj.url} download className="btn-descargar" title="Descargar">
                        <FaDownload />
                      </a>
                      {!esCliente && (
                        <button onClick={() => eliminarAdjunto(adj)} className="btn-eliminar-adj" title="Eliminar">
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel central */}
        <div className="panel-central">
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

          <div className="chat-layout">
            {tabActiva === 'historial' && (
              <div className="chat-contenedor">
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
                            <span className="comentario-rol">{comentario.autor?.rol}</span>
                            {comentario.esInterno && <span className="badge-interno">INTERNO</span>}
                            <span className="comentario-fecha">{formatearFecha(comentario.fechaCreacion)}</span>
                          </div>
                          <div className="comentario-contenido">{comentario.contenido}</div>
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
                        <input type="file" multiple onChange={seleccionarArchivos} hidden />
                      </label>
                    </div>
                    
                    <button 
                      className="btn-enviar-mensaje" 
                      onClick={enviarComentario}
                      disabled={enviando || (!nuevoMensaje.contenido.trim() && archivosParaSubir.length === 0)}
                    >
                      {enviando ? <FaSpinner className="spin" /> : <FaPaperPlane />}
                      {subiendoArchivo ? 'Subiendo...' : enviando ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>

                  {/* Archivos por subir */}
                  {archivosParaSubir.length > 0 && (
                    <div className="archivos-preview">
                      {archivosParaSubir.map((archivo, index) => (
                        <div key={index} className="archivo-preview-item">
                          {getIconoArchivo(archivo.type)}
                          <span>{archivo.name}</span>
                          <span className="archivo-tamaño">({formatearTamaño(archivo.size)})</span>
                          <button onClick={() => eliminarArchivoParaSubir(index)}><FaTimes /></button>
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
                    <div className="dato-item"><label>Folio</label><span>{datosTicket.folio}</span></div>
                    <div className="dato-item"><label>Estado</label><span>{datosTicket.estado}</span></div>
                    <div className="dato-item"><label>Prioridad</label><span>{datosTicket.prioridad}</span></div>
                    <div className="dato-item"><label>Categoría</label><span>{datosTicket.categoria?.nombre || '-'}</span></div>
                    <div className="dato-item"><label>Fecha creación</label><span>{formatearFecha(datosTicket.fechaCreacion)}</span></div>
                    <div className="dato-item"><label>Última actualización</label><span>{formatearFecha(datosTicket.fechaActualizacion)}</span></div>
                  </div>
                </div>

                <div className="datos-seccion">
                  <h4>Cliente</h4>
                  <div className="datos-grid">
                    <div className="dato-item"><label>Nombre</label><span>{datosTicket.creador?.nombre} {datosTicket.creador?.apellido}</span></div>
                    <div className="dato-item"><label>Email</label><span>{datosTicket.creador?.email}</span></div>
                  </div>
                </div>

                <div className="datos-seccion">
                  <h4>Agente asignado</h4>
                  <div className="datos-grid">
                    <div className="dato-item"><label>Nombre</label><span>{datosTicket.agente ? `${datosTicket.agente.nombre} ${datosTicket.agente.apellido}` : 'Sin asignar'}</span></div>
                    <div className="dato-item"><label>Email</label><span>{datosTicket.agente?.email || '-'}</span></div>
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