import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../servicios/supabase';

const ContextoAutenticacion = createContext();

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [sesionId, setSesionId] = useState(null);

  // Verificar sesión al cargar
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('sesion');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (sesionGuardada && usuarioGuardado) {
      setSesionId(sesionGuardada);
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  // Iniciar sesión
  const iniciarSesion = async (email, password) => {
    try {
      const { usuario, sesionId } = await authService.iniciarSesion(email, password);
      
      // Mapear rol para compatibilidad con el frontend
      const usuarioMapeado = {
        id: usuario.id,
        nombre: `${usuario.nombre} ${usuario.apellido || ''}`.trim(),
        email: usuario.email,
        rol: usuario.rol.toLowerCase(), // ADMIN -> administrador, etc.
        departamentoId: usuario.departamentoId
      };

      // Ajustar rol para el frontend
      if (usuarioMapeado.rol === 'admin' || usuarioMapeado.rol === 'jefe') {
        usuarioMapeado.rol = 'administrador';
      } else if (usuarioMapeado.rol === 'agente') {
        usuarioMapeado.rol = 'agente';
      } else {
        usuarioMapeado.rol = 'cliente';
      }

      setUsuario(usuarioMapeado);
      setSesionId(sesionId);
      
      localStorage.setItem('sesion', sesionId);
      localStorage.setItem('usuario', JSON.stringify(usuarioMapeado));
      localStorage.setItem('usuarioId', usuario.id);

      return { exito: true };
    } catch (error) {
      console.error('Error de login:', error);
      return { exito: false, error: error.message };
    }
  };

  // Cerrar sesión
  const cerrarSesion = async () => {
    try {
      await authService.cerrarSesion(sesionId);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    
    setUsuario(null);
    setSesionId(null);
    localStorage.removeItem('sesion');
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuarioId');
  };

  const valor = {
    usuario,
    usuarioId: usuario?.id,
    cargando,
    autenticado: !!usuario,
    iniciarSesion,
    cerrarSesion
  };

  return (
    <ContextoAutenticacion.Provider value={valor}>
      {children}
    </ContextoAutenticacion.Provider>
  );
}

export function useAutenticacion() {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error('useAutenticacion debe usarse dentro de ProveedorAutenticacion');
  }
  return contexto;
}