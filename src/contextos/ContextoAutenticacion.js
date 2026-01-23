
// Usuarios de prueba para poder cambiar entre roles 
 //para ver como van quedando las paginas
import React, { createContext, useState, useContext } from 'react';

const ContextoAutenticacion = createContext();

const USUARIOS_PRUEBA = [
  {
    id: 1,
    correo: 'admin@helpdesk.com',
    contrasena: 'admin123',
    nombre: 'Administrador General',
    rol: 'administrador'
  },
  {
    id: 2,
    correo: 'agente@helpdesk.com',
    contrasena: 'agente123',
    nombre: ' Ruiz',
    rol: 'agente'
  },
  {
    id: 3,
    correo: 'agente2@helpdesk.com',
    contrasena: 'agente123',
    nombre: 'Maria Garcia',
    rol: 'agente'
  },
  {
    id: 4,
    correo: 'cliente@helpdesk.com',
    contrasena: 'cliente123',
    nombre: ' Perez',
    rol: 'cliente'
  },
  {
    id: 5,
    correo: 'cliente2@helpdesk.com',
    contrasena: 'cliente123',
    nombre: ' Lopez',
    rol: 'cliente'
  }
];

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [autenticado, setAutenticado] = useState(false);

  const iniciarSesion = (correo, contrasena) => {
    const usuarioEncontrado = USUARIOS_PRUEBA.find(
      u => u.correo === correo && u.contrasena === contrasena
    );

    if (usuarioEncontrado) {
      setUsuario(usuarioEncontrado);
      setAutenticado(true);
      return { exito: true, usuario: usuarioEncontrado };
    } else {
      return { exito: false, mensaje: 'Correo o contrasena incorrectos' };
    }
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setAutenticado(false);
  };

  const tieneRol = (rol) => {
    return usuario?.rol === rol;
  };

  const valor = {
    usuario,
    autenticado,
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