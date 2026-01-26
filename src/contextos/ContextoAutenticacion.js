import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../servicios/supabase';

const ContextoAutenticacion = createContext();

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Verificar sesión al cargar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  // Iniciar sesión con Supabase
  const iniciarSesion = async (correo, contrasena) => {
    try {
      const { usuario: usuarioDB } = await authService.iniciarSesion(correo, contrasena);
      
      // Mapear usuario para el frontend
      const usuarioMapeado = {
        id: usuarioDB.id,
        nombre: `${usuarioDB.nombre} ${usuarioDB.apellido || ''}`.trim(),
        correo: usuarioDB.email,
        rol: mapearRol(usuarioDB.rol),
        rolOriginal: usuarioDB.rol,
        departamentoId: usuarioDB.departamentoId
      };

      setUsuario(usuarioMapeado);
      localStorage.setItem('usuario', JSON.stringify(usuarioMapeado));
      localStorage.setItem('usuarioId', usuarioDB.id);

      return { exito: true, usuario: usuarioMapeado };
    } catch (error) {
      console.error('Error de login:', error);
      return { exito: false, mensaje: error.message };
    }
  };

  // Mapear roles de BD a roles del frontend
  const mapearRol = (rolBD) => {
    switch (rolBD) {
      case 'ADMIN':
      case 'JEFE':
        return 'administrador';
      case 'AGENTE':
        return 'agente';
      case 'CLIENTE':
        return 'cliente';
      default:
        return 'cliente';
    }
  };

  // Cerrar sesión
  const cerrarSesion = async () => {
    try {
      await authService.cerrarSesion();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    
    setUsuario(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuarioId');
  };

  // Verificar rol
  const tieneRol = (rol) => {
    return usuario?.rol === rol;
  };

  const valor = {
    usuario,
    usuarioId: usuario?.id,
    cargando,
    autenticado: !!usuario,
    iniciarSesion,
    cerrarSesion,
    tieneRol
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

export default ContextoAutenticacion;