import React, { useState, useEffect } from 'react';
import { 
  FaPaperPlane, FaPaperclip, FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, 
  FaImage, FaTable, FaCode, FaExpand, FaSmile, FaPlus, FaTrash,
  FaCheckCircle, FaSpinner
} from 'react-icons/fa';
import { ticketService, categoriaService } from '../../servicios/supabase';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import './NuevaSolicitud.css';

function NuevaSolicitud() {
  const { usuario } = useAutenticacion();
  
  const [formulario, setFormulario] = useState({
    titulo: '',
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

  // Cargar categorías de Supabase
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

  // Tipos de ticket
  const tiposTicket = [
    { value: 'INCIDENCIA', label: 'Incidencia' },
    { value: 'SOLICITUD', label: 'Solicitud' },
    { value: 'CONSULTA', label: 'Consulta' }
  ];

  // Prioridades
  const prioridades = [
    { value: 'BAJA', label: 'Baja' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'URGENTE', label: 'Urgente' }
  ];

  // Subir anexo
  const subirAnexo = (e) => {
    const archivos = Array.from(e.target.files);
    const maxSize = 8 * 1024 * 1024;

    const nuevosAnexos = archivos
      .filter(archivo => {
        if (archivo.size > maxSize) {
          alert(`El archivo ${archivo.name} excede el límite de 8 MB`);
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

  // Eliminar anexo
  const eliminarAnexo = (id) => {
    setAnexos(anexos.filter(a => a.id !== id));
  };

  // Formatear tamaño
  const formatearTamaño = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Validar formulario
  const validarFormulario = () => {
    if (!formulario.titulo.trim()) {
      setError('Ingrese un título');
      return false;
    }
    if (!formulario.tipoTicket) {
      setError('Seleccione el tipo de ticket');
      return false;
    }
    if (!formulario.descripcion.trim()) {
      setError('Ingrese una descripción del problema');
      return false;
    }
    setError('');
    return true;
  };

  // Enviar ticket a Supabase
  const enviarTicket = async () => {
    if (!validarFormulario()) return;

    setEnviando(true);
    setError('');

    try {
      const datosTicket = {
        titulo: formulario.titulo,
        descripcion: formulario.descripcion,
        prioridad: formulario.prioridad,
        categoriaId: formulario.categoria || null,
        tipoTicket: formulario.tipoTicket
      };

      const ticketNuevo = await ticketService.crear(datosTicket, usuario.id);
      
      setTicketCreado(ticketNuevo);
      setEnviado(true);
      
    } catch (error) {
      console.error('Error al crear ticket:', error);
      setError('Error al crear el ticket. Intente nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  // Crear nuevo ticket
  const crearNuevoTicket = () => {
    setFormulario({
      titulo: '',
      tipoTicket: '',
      categoria: '',
      descripcion: '',
      prioridad: 'MEDIA'
    });
    setAnexos([]);
    setEnviado(false);
    setTicketCreado(null);
    setError('');
  };

  // Si el ticket fue enviado
  if (enviado && ticketCreado) {
    return (
      <div className="solicitud-enviada">
        <div className="confirmacion-card">
          <FaCheckCircle className="icono-exito" />
          <h2>¡Ticket Creado Exitosamente!</h2>
          <p>Su ticket ha sido registrado con el número:</p>
          <span className="numero-ticket">{ticketCreado.folio}</span>
          <p className="mensaje-seguimiento">
            Recibirá una notificación cuando un agente atienda su solicitud.
            Puede dar seguimiento desde "Mis Tickets".
          </p>
          <div className="confirmacion-acciones">
            <button className="btn-nuevo" onClick={crearNuevoTicket}>
              <FaPlus /> Crear Nuevo Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nueva-solicitud">
      <div className="solicitud-header">
        <h1>Nuevo Ticket</h1>
        <button 
          className="btn-enviar" 
          onClick={enviarTicket}
          disabled={enviando}
        >
          {enviando ? <FaSpinner className="spin" /> : <FaPaperPlane />}
          {enviando ? 'Enviando...' : 'Enviar'}
        </button>
      </div>

      {error && (
        <div className="error-mensaje">
          {error}
        </div>
      )}

      <div className="solicitud-formulario">
        <div className="formulario-seccion">
          <h3>Datos generales</h3>
          
          <div className="campos-fila">
            <div className="campo-grupo campo-titulo">
              <label>Título (*)</label>
              <input 
                type="text" 
                placeholder="Describa brevemente el problema"
                value={formulario.titulo}
                onChange={(e) => setFormulario({...formulario, titulo: e.target.value})}
              />
            </div>

            <div className="campo-grupo">
              <label>Tipo de Ticket (*)</label>
              <select 
                value={formulario.tipoTicket}
                onChange={(e) => setFormulario({...formulario, tipoTicket: e.target.value})}
              >
                <option value="">-- seleccionar --</option>
                {tiposTicket.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            <div className="campo-grupo">
              <label>Categoría</label>
              <select 
                value={formulario.categoria}
                onChange={(e) => setFormulario({...formulario, categoria: e.target.value})}
              >
                <option value="">-- seleccionar --</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <div className="campo-grupo">
              <label>Prioridad</label>
              <select 
                value={formulario.prioridad}
                onChange={(e) => setFormulario({...formulario, prioridad: e.target.value})}
              >
                {prioridades.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Editor de texto */}
          <div className="campo-descripcion">
            <label>Descripción (*)</label>
            <div className="editor-toolbar">
              <button title="Código"><FaCode /></button>
              <button title="Expandir"><FaExpand /></button>
              <button title="Emoji"><FaSmile /></button>
              <span className="separador"></span>
              <button title="Negrita"><FaBold /></button>
              <button title="Cursiva"><FaItalic /></button>
              <button title="Subrayado"><FaUnderline /></button>
              <button title="Tachado"><FaStrikethrough /></button>
              <span className="separador"></span>
              <button title="Lista"><FaListUl /></button>
              <button title="Lista numerada"><FaListOl /></button>
              <button title="Alinear izquierda"><FaAlignLeft /></button>
              <button title="Centrar"><FaAlignCenter /></button>
              <button title="Alinear derecha"><FaAlignRight /></button>
              <span className="separador"></span>
              <button title="Tabla"><FaTable /></button>
              <button title="Imagen"><FaImage /></button>
              <button title="Enlace"><FaLink /></button>
            </div>
            <textarea 
              className="editor-texto"
              placeholder="Describa detalladamente su problema o solicitud..."
              value={formulario.descripcion}
              onChange={(e) => setFormulario({...formulario, descripcion: e.target.value})}
              rows="10"
            />
          </div>
        </div>

        {/* Anexos */}
        <div className="formulario-seccion seccion-anexos">
          <div className="anexos-header">
            <h3>Anexos</h3>
          </div>
          
          <table className="anexos-tabla">
            <thead>
              <tr>
                <th>Fichero</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {anexos.length === 0 ? (
                <tr>
                  <td colSpan="2" className="sin-anexos">No hay archivos adjuntos</td>
                </tr>
              ) : (
                anexos.map(anexo => (
                  <tr key={anexo.id}>
                    <td>
                      <FaPaperclip /> {anexo.nombre} 
                      <span className="anexo-tamaño">({formatearTamaño(anexo.tamaño)})</span>
                    </td>
                    <td>
                      <button className="btn-eliminar" onClick={() => eliminarAnexo(anexo.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <label className="btn-añadir-anexo">
            <FaPlus /> Añadir (Max 8.0 Mb)
            <input type="file" multiple onChange={subirAnexo} hidden />
          </label>
        </div>
      </div>
    </div>
  );
}

export default NuevaSolicitud;