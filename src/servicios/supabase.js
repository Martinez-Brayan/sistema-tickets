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
        creador:creadorId(id, nombre, apellido, email),
        agente:agenteId(id, nombre, apellido),
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
        creador:creadorId(id, nombre, apellido, email),
        agente:agenteId(id, nombre, apellido, email),
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


// SERVICIOS DE USUARIOS

export const usuarioService = {
  async obtenerAgentes() {
    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, apellido, email')
      .in('rol', ['AGENTE', 'JEFE'])
      .eq('activo', true);

    if (error) throw error;
    return data;
  },

  async obtenerTodos() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('nombre');

    if (error) throw error;
    return data;
  }
};