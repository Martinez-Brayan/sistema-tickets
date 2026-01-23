//página principal estilo Service Desk
import React, { useState } from 'react';
import { FaTicketAlt, FaCheckCircle, FaCog,  } from 'react-icons/fa';
import './Dashboard.css';

function Dashboard() {
  const [visibilidad, setVisibilidad] = useState('Personal');
  const [cuadroMando, setCuadroMando] = useState('Tablero principal');
  const [frecuencia, setFrecuencia] = useState('Dia');
  const [modoGrafico, setModoGrafico] = useState('Grafico');
  const [categoriaGrafico, setCategoriaGrafico] = useState('Estado');

  //PRUEBAS ERA PARA VER COMO IBA QUEDANDO TODO 
  const ticketsPorAtender = [
    
  ];

  return (
    <div className="dashboard-service">
      <div className="filtros-superiores">
        <div className="filtro-grupo">
          <label>Visibilidad</label>
          <select value={visibilidad} onChange={(e) => setVisibilidad(e.target.value)}>
            <option value="Personal">Personal</option>
            <option value="Equipo">Equipo</option>
            <option value="Servicio">Servicio</option>
          </select>
        </div>

        <div className="filtro-grupo filtro-cuadro">
          <label>Cuadro de mando</label>
          <select value={cuadroMando} onChange={(e) => setCuadroMando(e.target.value)}>
            <option value="Tablero principal">Tablero principal</option>
            <option value="Tablero tecnico">Tablero tecnico</option>
            <option value="Tablero gerencial">Tablero gerencial</option>
          </select>
        </div>

        <button className="boton-tendencias">Rango de tendencias</button>

        <div className="filtro-grupo">
          <label>Frecuencia</label>
          <select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)}>
            <option value="Dia">Dia</option>
            <option value="Semana">Semana</option>
            <option value="Mes">Mes</option>
          </select>
        </div>

        <div className="filtros-acciones">
          <button className="boton-accion-filtro rojo"></button>
          <button className="boton-accion-filtro amarillo"></button>
          <button className="boton-accion-filtro verde"></button>
        </div>
      </div>

      <div className="tarjetas-resumen">
        <div className="tarjeta-resumen verde">
          <FaCheckCircle className="tarjeta-icono" />
          <div className="tarjeta-contenido">
            <span className="tarjeta-texto">Peticiones pendientes de atencion</span>
            <span className="tarjeta-numero">0</span>
          </div>
        </div>

        <div className="tarjeta-resumen azul">
          <FaTicketAlt className="tarjeta-icono" />
          <div className="tarjeta-contenido">
            <span className="tarjeta-texto">Tickets Vigentes Totales</span>
          </div>
        </div>
      </div>

      <div className="seccion-tabla">
        <div className="seccion-encabezado">
          <h3>Tickets por Atender</h3>
          <button className="boton-config"><FaCog /></button>
        </div>
        <div className="tabla-contenedor">
          <table className="tabla-tickets-dashboard">
            <thead>
              <tr>
                <th>ID Entrada</th>
                <th>Titulo</th>
                <th>Empresa</th>
                <th>Asignado a</th>
                <th>Fec. creacion</th>
                <th>Fec Inicial Atencion</th>
              </tr>
            </thead>
            <tbody>
              {ticketsPorAtender.map(ticket => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.titulo}</td>
                  <td>{ticket.empresa}</td>
                  <td>{ticket.asignado}</td>
                  <td>{ticket.fechaCreacion}</td>
                  <td>{ticket.fechaAtencion || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="seccion-graficos">
        <div className="grafico-contenedor">
          <div className="seccion-encabezado">
            <h3>Tickets vigentes</h3>
            <button className="boton-config"><FaCog /></button>
          </div>
          
          <div className="grafico-cuerpo">
            <div className="grafico-pastel">
              <div className="pastel">
                <div className="pastel-centro">
                </div>
              </div>
            </div>
            
            <div className="grafico-controles">
              <div className="modo-selector">
                <label>Modo</label>
                <div className="botones-modo">
                  <button 
                    className={modoGrafico === 'Grafico' ? 'activo' : ''}
                    onClick={() => setModoGrafico('Grafico')}
                  >
                    Grafico
                  </button>
                  <button 
                    className={modoGrafico === 'Tabla' ? 'activo' : ''}
                    onClick={() => setModoGrafico('Tabla')}
                  >
                    Tabla
                  </button>
                </div>
              </div>
              
              <div className="categoria-selector">
                <label>Categoria</label>
                <select value={categoriaGrafico} onChange={(e) => setCategoriaGrafico(e.target.value)}>
                  <option value="Estado">Estado</option>
                  <option value="Prioridad">Prioridad</option>
                  <option value="Categoria">Categoria</option>
                </select>
              </div>
              
              <div className="leyenda">
                <div className="leyenda-item">
                  <span className="color-leyenda azul-claro"></span>
                  Respondido usuario
                </div>
                <div className="leyenda-item">
                  <span className="color-leyenda amarillo"></span>
                  Abierta
                </div>
                <div className="leyenda-item">
                  <span className="color-leyenda verde"></span>
                  En Proceso
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grafico-contenedor ancho-completo">
          <div className="seccion-encabezado">
            <h3>Abiertos vs Cerrados</h3>
            <button className="boton-config"><FaCog /></button>
          </div>
          
          <div className="grafico-barras">
            <div className="leyenda-barras">
              <div className="leyenda-item">
                <span className="color-leyenda azul"></span>
                Tickets creados
              </div>
              <div className="leyenda-item">
                <span className="color-leyenda amarillo"></span>
                Tickets cerrados
              </div>
            </div>
            
            <div className="barras-contenedor">
              <div className="eje-y">
                <span>2.0</span>
                <span>1.5</span>
                <span>1.0</span>
                <span>0.5</span>
              </div>
              <div className="barras-area">
                <div className="barra-grupo">
                  <div className="barra azul" style={{height: '60%'}}></div>
                  <div className="barra amarilla" style={{height: '0%'}}></div>
                </div>
                <div className="barra-grupo">
                  <div className="barra azul" style={{height: '0%'}}></div>
                  <div className="barra amarilla" style={{height: '0%'}}></div>
                </div>
                <div className="barra-grupo">
                  <div className="barra azul" style={{height: '0%'}}></div>
                  <div className="barra amarilla" style={{height: '0%'}}></div>
                </div>
                <div className="barra-grupo">
                  <div className="barra azul" style={{height: '0%'}}></div>
                  <div className="barra amarilla" style={{height: '0%'}}></div>
                </div>
                <div className="barra-grupo">
                  <div className="barra azul" style={{height: '0%'}}></div>
                  <div className="barra amarilla" style={{height: '0%'}}></div>
                </div>
                <div className="barra-grupo">
                  <div className="barra azul" style={{height: '0%'}}></div>
                  <div className="barra amarilla" style={{height: '0%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;