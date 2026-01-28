import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://wxepqumrpykhvjtrsjsx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZXBxdW1ycHlraHZqdHJzanN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDk1NjEsImV4cCI6MjA4Mzg4NTU2MX0.ma9S9Sgx_XLJXCxbVtPgcbPS09yV8sjPNyMCAWXOzMk';

export const supabase = createClient(supabaseUrl, supabaseKey);


// SERVICIOS DE AUTENTICACIÓN

export const authService = {
  // Iniciar sesión
  async iniciarSesion(email, password) {
    // Buscar usuario por email
    const { data: usuario, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('activo', true)
      .single();

    if (error || !usuario) {
      throw new Error('Usuario no encontrado');
    }

   // Verificar password (texto plano temporal)
const passwordValido = (password === usuario.password);

if (!passwordValido) {
  throw new Error('Contraseña incorrecta');
}

    // Actualizar último acceso
    await supabase
      .from('users')
      .update({ ultimoAcceso: new Date().toISOString() })
      .eq('id', usuario.id);

    // No devolver el password
    const { password: _, ...usuarioSinPassword } = usuario;
    return { usuario: usuarioSinPassword };
  },

  // Cerrar sesión
  async cerrarSesion() {
    localStorage.removeItem('sesion');
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuarioId');
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

// SERVICIOS DE TICKETS

export const ticketService = {
  // Generar folio único
  async generarFolio() {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    
    const { count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .gte('fechaCreacion', new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString());

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

    // Crear notificaciones para admins y agentes
    await this.notificarNuevoTicket(data);

    return data;
  },

  // Notificar nuevo ticket
  async notificarNuevoTicket(ticket) {
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
      creador:users!tickets_creador_fkey(id, nombre, apellido, email),
      agente:users!tickets_agente_fkey(id, nombre, apellido),
      categoria:categoriaId(id, nombre, color)
`)
      .order('fechaCreacion', { ascending: false });

    if (filtros.estado) query = query.eq('estado', filtros.estado);
    if (filtros.agenteId) query = query.eq('agenteId', filtros.agenteId);
    if (filtros.creadorId) query = query.eq('creadorId', filtros.creadorId);

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
  creador:users!tickets_creador_fkey(id, nombre, apellido, email),
  agente:users!tickets_agente_fkey(id, nombre, apellido, email),
  categoria:categoriaId(id, nombre, color)
`)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar ticket
  async actualizar(id, datos) {
    const { data, error } = await supabase
      .from('tickets')
      .update({ ...datos, fechaActualizacion: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar ticket
  async eliminar(id) {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Suscribirse a cambios
  suscribirCambios(callback) {
    return supabase
      .channel('tickets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, callback)
      .subscribe();
  }
};


// SERVICIOS DE COMENTARIOS

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

    return data;
  },

  // Obtener comentarios de un ticket
  async obtenerPorTicket(ticketId) {
    const { data, error } = await supabase
      .from('comentarios')
      .select('*, autor:autorId(id, nombre, apellido, rol)')
      .eq('ticketId', ticketId)
      .order('fechaCreacion', { ascending: true });

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


// SERVICIOS DE NOTIFICACIONES

export const notificacionService = {
  // Obtener notificaciones
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
      .eq('usuarioId', usuarioId);

    if (error) throw error;
  },

  // Eliminar
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

  // Suscribirse a nuevas notificaciones
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

// SERVICIOS DE CATEGORÍAS

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
// SERVICIOS DE EVENTOS (CALENDARIO)
// =============================================
export const eventoService = {
  // Crear evento
  async crear(datosEvento, creadorId) {
    const evento = {
      id: crypto.randomUUID(),
      titulo: datosEvento.titulo,
      descripcion: datosEvento.descripcion || '',
      tipo: datosEvento.tipo,
      fechaInicio: datosEvento.fechaInicio,
      fechaFin: datosEvento.fechaFin || null,
      todoElDia: datosEvento.todoElDia || false,
      agenteId: datosEvento.agenteId,
      ticketId: datosEvento.ticketId || null,
      clienteNombre: datosEvento.clienteNombre || '',
      ubicacion: datosEvento.ubicacion || '',
      color: datosEvento.color || '#3498db',
      creadorId,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('eventos')
      .insert(evento)
      .select()
      .single();

    if (error) throw error;

    // Notificar al agente si es diferente al creador
    if (datosEvento.agenteId && datosEvento.agenteId !== creadorId) {
      try {
        await supabase.from('notificaciones').insert({
          id: crypto.randomUUID(),
          usuarioId: datosEvento.agenteId,
          tipo: 'TICKET_ASIGNADO', // Usar tipo existente
          titulo: `Nuevo evento: ${datosEvento.titulo}`,
          mensaje: `${datosEvento.tipo} - ${new Date(datosEvento.fechaInicio).toLocaleDateString('es-ES')}`,
          enlace: `/mi-calendario`,
          leida: false,
          fechaCreacion: new Date().toISOString()
        });
      } catch (notifError) {
        console.error('Error al crear notificación:', notifError);
      }
    }

    return data;
  },

  // Obtener eventos por rango de fechas
  async obtenerPorRango(fechaInicio, fechaFin, agenteId = null) {
    let query = supabase
      .from('eventos')
      .select(`
        *,
        agente:agenteId(id, nombre, apellido),
        creador:creadorId(id, nombre, apellido)
      `)
      .gte('fechaInicio', fechaInicio)
      .lte('fechaInicio', fechaFin)
      .order('fechaInicio', { ascending: true });

    if (agenteId) {
      query = query.eq('agenteId', agenteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Obtener eventos de hoy para un agente
  async obtenerEventosHoy(agenteId) {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('agenteId', agenteId)
      .gte('fechaInicio', inicioHoy)
      .lte('fechaInicio', finHoy)
      .order('fechaInicio', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Obtener todos los eventos (para admin)
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('eventos')
      .select(`
        *,
        agente:agenteId(id, nombre, apellido),
        creador:creadorId(id, nombre, apellido)
      `)
      .order('fechaInicio', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Actualizar evento
  async actualizar(id, datos) {
    const { data, error } = await supabase
      .from('eventos')
      .update({ ...datos, fechaActualizacion: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar evento
  async eliminar(id) {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Suscribirse a cambios de eventos
  suscribirCambios(agenteId, callback) {
    return supabase
      .channel(`eventos-${agenteId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'eventos', filter: `agenteId=eq.${agenteId}` }, 
        callback
      )
      .subscribe();
  }
};


// SERVICIOS DE USUARIOS
export const usuarioService = {
  // Obtener agentes
  async obtenerAgentes() {
    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, apellido, email')
      .in('rol', ['AGENTE', 'JEFE'])
      .eq('activo', true);

    if (error) throw error;
    return data;
  },

  // Crear usuario
  // Crear usuario
async crear(datosUsuario) {
  const id = crypto.randomUUID();

  const usuario = {
    id,
    email: datosUsuario.email,
    password: datosUsuario.password,
    nombre: datosUsuario.nombre,
    apellido: datosUsuario.apellido || '',
    rol: datosUsuario.rol,
    empresa: datosUsuario.empresa || null,
    departamentoId: datosUsuario.departamentoId || null,
    activo: datosUsuario.activo !== undefined ? datosUsuario.activo : true,
    emailVerificado: false,
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('users')
    .insert(usuario)
    .select()
    .single();

  if (error) throw error;
  return data;
},

  // Actualizar usuario
  async actualizar(id, datos) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...datos, fechaActualizacion: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar usuario
  async eliminar(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

// Obtener todos
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('nombre');

    if (error) throw error;
    return data;
  }
};

// SERVICIOS DE ARCHIVOS (STORAGE)
export const archivoService = {
  // Subir archivo
  async subir(archivo, ticketId) {
    const extension = archivo.name.split('.').pop();
    const nombreArchivo = `${ticketId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    
    const { data, error } = await supabase.storage
      .from('adjuntos')
      .upload(nombreArchivo, archivo);

    if (error) throw error;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('adjuntos')
      .getPublicUrl(nombreArchivo);

    // Guardar referencia en la tabla adjuntos
    const adjunto = {
      id: crypto.randomUUID(),
      ticketId,
      nombre: archivo.name,
      tipo: archivo.type,
      tamano: archivo.size,
      url: urlData.publicUrl,
      fechaCreacion: new Date().toISOString()
    };

    const { data: adjuntoData, error: adjuntoError } = await supabase
      .from('adjuntos')
      .insert(adjunto)
      .select()
      .single();

    if (adjuntoError) throw adjuntoError;

    return adjuntoData;
  },

  // Obtener adjuntos de un ticket
  async obtenerPorTicket(ticketId) {
    const { data, error } = await supabase
      .from('adjuntos')
      .select('*')
      .eq('ticketId', ticketId)
      .order('fechaCreacion', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Eliminar archivo
  async eliminar(id, url) {
    const path = url.split('/adjuntos/')[1];
    
    if (path) {
      await supabase.storage
        .from('adjuntos')
        .remove([path]);
    }

    const { error } = await supabase
      .from('adjuntos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Formatear tamaño
  formatearTamaño(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};
