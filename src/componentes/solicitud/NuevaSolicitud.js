import React, { useState, useEffect } from 'react';
import { 
  FaPaperPlane, FaPaperclip, FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, 
  FaImage, FaTable, FaCode, FaExpand, FaSmile, FaPlus, FaTrash,
  FaCheckCircle, FaSpinner
} from 'react-icons/fa';
import { ticketService, categoriaService, archivoService } from '../../servicios/supabase';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import './NuevaSolicitud.css';

function NuevaSolicitud() {
  const { usuario } = useAutenticacion();
  
  const [formulario, setFormulario] = useState({
    titulo: '',
    departamento: '',
    tipoTicket: '',
    categoria: '',
    descripcion: '',
    prioridad: 'MEDIA'
  });

  const [categorias, setCategorias] = useState([]);
  const [anexos, setAnexos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [ticketCreado, setTicketCreado] = useState(null);
  const [error, setError] = useState('');
  const [progreso, setProgreso] = useState('');

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const data = await categoriaService.obtenerTodas();
      setCategorias(data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const departamentos = [
    { value: 'SOPORTE_TECNICO', label: 'Soporte Técnico' },
    { value: 'VENTAS', label: 'Ventas' },
    { value: 'ADMINISTRACION', label: 'Administración' },
    { value: 'RECURSOS_HUMANOS', label: 'Recursos Humanos' }
  ];

  const tiposTicket = [
    { value: 'INCIDENCIA', label: 'Incidencia' },
    { value: 'SOLICITUD', label: 'Solicitud' },
    { value: 'CONSULTA', label: 'Consulta' }
  ];

  const prioridades = [
    { value: 'BAJA', label: 'Baja' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'URGENTE', label: 'Urgente' }
  ];

  const seleccionarAnexo = (e) => {
    const archivos = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; 

    const nuevosAnexos = archivos
      .filter(archivo => {
        if (archivo.size > maxSize) {
          alert(`El archivo ${archivo.name} excede el límite de 10 MB`);
          return false;
        }
        return true;
      })
      .map(archivo => ({
        id: Date.now() + Math.random(),
        nombre: archivo.name,
        tamaño: archivo.size,
        archivo: archivo 
      }));

    setAnexos([...anexos, ...nuevosAnexos]);
    e.target.value = '';
  };

  const eliminarAnexo = (id) => {
    setAnexos(anexos.filter(a => a.id !== id));
  };

  const formatearTamaño = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validarFormulario = () => {
    if (!formulario.titulo.trim()) { setError('Ingrese un título'); return false; }
    if (!formulario.tipoTicket) { setError('Seleccione el tipo de ticket'); return false; }
    if (!formulario.departamento) { setError('Seleccione un departamento'); return false; }
    if (!formulario.descripcion.trim()) { setError('Ingrese una descripción'); return false; }
    setError('');
    return true;
  };

  const enviarTicket = async () => {
    if (!validarFormulario()) return;
    setEnviando(true);
    setError('');
    setProgreso('Creando ticket...');

    try {
      const datosTicket = {
        titulo: formulario.titulo,
        descripcion: formulario.descripcion,
        departamento: formulario.departamento,
        prioridad: formulario.prioridad,
        categoriaId: formulario.categoria || null,
        tipoTicket: formulario.tipoTicket
      };

      const ticketNuevo = await ticketService.crear(datosTicket, usuario.id);
      
      if (anexos.length > 0) {
        for (let i = 0; i < anexos.length; i++) {
          setProgreso(`Subiendo archivos (${i + 1}/${anexos.length})...`);
          await archivoService.subir(anexos[i].archivo, ticketNuevo.id);
        }
      }
      
      setTicketCreado(ticketNuevo);
      setEnviado(true);
    } catch (error) {
      setError('Error al crear el ticket: ' + error.message);
    } finally {
      setEnviando(false);
      setProgreso('');
    }
  };

  if (enviado && ticketCreado) {
    return (
      <div className="solicitud-enviada">
        <div className="confirmacion-card">
          <FaCheckCircle className="icono-exito" />
          <h2>¡Ticket Creado!</h2>
          <span className="numero-ticket">{ticketCreado.folio}</span>
          <p>Su solicitud ha sido registrada correctamente.</p>
          <button className="btn-nuevo" onClick={() => window.location.reload()}>
            <FaPlus /> Crear Nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nueva-solicitud">
      <div className="solicitud-header">
        <h1>Nuevo Ticket</h1>
        <button className="btn-enviar" onClick={enviarTicket} disabled={enviando}>
          {enviando ? <FaSpinner className="spin" /> : <FaPaperPlane />}
          {enviando ? 'Enviando...' : 'Enviar Ticket'}
        </button>
      </div>

      {error && <div className="error-mensaje">{error}</div>}
      {progreso && <div className="progreso-mensaje"><FaSpinner className="spin" /> {progreso}</div>}

      <div className="solicitud-formulario">
        <div className="formulario-seccion">
          <h3>Información General</h3>
          
          <div className="campos-grid">
            <div className="campo-grupo col-span-2">
              <label>Título del Problema (*)</label>
              <input 
                type="text" 
                value={formulario.titulo}
                onChange={(e) => setFormulario({...formulario, titulo: e.target.value})}
                placeholder="Ej: No funciona la impresora del segundo piso"
              />
            </div>

            <div className="campo-grupo">
              <label>Departamento (*)</label>
              <select value={formulario.departamento} onChange={(e) => setFormulario({...formulario, departamento: e.target.value})}>
                <option value="">-- Seleccionar --</option>
                {departamentos.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>

            <div className="campo-grupo">
              <label>Tipo (*)</label>
              <select value={formulario.tipoTicket} onChange={(e) => setFormulario({...formulario, tipoTicket: e.target.value})}>
                <option value="">-- Seleccionar --</option>
                {tiposTicket.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="campo-grupo">
              <label>Categoría</label>
              <select value={formulario.categoria} onChange={(e) => setFormulario({...formulario, categoria: e.target.value})}>
                <option value="">-- Seleccionar --</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div className="campo-grupo">
              <label>Prioridad</label>
              <select value={formulario.prioridad} onChange={(e) => setFormulario({...formulario, prioridad: e.target.value})}>
                {prioridades.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="campo-descripcion">
            <label>Descripción Detallada (*)</label>
            <div className="editor-toolbar">
              <button type="button"><FaBold /></button>
              <button type="button"><FaItalic /></button>
              <button type="button"><FaListUl /></button>
              <button type="button"><FaCode /></button>
            </div>
            <textarea 
              className="editor-texto"
              value={formulario.descripcion}
              onChange={(e) => setFormulario({...formulario, descripcion: e.target.value})}
              placeholder="Explique los detalles de su solicitud..."
            />
          </div>
        </div>

        <div className="formulario-seccion seccion-anexos">
          <h3>Archivos Adjuntos</h3>
          <div className="anexos-contenedor">
            {anexos.map(anexo => (
              <div key={anexo.id} className="anexo-item">
                <FaPaperclip />
                <span className="anexo-nombre">{anexo.nombre}</span>
                <span className="anexo-peso">{formatearTamaño(anexo.tamaño)}</span>
                <button onClick={() => eliminarAnexo(anexo.id)} className="btn-borrar-anexo"><FaTrash /></button>
              </div>
            ))}
            <label className="btn-subir-archivo">
              <FaPlus /> Añadir Archivo
              <input type="file" multiple onChange={seleccionarAnexo} hidden />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NuevaSolicitud;