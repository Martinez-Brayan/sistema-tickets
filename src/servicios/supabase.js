import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// =============================================
// SERVICIOS DE AUTENTICACIÓN
// =============================================
export const authService = {
  // Iniciar sesión
  async iniciarSesion(email, password) {
    // Buscar usuario por email y password
    const { data: usuario, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('activo', true)
      .single();

    if (error || !usuario) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar password (en producción usar bcrypt)
    if (usuario.password !== password) {
      throw new Error('Credenciales inválidas');
    }

    // Actualizar último acceso
    await supabase
      .from('users')
      .update({ ultimoAcceso: new Date().toISOString() })
      .eq('id', usuario.id);

    // Crear sesión
    const sesionId = crypto.randomUUID();
    await supabase
      .from('sesiones')
      .insert({
        id: sesionId,
        usuarioId: usuario.id,
        refreshToken: crypto.randomUUID(),
        expiraEn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        fechaCreacion: new Date().toISOString()
      });

    // No devolver el password
    const { password: _, ...usuarioSinPassword } = usuario;
    return { usuario: usuarioSinPassword, sesionId };
  },

  // Cerrar sesión
  async cerrarSesion(sesionId) {
    if (sesionId) {
      await supabase
        .from('sesiones')
        .delete()
        .eq('id', sesionId);
    }
  },

  // Obtener usuario por ID
  async obtenerUsuario(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, nombre, apellido, rol, departamentoId, activo')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};

// =============================================
// SERVICIOS DE TICKETS
// =============================================
export const ticketService = {
  // Generar folio único
  async generarFolio() {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    
    // Contar tickets del mes
    const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString();
    const { count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .gte('fechaCreacion', inicioMes);

    const numero = ((count || 0) + 1).toString().padStart(4, '0');
    return `TK-${año}${mes}-${numero}`;
  },

  // Crear ticket
  async crear(datosTicket, creadorId) {
    const folio = await this.generarFolio();
    const id = crypto.randomUUID();

    const ticket = {
      id,
      folio,
      asunto: datosTicket.titulo,
      descripcion: datosTicket.descripcion,
      prioridad: datosTicket.prioridad || 'MEDIA',
      estado: 'ABIERTO',
      categoriaId: datosTicket.categoriaId || null,
      creadorId,
      agenteId: null,
      departamentoId: datosTicket.departamentoId || null,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      fechaLimite: datosTicket.fechaLimite || null
    };

    const { data, error } = await supabase
      .from('tickets')
      .insert(ticket)
      .select()
      .single();

    if (error) throw error;

    // Registrar en historial
    await this.registrarHistorial(id, 'estado', null, 'ABIERTO', creadorId);

    // Crear notificaciones para admins y agentes
    await this.notificarNuevoTicket(data);

    return data;
  },

  // Notificar nuevo ticket
  async notificarNuevoTicket(ticket) {
    // Obtener admins y agentes
    const { data: usuarios } = await supabase
      .from('users')
      .select('id, rol')
      .in('rol', ['ADMIN', 'AGENTE', 'JEFE'])
      .eq('activo', true);

    if (usuarios && usuarios.length > 0) {
      const notificaciones = usuarios.map(u => ({
        id: crypto.randomUUID(),
        usuarioId: u.id,
        tipo: 'TICKET_NUEVO',
        titulo: `Nuevo Ticket: ${ticket.folio}`,
        mensaje: ticket.asunto,
        enlace: `/tickets/${ticket.id}`,
        leida: false,
        fechaCreacion: new Date().toISOString()
      }));

      await supabase.from('notificaciones').insert(notificaciones);
    }
  },

  // Obtener todos los tickets
  async obtenerTodos(filtros = {}) {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        creador:creadorId(id, nombre, apellido, email),
        agente:agenteId(id, nombre, apellido),
        categoria:categoriaId(id, nombre, color),
        departamento:departamentoId(id, nombre)
      `)
      .order('fechaCreacion', { ascending: false });

    if (filtros.estado) {
      query = query.eq('estado', filtros.estado);
    }
    if (filtros.agenteId) {
      query = query.eq('agenteId', filtros.agenteId);
    }
    if (filtros.creadorId) {
      query = query.eq('creadorId', filtros.creadorId);
    }
    if (filtros.prioridad) {
      query = query.eq('prioridad', filtros.prioridad);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener ticket por ID
  async obtenerPorId(id) {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        creador:creadorId(id, nombre, apellido, email),
        agente:agenteId(id, nombre, apellido, email),
        categoria:categoriaId(id, nombre, color),
        departamento:departamentoId(id, nombre)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar ticket
  async actualizar(id, datos, usuarioId) {
    // Obtener ticket actual para historial
    const ticketActual = await this.obtenerPorId(id);

    const { data, error } = await supabase
      .from('tickets')
      .update({ 
        ...datos, 
        fechaActualizacion: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Registrar cambios en historial
    for (const campo of Object.keys(datos)) {
      if (ticketActual[campo] !== datos[campo]) {
        await this.registrarHistorial(
          id, 
          campo, 
          ticketActual[campo]?.toString(), 
          datos[campo]?.toString(), 
          usuarioId
        );
      }
    }

    return data;
  },

  // Registrar historial
  async registrarHistorial(ticketId, campo, valorAnterior, valorNuevo, usuarioId) {
    await supabase.from('historial_tickets').insert({
      id: crypto.randomUUID(),
      ticketId,
      campo,
      valorAnterior,
      valorNuevo,
      usuarioId,
      fecha: new Date().toISOString()
    });
  },

  // Asignar agente
  async asignarAgente(ticketId, agenteId, usuarioId) {
    const resultado = await this.actualizar(ticketId, { agenteId }, usuarioId);

    // Notificar al agente
    if (agenteId) {
      const ticket = await this.obtenerPorId(ticketId);
      await supabase.from('notificaciones').insert({
        id: crypto.randomUUID(),
        usuarioId: agenteId,
        tipo: 'TICKET_ASIGNADO',
        titulo: `Ticket Asignado: ${ticket.folio}`,
        mensaje: ticket.asunto,
        enlace: `/tickets/${ticketId}`,
        leida: false,
        fechaCreacion: new Date().toISOString()
      });
    }

    return resultado;
  },

  // Cambiar estado
  async cambiarEstado(ticketId, nuevoEstado, usuarioId) {
    const datos = { estado: nuevoEstado };

    if (nuevoEstado === 'CERRADO') {
      datos.fechaCierre = new Date().toISOString();
    }
    if (nuevoEstado === 'RESUELTO') {
      datos.fechaResolucion = new Date().toISOString();
    }

    return await this.actualizar(ticketId, datos, usuarioId);
  },

  // Eliminar ticket
  async eliminar(id) {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Suscribirse a cambios en tickets
  suscribirCambios(callback) {
    return supabase
      .channel('tickets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, callback)
      .subscribe();
  }
};

// =============================================
// SERVICIOS DE COMENTARIOS (Chat del ticket)
// =============================================
export const comentarioService = {
  // Crear comentario
  async crear(datosComentario, autorId) {
    const comentario = {
      id: crypto.randomUUID(),
      contenido: datosComentario.contenido,
      esInterno: datosComentario.esInterno || false,
      ticketId: datosComentario.ticketId,
      autorId,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('comentarios')
      .insert(comentario)
      .select('*, autor:autorId(id, nombre, apellido, rol)')
      .single();

    if (error) throw error;

    // Actualizar fecha del ticket
    await supabase
      .from('tickets')
      .update({ fechaActualizacion: new Date().toISOString() })
      .eq('id', datosComentario.ticketId);

    // Notificar
    await this.notificarComentario(data);

    return data;
  },

  // Notificar nuevo comentario
  async notificarComentario(comentario) {
    // Obtener ticket y autor
    const { data: ticket } = await supabase
      .from('tickets')
      .select('*, creador:creadorId(id, rol), agente:agenteId(id)')
      .eq('id', comentario.ticketId)
      .single();

    const { data: autor } = await supabase
      .from('users')
      .select('rol')
      .eq('id', comentario.autorId)
      .single();

    const notificaciones = [];

    // Si el autor es cliente, notificar a agente y admins
    if (autor.rol === 'CLIENTE') {
      // Notificar al agente asignado
      if (ticket.agenteId && ticket.agenteId !== comentario.autorId) {
        notificaciones.push({
          id: crypto.randomUUID(),
          usuarioId: ticket.agenteId,
          tipo: 'COMENTARIO_NUEVO',
          titulo: `Nueva respuesta en ${ticket.folio}`,
          mensaje: 'El cliente ha respondido',
          enlace: `/tickets/${ticket.id}`,
          leida: false,
          fechaCreacion: new Date().toISOString()
        });
      }

      // Notificar a admins
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .in('rol', ['ADMIN', 'JEFE'])
        .eq('activo', true);

      admins?.forEach(admin => {
        if (admin.id !== comentario.autorId) {
          notificaciones.push({
            id: crypto.randomUUID(),
            usuarioId: admin.id,
            tipo: 'COMENTARIO_NUEVO',
            titulo: `Nueva respuesta en ${ticket.folio}`,
            mensaje: 'El cliente ha respondido',
            enlace: `/tickets/${ticket.id}`,
            leida: false,
            fechaCreacion: new Date().toISOString()
          });
        }
      });
    } 
    // Si el autor es agente, notificar al cliente y admins
    else if (autor.rol === 'AGENTE') {
      // Notificar al cliente
      if (ticket.creadorId !== comentario.autorId) {
        notificaciones.push({
          id: crypto.randomUUID(),
          usuarioId: ticket.creadorId,
          tipo: 'COMENTARIO_NUEVO',
          titulo: `Respuesta en tu ticket ${ticket.folio}`,
          mensaje: 'Un agente ha respondido',
          enlace: `/tickets/${ticket.id}`,
          leida: false,
          fechaCreacion: new Date().toISOString()
        });
      }
    }

    if (notificaciones.length > 0) {
      await supabase.from('notificaciones').insert(notificaciones);
    }
  },

  // Obtener comentarios de un ticket
  async obtenerPorTicket(ticketId, incluirInternos = false) {
    let query = supabase
      .from('comentarios')
      .select('*, autor:autorId(id, nombre, apellido, rol)')
      .eq('ticketId', ticketId)
      .order('fechaCreacion', { ascending: true });

    if (!incluirInternos) {
      query = query.eq('esInterno', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Suscribirse a nuevos comentarios
  suscribirCambios(ticketId, callback) {
    return supabase
      .channel(`comentarios-${ticketId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'comentarios', filter: `ticketId=eq.${ticketId}` }, 
        callback
      )
      .subscribe();
  }
};

// =============================================
// SERVICIOS DE NOTIFICACIONES
// =============================================
export const notificacionService = {
  // Obtener notificaciones del usuario
  async obtener(usuarioId) {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuarioId', usuarioId)
      .order('fechaCreacion', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  },

  // Contar no leídas
  async contarNoLeidas(usuarioId) {
    const { count, error } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('usuarioId', usuarioId)
      .eq('leida', false);

    if (error) throw error;
    return count || 0;
  },

  // Marcar como leída
  async marcarLeida(id) {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', id);

    if (error) throw error;
  },

  // Marcar todas como leídas
  async marcarTodasLeidas(usuarioId) {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuarioId', usuarioId)
      .eq('leida', false);

    if (error) throw error;
  },

  // Eliminar notificación
  async eliminar(id) {
    const { error } = await supabase
      .from('notificaciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Eliminar todas
  async eliminarTodas(usuarioId) {
    const { error } = await supabase
      .from('notificaciones')
      .delete()
      .eq('usuarioId', usuarioId);

    if (error) throw error;
  },

  // Suscribirse a nuevas notificaciones (tiempo real)
  suscribirCambios(usuarioId, callback) {
    return supabase
      .channel(`notificaciones-${usuarioId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: `usuarioId=eq.${usuarioId}` }, 
        callback
      )
      .subscribe();
  }
};

// =============================================
// SERVICIOS DE CATEGORÍAS
// =============================================
export const categoriaService = {
  async obtenerTodas() {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('activo', true)
      .order('orden');

    if (error) throw error;
    return data;
  }
};

// =============================================
// SERVICIOS DE USUARIOS
// =============================================
export const usuarioService = {
  // Obtener agentes
  async obtenerAgentes() {
    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, apellido, email')
      .in('rol', ['AGENTE', 'JEFE'])
      .eq('activo', true)
      .order('nombre');

    if (error) throw error;
    return data;
  },

  // Obtener todos los usuarios
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('users')
      .select('*, departamento:departamentoId(nombre)')
      .order('nombre');

    if (error) throw error;
    return data;
  },

  // Obtener usuario por ID
  async obtenerPorId(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, nombre, apellido, rol, departamentoId, activo')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};

// =============================================
// SERVICIOS DE DEPARTAMENTOS
// =============================================
export const departamentoService = {
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('departamentos')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) throw error;
    return data;
  }
};

// =============================================
// SERVICIOS DE ETIQUETAS
// =============================================
export const etiquetaService = {
  async obtenerTodas() {
    const { data, error } = await supabase
      .from('etiquetas')
      .select('*')
      .order('nombre');

    if (error) throw error;
    return data;
  },

  async asignarATicket(ticketId, etiquetaId) {
    const { error } = await supabase
      .from('ticket_etiquetas')
      .insert({
        ticketId,
        etiquetaId,
        fechaAsignacion: new Date().toISOString()
      });

    if (error) throw error;
  },

  async removerDeTicket(ticketId, etiquetaId) {
    const { error } = await supabase
      .from('ticket_etiquetas')
      .delete()
      .eq('ticketId', ticketId)
      .eq('etiquetaId', etiquetaId);

    if (error) throw error;
  }
};

// =============================================
// SERVICIOS DE ADJUNTOS
// =============================================
export const adjuntoService = {
  // Subir archivo
  async subir(archivo, ticketId, autorId, comentarioId = null) {
    const nombreArchivo = `${Date.now()}-${archivo.name}`;
    const ruta = `tickets/${ticketId}/${nombreArchivo}`;

    // Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('adjuntos')
      .upload(ruta, archivo);

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('adjuntos')
      .getPublicUrl(ruta);

    // Registrar en base de datos
    const adjunto = {
      id: crypto.randomUUID(),
      nombreArchivo: archivo.name,
      rutaArchivo: urlData.publicUrl,
      tipoMime: archivo.type,
      tamano: archivo.size,
      ticketId,
      comentarioId,
      autorId,
      fechaSubida: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('adjuntos')
      .insert(adjunto)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener adjuntos de un ticket
  async obtenerPorTicket(ticketId) {
    const { data, error } = await supabase
      .from('adjuntos')
      .select('*, autor:autorId(nombre, apellido)')
      .eq('ticketId', ticketId)
      .order('fechaSubida', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Eliminar adjunto
  async eliminar(id, rutaArchivo) {
    // Eliminar de Storage
    const ruta = rutaArchivo.split('/adjuntos/')[1];
    await supabase.storage.from('adjuntos').remove([ruta]);

    // Eliminar de base de datos
    const { error } = await supabase
      .from('adjuntos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// =============================================
// SERVICIOS DE HISTORIAL
// =============================================
export const historialService = {
  async obtenerPorTicket(ticketId) {
    const { data, error } = await supabase
      .from('historial_tickets')
      .select('*, usuario:usuarioId(nombre, apellido)')
      .eq('ticketId', ticketId)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data;
  }
};