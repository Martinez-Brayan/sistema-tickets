import React, { useState } from 'react';
import { FaFileAlt, FaDownload, FaCalendarAlt, FaPrint } from 'react-icons/fa';
import './Reportes.css';

function Reportes() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const [tipoReporte, setTipoReporte] = useState('general');

  const fechaActual = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Datos del reporte
  const datos = {
    periodo: 'Enero 2026',
    fechaGeneracion: fechaActual,
    
    resumenGeneral: {
      ticketsCreados: 156,
      ticketsResueltos: 128,
      ticketsPendientes: 28,
      tiempoPromedioRespuesta: '2 horas 30 minutos',
      tiempoPromedioResolucion: '8 horas 15 minutos',
      satisfaccionCliente: 94
    },

    ticketsPorEstado: [
      { estado: 'Abierto', cantidad: 23 },
      { estado: 'En Proceso', cantidad: 45 },
      { estado: 'En Espera de Usuario', cantidad: 12 },
      { estado: 'Resuelto', cantidad: 68 },
      { estado: 'Cerrado', cantidad: 8 }
    ],

    ticketsPorPrioridad: [
      { prioridad: 'Alta', cantidad: 28 },
      { prioridad: 'Media', cantidad: 67 },
      { prioridad: 'Baja', cantidad: 61 }
    ],

    ticketDepartamento: [
      { departamento : 'Soporte Técnico', cantidad: 72 },
      { departamento : 'Ventas', cantidad: 34 },
      { departamento : 'Administración', cantidad: 25 },
      { departamento : 'Recursos Humanos', cantidad: 15 }

    ],

    ticketsPorCategoria: [
      { categoria: 'Hardware', cantidad: 34 },
      { categoria: 'Software', cantidad: 52 },
      { categoria: 'Red', cantidad: 28 },
      { categoria: 'Accesos', cantidad: 22 },
      { categoria: 'Otros', cantidad: 20 }      
    ],

    empresasConMasTickets: [
      { empresa: '...', cantidad: 32 },
      { empresa: 'Panama', cantidad: 28 },
      { empresa: ' empresa..', cantidad: 18 },
      { empresa: 'empresa \...', cantidad: 15 }
    ]
  };

  const exportarReporte = (formato) => {
    alert(`Exportando reporte en formato ${formato}...`);
  };

  const imprimirReporte = () => {
    window.print();
  };

  return (
    <div className="reportes-contenedor">
      {/* Controles */}
      <div className="reportes-controles no-print">
        <div className="filtros">
          <div className="filtro-grupo">
            <FaCalendarAlt />
            <select value={periodoSeleccionado} onChange={(e) => setPeriodoSeleccionado(e.target.value)}>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="trimestre">Ultimo trimestre</option>
              <option value="ano">Este ano</option>
            </select>
          </div>
          <div className="filtro-grupo">
            <FaFileAlt />
            <select value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
              <option value="general">Reporte General</option>
              <option value="agentes">Reporte de Agentes</option>
              <option value="clientes">Reporte de Clientes</option>
            </select>
          </div>
        </div>
        <div className="acciones">
          <button className="boton-accion" onClick={imprimirReporte}>
            <FaPrint /> Imprimir
          </button>
          <button className="boton-accion pdf" onClick={() => exportarReporte('PDF')}>
            <FaDownload /> PDF
          </button>
          <button className="boton-accion excel" onClick={() => exportarReporte('Excel')}>
            <FaDownload /> Excel
          </button>
        </div>
      </div>

      {/* Documento del reporte */}
      <div className="reporte-documento">
        {/* Encabezado del documento */}
        <div className="documento-encabezado">
          <h1>REPORTE DE HELPDESK</h1>
          <h2>Periodo: {datos.periodo}</h2>
          <p className="fecha-generacion">Generado el: {datos.fechaGeneracion}</p>
        </div>

        {/* Seccion 1: Resumen Ejecutivo */}
        <div className="documento-seccion">
          <h3>1. RESUMEN EJECUTIVO</h3>
          <div className="seccion-contenido">
            <p>Durante el periodo de <strong>{datos.periodo}</strong>, el sistema de HelpDesk registro un total de <strong>{datos.resumenGeneral.ticketsCreados} tickets</strong>, de los cuales <strong>{datos.resumenGeneral.ticketsResueltos}</strong> fueron resueltos satisfactoriamente, representando una tasa de resolucion del <strong>{Math.round((datos.resumenGeneral.ticketsResueltos / datos.resumenGeneral.ticketsCreados) * 100)}%</strong>.</p>
            
            <p>El tiempo promedio de primera respuesta fue de <strong>{datos.resumenGeneral.tiempoPromedioRespuesta}</strong>, mientras que el tiempo promedio de resolucion completa fue de <strong>{datos.resumenGeneral.tiempoPromedioResolucion}</strong>.</p>
            
            <p>La satisfaccion general del cliente se mantuvo en un <strong>{datos.resumenGeneral.satisfaccionCliente}%</strong>, lo cual indica un nivel de servicio satisfactorio.</p>
          </div>
        </div>

        {/* Seccion 2: Tickets por Estado */}
        <div className="documento-seccion">
          <h3>2. DISTRIBUCION DE TICKETS POR ESTADO</h3>
          <div className="seccion-contenido">
            <table className="tabla-reporte">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Cantidad</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {datos.ticketsPorEstado.map((item, index) => (
                  <tr key={index}>
                    <td>{item.estado}</td>
                    <td>{item.cantidad}</td>
                    <td>{Math.round((item.cantidad / datos.resumenGeneral.ticketsCreados) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>TOTAL</strong></td>
                  <td><strong>{datos.resumenGeneral.ticketsCreados}</strong></td>
                  <td><strong>100%</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Seccion 3: Tickets por Prioridad */}
        <div className="documento-seccion">
          <h3>3. DISTRIBUCION DE TICKETS POR PRIORIDAD</h3>
          <div className="seccion-contenido">
            <table className="tabla-reporte">
              <thead>
                <tr>
                  <th>Prioridad</th>
                  <th>Cantidad</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {datos.ticketsPorPrioridad.map((item, index) => (
                  <tr key={index}>
                    <td>{item.prioridad}</td>
                    <td>{item.cantidad}</td>
                    <td>{Math.round((item.cantidad / datos.resumenGeneral.ticketsCreados) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seccion 4: Tickets por Categoria */}
        <div className="documento-seccion">
          <h3>4. DISTRIBUCION DE TICKETS POR CATEGORIA</h3>
          <div className="seccion-contenido">
            <table className="tabla-reporte">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Cantidad</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {datos.ticketsPorCategoria.map((item, index) => (
                  <tr key={index}>
                    <td>{item.categoria}</td>
                    <td>{item.cantidad}</td>
                    <td>{Math.round((item.cantidad / datos.resumenGeneral.ticketsCreados) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Seccion 6: Empresas con mas Tickets */}
        <div className="documento-seccion">
          <h3>6. EMPRESAS CON MAYOR CANTIDAD DE TICKETS</h3>
          <div className="seccion-contenido">
            <table className="tabla-reporte">
              <thead>
                <tr>
                  <th>Posicion</th>
                  <th>Empresa</th>
                  <th>Cantidad de Tickets</th>
                </tr>
              </thead>
              <tbody>
                {datos.empresasConMasTickets.map((empresa, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{empresa.empresa}</td>
                    <td>{empresa.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pie del documento */}
        <div className="documento-pie">
          <p>--- Fin del Reporte ---</p>
        </div>
      </div>
    </div>
  );
}

export default Reportes;