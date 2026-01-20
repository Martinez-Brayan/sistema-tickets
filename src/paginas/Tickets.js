// Página de gestión de tickets
import React, { useState } from 'react';
import ListaTickets from '../componentes/tickets/ListaTickets';
import FormularioTicket from '../componentes/tickets/FormularioTicket';

function Tickets() {
  // Estado para controlar si el formulario está abierto
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Función para abrir formulario de nuevo ticket
  const abrirNuevoTicket = () => {
    setMostrarFormulario(true);
  };

  // Función para cerrar formulario
  const cerrarFormulario = () => {
    setMostrarFormulario(false);
  };

  // Función para guardar ticket
  const guardarTicket = (ticket) => {
    console.log('Ticket guardado:', ticket);
    alert('¡Ticket creado exitosamente!');
    setMostrarFormulario(false);
  };

  // Función para ver detalle de ticket
  const verTicket = (ticket) => {
    alert(`Ver ticket: ${ticket.titulo}`);
  };

  return (
    <div>
      <ListaTickets 
        onNuevoTicket={abrirNuevoTicket}
        onVerTicket={verTicket}
      />

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <FormularioTicket 
          onCerrar={cerrarFormulario}
          onGuardar={guardarTicket}
        />
      )}
    </div>
  );
}

export default Tickets;