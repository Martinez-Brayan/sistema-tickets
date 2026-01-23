import React, { useState } from 'react';
import { FaPaperPlane, FaPaperclip, FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, 
  FaImage, FaTable, FaCode, FaExpand, FaSmile, FaPlus, FaTrash, FaTimes,
  FaCheckCircle } from 'react-icons/fa';
import './NuevaSolicitud.css';

function NuevaSolicitud() {
  const [formulario, setFormulario] = useState({
    titulo: '',
    tipoTicket: '',
    categoria: '',
    subcategoria: '',
    detalle: '',
    descripcion: '',
    prioridad: 'Media'
  });

  const [anexos, setAnexos] = useState([]);
  const [enviado, setEnviado] = useState(false);
  const [ticketCreado, setTicketCreado] = useState(null);

  // Opciones de tipo de ticket
  const tiposTicket = [
    { value: 'incidencia', label: 'Incidencia' },
    { value: 'solicitud', label: 'Solicitud' },
    { value: 'consulta', label: 'Consulta' }
  ];

  // Categorías
  const categorias = [
    { value: 'software', label: 'Software' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'cableado', label: 'Cableado' },
    { value: 'soporte', label: 'Soporte' }
  ];

  // Subcategorías por categoría
  const subcategorias = {
    software: [
      { value: 'sistema-operativo', label: 'Sistema Operativo' },
      { value: 'aplicacion-oficina', label: 'Aplicación de Oficina' },
      { value: 'software-contable', label: 'Software Contable' },
      { value: 'erp-crm', label: 'ERP/CRM' },
      { value: 'otro', label: 'Otro' }
    ],
    hardware: [
      { value: 'computadora', label: 'Computadora' },
      { value: 'impresora', label: 'Impresora' },
      { value: 'monitor', label: 'Monitor' },
      { value: 'teclado-mouse', label: 'Teclado/Mouse' },
      { value: 'otro', label: 'Otro' }
    ],
    cableado: [
      { value: 'red', label: 'Red' }
    ],
    soporte: [
      { value: 'capacitacion', label: 'Capacitación' },
      { value: 'consulta-general', label: 'Consulta General' },
      { value: 'acceso-permisos', label: 'Acceso/Permisos' },
      { value: 'licencia', label: 'Licencia' },
      { value: 'otro', label: 'Otro' }
    ]
  };

  // Detalles por subcategoría
  const detalles = {
    'sistema-operativo': [
      { value: 'instalacion', label: 'Instalación' },
      { value: 'actualizacion', label: 'Actualización' },
      { value: 'error', label: 'Error del sistema' },
      { value: 'rendimiento', label: 'Problemas de rendimiento' }
    ],
    'aplicacion-oficina': [
      { value: 'word', label: 'Microsoft Word' },
      { value: 'excel', label: 'Microsoft Excel' },
      { value: 'powerpoint', label: 'Microsoft PowerPoint' },
      { value: 'outlook', label: 'Microsoft Outlook' },
      { value: 'otro', label: 'Otro' }
    ],
    'software-contable': [
      { value: 'instalacion', label: 'Instalación' },
      { value: 'error', label: 'Error en el sistema' },
      { value: 'reporte', label: 'Problema con reportes' },
      { value: 'otro', label: 'Otro' }
    ],
    'erp-crm': [
      { value: 'acceso', label: 'Problema de acceso' },
      { value: 'modulo', label: 'Error en módulo' },
      { value: 'reporte', label: 'Problema con reportes' },
      { value: 'otro', label: 'Otro' }
    ],
    'computadora': [
      { value: 'no-enciende', label: 'No enciende' },
      { value: 'lenta', label: 'Muy lenta' },
      { value: 'ruido', label: 'Hace ruido' },
      { value: 'pantalla-azul', label: 'Pantalla azul' },
      { value: 'otro', label: 'Otro' }
    ],
    'impresora': [
      { value: 'no-imprime', label: 'No imprime' },
      { value: 'atasco', label: 'Atasco de papel' },
      { value: 'calidad', label: 'Mala calidad de impresión' },
      { value: 'conexion', label: 'No se conecta' },
      { value: 'otro', label: 'Otro' }
    ],
    'monitor': [
      { value: 'no-enciende', label: 'No enciende' },
      { value: 'parpadea', label: 'Parpadea' },
      { value: 'lineas', label: 'Líneas en pantalla' },
      { value: 'color', label: 'Problemas de color' },
      { value: 'otro', label: 'Otro' }
    ],
    'teclado-mouse': [
      { value: 'no-funciona', label: 'No funciona' },
      { value: 'teclas', label: 'Teclas no responden' },
      { value: 'conexion', label: 'No se conecta' },
      { value: 'otro', label: 'Otro' }
    ],
    'red': [
      { value: 'sin-conexion', label: 'Sin conexión' },
      { value: 'lenta', label: 'Conexión lenta' },
      { value: 'intermitente', label: 'Conexión intermitente' },
      { value: 'cable-danado', label: 'Cable dañado' },
      { value: 'punto-red', label: 'Punto de red' },
      { value: 'otro', label: 'Otro' }
    ],
    'capacitacion': [
      { value: 'sistema', label: 'Uso del sistema' },
      { value: 'herramienta', label: 'Herramienta específica' },
      { value: 'proceso', label: 'Proceso de trabajo' },
      { value: 'otro', label: 'Otro' }
    ],
    'consulta-general': [
      { value: 'informacion', label: 'Solicitud de información' },
      { value: 'procedimiento', label: 'Consulta de procedimiento' },
      { value: 'otro', label: 'Otro' }
    ],
    'acceso-permisos': [
      { value: 'nuevo-acceso', label: 'Solicitar nuevo acceso' },
      { value: 'modificar', label: 'Modificar permisos' },
      { value: 'eliminar', label: 'Eliminar acceso' },
      { value: 'restablecer', label: 'Restablecer contraseña' },
      { value: 'otro', label: 'Otro' }
    ],
    'licencia': [
      { value: 'nueva', label: 'Solicitar nueva licencia' },
      { value: 'renovar', label: 'Renovar licencia' },
      { value: 'activar', label: 'Activar licencia' },
      { value: 'problema', label: 'Problema con licencia' },
      { value: 'otro', label: 'Otro' }
    ],
    'otro': [
      { value: 'otro', label: 'Especificar en descripción' }
    ]
  };

  // Manejar cambio de categoría
  const handleCategoriaChange = (e) => {
    setFormulario({
      ...formulario,
      categoria: e.target.value,
      subcategoria: '',
      detalle: ''
    });
  };

  // Manejar cambio de subcategoría
  const handleSubcategoriaChange = (e) => {
    setFormulario({
      ...formulario,
      subcategoria: e.target.value,
      detalle: ''
    });
  };

  // Subir anexo
  const subirAnexo = (e) => {
    const archivos = Array.from(e.target.files);
    const maxSize = 8 * 1024 * 1024; // 8 MB

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
      alert('Ingrese un título');
      return false;
    }
    if (!formulario.tipoTicket) {
      alert('Seleccione el tipo de ticket');
      return false;
    }
    if (!formulario.categoria) {
      alert('Seleccione una categoría');
      return false;
    }
    if (!formulario.subcategoria) {
      alert('Seleccione una subcategoría');
      return false;
    }
    if (!formulario.descripcion.trim()) {
      alert('Ingrese una descripción del problema');
      return false;
    }
    return true;
  };

  // Enviar ticket
  const enviarTicket = () => {
    if (!validarFormulario()) return;

    // Crear ticket (esto se conectará a Supabase)
    const nuevoTicket = {
      id: Date.now(),
      ...formulario,
      estado: 'Abierto',
      fechaCreacion: new Date().toISOString(),
      anexos: anexos.map(a => ({ id: a.id, nombre: a.nombre }))
    };

    console.log('Ticket creado:', nuevoTicket);
    setTicketCreado(nuevoTicket);
    setEnviado(true);
  };

  // Crear nuevo ticket (después de enviar)
  const crearNuevoTicket = () => {
    setFormulario({
      titulo: '',
      tipoTicket: '',
      categoria: '',
      subcategoria: '',
      detalle: '',
      descripcion: '',
      prioridad: 'Media'
    });
    setAnexos([]);
    setEnviado(false);
    setTicketCreado(null);
  };

  // Si el ticket fue enviado, mostrar confirmación
  if (enviado && ticketCreado) {
    return (
      <div className="solicitud-enviada">
        <div className="confirmacion-card">
          <FaCheckCircle className="icono-exito" />
          <h2>¡Ticket Creado Exitosamente!</h2>
          <p>Su ticket ha sido registrado con el número:</p>
          <span className="numero-ticket">#{ticketCreado.id}</span>
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
        <button className="btn-enviar" onClick={enviarTicket}>
          <FaPaperPlane /> Enviar
        </button>
      </div>

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
              <label>Categoría (*)</label>
              <select 
                value={formulario.categoria}
                onChange={handleCategoriaChange}
              >
                <option value="">-- seleccionar --</option>
                {categorias.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="campo-grupo">
              <label>Subcategoría (*)</label>
              <select 
                value={formulario.subcategoria}
                onChange={handleSubcategoriaChange}
                disabled={!formulario.categoria}
              >
                <option value="">-- seleccionar --</option>
                {formulario.categoria && subcategorias[formulario.categoria]?.map(sub => (
                  <option key={sub.value} value={sub.value}>{sub.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="campos-fila">
            <div className="campo-grupo">
              <label>Detalle (*)</label>
              <select 
                value={formulario.detalle}
                onChange={(e) => setFormulario({...formulario, detalle: e.target.value})}
                disabled={!formulario.subcategoria}
              >
                <option value="">-- seleccionar --</option>
                {formulario.subcategoria && detalles[formulario.subcategoria]?.map(det => (
                  <option key={det.value} value={det.value}>{det.label}</option>
                ))}
              </select>
            </div>

            <div className="campo-grupo">
              <label>Prioridad</label>
              <select 
                value={formulario.prioridad}
                onChange={(e) => setFormulario({...formulario, prioridad: e.target.value})}
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          {/* Editor de texto */}
          <div className="campo-descripcion">
            <div className="editor-toolbar">
              <button title="Código"><FaCode /></button>
              <button title="Expandir"><FaExpand /></button>
              <button title="Emoji"><FaSmile /></button>
              <span className="separador"></span>
              <select defaultValue="normal" className="select-tamaño">
                <option value="normal">Tamaño...</option>
                <option value="pequeño">Pequeño</option>
                <option value="normal">Normal</option>
                <option value="grande">Grande</option>
              </select>
              <span className="separador"></span>
              <button title="Negrita"><FaBold /></button>
              <button title="Cursiva"><FaItalic /></button>
              <button title="Subrayado"><FaUnderline /></button>
              <button title="Tachado"><FaStrikethrough /></button>
              <span className="separador"></span>
              <button title="Color texto">A</button>
              <button title="Resaltado">A</button>
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