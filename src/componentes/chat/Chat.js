// Chat.js - Componente de chat en tiempo real
import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaPaperclip, FaImage, FaSmile, FaCircle } from 'react-icons/fa';
import './Chat.css';

function Chat() {
  const [conversaciones, setConversaciones] = useState([
    {
      id: 1,
      cliente: 'Juan Perez',
      ticketId: '#001',
      estado: 'activo',
      mensajes: [
        { id: 1, texto: 'Hola, tengo un problema con el sistema de pagos', emisor: 'cliente', hora: '10:30' },
        { id: 2, texto: 'Buenos dias Juan, puede describir el problema?', emisor: 'agente', hora: '10:32' },
        { id: 3, texto: 'Cuando intento procesar un pago, me aparece un error', emisor: 'cliente', hora: '10:33' }
      ]
    },
    {
      id: 2,
      cliente: 'Ana Lopez',
      ticketId: '#002',
      estado: 'activo',
      mensajes: [
        { id: 1, texto: 'Necesito ayuda para crear un usuario nuevo', emisor: 'cliente', hora: '09:15' },
        { id: 2, texto: 'Claro, para que departamento seria?', emisor: 'agente', hora: '09:17' }
      ]
    },
    {
      id: 3,
      cliente: 'Pedro Sanchez',
      ticketId: '#003',
      estado: 'inactivo',
      mensajes: [
        { id: 1, texto: 'Ya pude acceder, gracias por la ayuda', emisor: 'cliente', hora: '08:45' },
        { id: 2, texto: 'Excelente! Que tenga buen dia', emisor: 'agente', hora: '08:46' }
      ]
    }
  ]);

  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [mensajeNuevo, setMensajeNuevo] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const mensajesRef = useRef(null);

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [conversacionActiva]);

  const seleccionarConversacion = (conversacion) => {
    setConversacionActiva(conversacion);
  };

  const enviarMensaje = (evento) => {
    evento.preventDefault();
    
    if (!mensajeNuevo.trim() || !conversacionActiva) return;

    const nuevoMensaje = {
      id: Date.now(),
      texto: mensajeNuevo,
      emisor: 'agente',
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    setConversaciones(prev => prev.map(conv => {
      if (conv.id === conversacionActiva.id) {
        return { ...conv, mensajes: [...conv.mensajes, nuevoMensaje] };
      }
      return conv;
    }));

    setConversacionActiva(prev => ({
      ...prev,
      mensajes: [...prev.mensajes, nuevoMensaje]
    }));

    setMensajeNuevo('');
    simularRespuesta();
  };

  const simularRespuesta = () => {
    setEscribiendo(true);
    setTimeout(() => {
      setEscribiendo(false);
      const respuesta = {
        id: Date.now(),
        texto: 'Entendido, gracias por la informacion',
        emisor: 'cliente',
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      setConversaciones(prev => prev.map(conv => {
        if (conv.id === conversacionActiva?.id) {
          return { ...conv, mensajes: [...conv.mensajes, respuesta] };
        }
        return conv;
      }));

      setConversacionActiva(prev => {
        if (prev) {
          return { ...prev, mensajes: [...prev.mensajes, respuesta] };
        }
        return prev;
      });
    }, 2000);
  };

  return (
    <div className="chat-contenedor">
      <div className="chat-lista">
        <div className="chat-lista-encabezado">
          <h3>Conversaciones</h3>
        </div>
        
        <div className="chat-lista-conversaciones">
          {conversaciones.map(conv => (
            <div 
              key={conv.id}
              className={`chat-conversacion-item ${conversacionActiva?.id === conv.id ? 'activo' : ''}`}
              onClick={() => seleccionarConversacion(conv)}
            >
              <div className="conversacion-avatar">
                {conv.cliente.charAt(0)}
              </div>
              <div className="conversacion-info">
                <div className="conversacion-nombre">
                  {conv.cliente}
                  <FaCircle className={`estado-indicador ${conv.estado}`} />
                </div>
                <div className="conversacion-ticket">{conv.ticketId}</div>
                <div className="conversacion-ultimo">
                  {conv.mensajes[conv.mensajes.length - 1]?.texto.substring(0, 25)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-area">
        {conversacionActiva ? (
          <>
            <div className="chat-area-encabezado">
              <div className="chat-usuario-info">
                <div className="chat-avatar">
                  {conversacionActiva.cliente.charAt(0)}
                </div>
                <div>
                  <div className="chat-usuario-nombre">{conversacionActiva.cliente}</div>
                  <div className="chat-usuario-ticket">Ticket: {conversacionActiva.ticketId}</div>
                </div>
              </div>
              <div className="chat-estado">
                <FaCircle className={`estado-indicador ${conversacionActiva.estado}`} />
                {conversacionActiva.estado === 'activo' ? 'En linea' : 'Desconectado'}
              </div>
            </div>

            <div className="chat-mensajes" ref={mensajesRef}>
              {conversacionActiva.mensajes.map(mensaje => (
                <div 
                  key={mensaje.id}
                  className={`chat-mensaje ${mensaje.emisor === 'agente' ? 'enviado' : 'recibido'}`}
                >
                  <div className="mensaje-contenido">
                    <p>{mensaje.texto}</p>
                    <span className="mensaje-hora">{mensaje.hora}</span>
                  </div>
                </div>
              ))}
              
              {escribiendo && (
                <div className="chat-mensaje recibido">
                  <div className="mensaje-contenido escribiendo">
                    <span className="punto"></span>
                    <span className="punto"></span>
                    <span className="punto"></span>
                  </div>
                </div>
              )}
            </div>

            <form className="chat-input" onSubmit={enviarMensaje}>
              <button type="button" className="chat-boton-adjuntar" title="Adjuntar">
                <FaPaperclip />
              </button>
              <button type="button" className="chat-boton-adjuntar" title="Imagen">
                <FaImage />
              </button>
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={mensajeNuevo}
                onChange={(e) => setMensajeNuevo(e.target.value)}
              />
              <button type="button" className="chat-boton-emoji" title="Emojis">
                <FaSmile />
              </button>
              <button type="submit" className="chat-boton-enviar" title="Enviar">
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="chat-sin-seleccion">
            <div className="chat-sin-seleccion-contenido">
              <h3>Centro de Mensajes</h3>
              <p>Selecciona una conversacion para comenzar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;