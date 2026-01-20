// FormularioTicket.js - Formulario para crear y editar tickets
import React, { useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import './FormularioTicket.css';

function FormularioTicket({ onCerrar, onGuardar, ticketEditar }) {
  // Estado del formulario
  const [formulario, setFormulario] = useState({
    titulo: ticketEditar?.titulo || '',
    descripcion: ticketEditar?.descripcion || '',
    tipoTicket: ticketEditar?.tipoTicket || 'Incidente',
    categoria: ticketEditar?.categoria || '',
    subcategoria: ticketEditar?.subcategoria || '',
    prioridad: ticketEditar?.prioridad || 'Media',
    estado: ticketEditar?.estado || 'Abierto',
    solicitante: ticketEditar?.solicitante || '',
    agente: ticketEditar?.agente || '',
    requerimientoComercial: ticketEditar?.requerimientoComercial || ''
  });

  const [errores, setErrores] = useState({});

  // Opciones para los selectores
  const tiposTicket = ['Incidente', 'Solicitud'];
  
  const categorias = {
    'Incidente': ['Hardware', 'Software', 'Red', 'Seguridad'],
    'Solicitud': ['Acceso', 'Instalación', 'Información', 'Cambio']
  };

  const subcategorias = {
    'Hardware': ['PC', 'Impresora', 'Monitor', 'Teclado/Mouse'],
    'Software': ['Sistema Operativo', 'Office', 'Aplicación Interna', 'Otro'],
    'Red': ['Internet', 'VPN', 'Correo', 'Telefonía'],
    'Seguridad': ['Virus', 'Acceso no autorizado', 'Phishing', 'Otro'],
    'Acceso': ['Nuevo usuario', 'Permisos', 'Reseteo contraseña', 'Baja usuario'],
    'Instalación': ['Software', 'Hardware', 'Configuración'],
    'Información': ['Consulta técnica', 'Capacitación', 'Documentación'],
    'Cambio': ['Equipo', 'Ubicación', 'Configuración']
  };
  
  const prioridades = ['Alta', 'Media', 'Baja'];
  
  const estados = [
    'Abierto',
    'En Proceso',
    'En Espera de Usuario',
    'Respondido Usuario',
    'Resuelto',
    'Pendiente a terminar',
    'Proyecto en Proceso',
    'Proyecto Culminado',
    'Escalamiento a Fábrica'
  ];

  const agentes = ['Sin asignar', 'García', 'Ruiz', 'López', 'Pedro Sánchez'];

  // Manejar cambios en los campos
  const manejarCambio = (campo, valor) => {
    setFormulario(prev => {
      const nuevoFormulario = { ...prev, [campo]: valor };
      
      // Si cambia el tipo de ticket, resetear categoría y subcategoría
      if (campo === 'tipoTicket') {
        nuevoFormulario.categoria = '';
        nuevoFormulario.subcategoria = '';
      }
      
      // Si cambia la categoría, resetear subcategoría
      if (campo === 'categoria') {
        nuevoFormulario.subcategoria = '';
      }
      
      return nuevoFormulario;
    });

    // Limpiar error del campo
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: '' }));
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.titulo.trim()) {
      nuevosErrores.titulo = 'El título es obligatorio';
    }

    if (!formulario.prioridad) {
      nuevosErrores.prioridad = 'La prioridad es obligatoria';
    }

    if (!formulario.estado) {
      nuevosErrores.estado = 'El estado es obligatorio';
    }

    if (!formulario.solicitante.trim()) {
      nuevosErrores.solicitante = 'El solicitante es obligatorio';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar envío del formulario
  const manejarEnvio = (evento) => {
    evento.preventDefault();

    if (validarFormulario()) {
      const ticketNuevo = {
        ...formulario,
        id: ticketEditar?.id || Date.now(),
        fechaCreacion: ticketEditar?.fechaCreacion || new Date().toISOString().split('T')[0],
        fechaActualizacion: new Date().toISOString().split('T')[0]
      };

      onGuardar(ticketNuevo);
    }
  };

  return (
    <div className="formulario-overlay">
      <div className="formulario-contenedor">
        {/* Encabezado */}
        <div className="formulario-encabezado">
          <h2>{ticketEditar ? 'Editar Ticket' : 'Nuevo Ticket'}</h2>
          <button className="boton-cerrar" onClick={onCerrar}>
            <FaTimes />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="formulario-cuerpo">
          {/* Título */}
          <div className="formulario-grupo">
            <label>Título *</label>
            <input
              type="text"
              value={formulario.titulo}
              onChange={(e) => manejarCambio('titulo', e.target.value)}
              placeholder="Describa brevemente el problema o solicitud"
              className={errores.titulo ? 'error' : ''}
            />
            {errores.titulo && <span className="mensaje-error">{errores.titulo}</span>}
          </div>

          {/* Descripción */}
          <div className="formulario-grupo">
            <label>Descripción</label>
            <textarea
              value={formulario.descripcion}
              onChange={(e) => manejarCambio('descripcion', e.target.value)}
              placeholder="Proporcione detalles adicionales..."
              rows="4"
            />
          </div>

          {/* Fila: Tipo y Categoría */}
          <div className="formulario-fila">
            <div className="formulario-grupo">
              <label>Tipo de Ticket</label>
              <select
                value={formulario.tipoTicket}
                onChange={(e) => manejarCambio('tipoTicket', e.target.value)}
              >
                {tiposTicket.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="formulario-grupo">
              <label>Categoría</label>
              <select
                value={formulario.categoria}
                onChange={(e) => manejarCambio('categoria', e.target.value)}
              >
                <option value="">Seleccione...</option>
                {categorias[formulario.tipoTicket]?.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila: Subcategoría y Prioridad */}
          <div className="formulario-fila">
            <div className="formulario-grupo">
              <label>Subcategoría</label>
              <select
                value={formulario.subcategoria}
                onChange={(e) => manejarCambio('subcategoria', e.target.value)}
                disabled={!formulario.categoria}
              >
                <option value="">Seleccione...</option>
                {subcategorias[formulario.categoria]?.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="formulario-grupo">
              <label>Prioridad *</label>
              <select
                value={formulario.prioridad}
                onChange={(e) => manejarCambio('prioridad', e.target.value)}
                className={errores.prioridad ? 'error' : ''}
              >
                {prioridades.map(pri => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>
              {errores.prioridad && <span className="mensaje-error">{errores.prioridad}</span>}
            </div>
          </div>

          {/* Fila: Estado y Agente */}
          <div className="formulario-fila">
            <div className="formulario-grupo">
              <label>Estado *</label>
              <select
                value={formulario.estado}
                onChange={(e) => manejarCambio('estado', e.target.value)}
                className={errores.estado ? 'error' : ''}
              >
                {estados.map(est => (
                  <option key={est} value={est}>{est}</option>
                ))}
              </select>
              {errores.estado && <span className="mensaje-error">{errores.estado}</span>}
            </div>

            <div className="formulario-grupo">
              <label>Agente Asignado</label>
              <select
                value={formulario.agente}
                onChange={(e) => manejarCambio('agente', e.target.value)}
              >
                {agentes.map(ag => (
                  <option key={ag} value={ag}>{ag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Solicitante */}
          <div className="formulario-grupo">
            <label>Solicitante *</label>
            <input
              type="text"
              value={formulario.solicitante}
              onChange={(e) => manejarCambio('solicitante', e.target.value)}
              placeholder="Nombre del solicitante"
              className={errores.solicitante ? 'error' : ''}
            />
            {errores.solicitante && <span className="mensaje-error">{errores.solicitante}</span>}
          </div>

          {/* Requerimiento Comercial (solo para Solicitudes) */}
          {formulario.tipoTicket === 'Solicitud' && (
            <div className="formulario-grupo">
              <label>Requerimiento Comercial</label>
              <textarea
                value={formulario.requerimientoComercial}
                onChange={(e) => manejarCambio('requerimientoComercial', e.target.value)}
                placeholder="Detalles del requerimiento comercial..."
                rows="3"
              />
            </div>
          )}

          {/* Botones */}
          <div className="formulario-acciones">
            <button type="button" className="boton-cancelar" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="boton-guardar">
              <FaSave /> Guardar Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioTicket;