// Login.js de inicio de sesión con roles
import React, { useState } from 'react';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import './Login.css';

function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const { iniciarSesion } = useAutenticacion();

  const manejarEnvio=(evento) => {
    evento.preventDefault();
    
    if (!correo || !contrasena) {
      setError('Por favor complete todos los campos');
      return;
    }

    const resultado = iniciarSesion(correo, contrasena);
    
    if (!resultado.exito) {
      setError(resultado.mensaje);
    }
  };

  return (
    <div className="login-contenedor">
      <div className="login-caja">
        <h1 className="login-titulo">🎫 HelpDesk</h1>
        <h2 className="login-subtitulo">Iniciar Sesión</h2>
        
        {error && <p className="login-error">{error}</p>}
        
        <form onSubmit={manejarEnvio}>
          <div className="login-campo">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
          
          <div className="login-campo">
            <label>Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Ingrese su contraseña"
            />
          </div>
          
          <button type="submit" className="login-boton">
            Enviar
          </button>
        </form>

       
      </div>
    </div>
  );
}
export default Login;