import { ticketService } from '../services/api.js';

export async function DashboardClienteView(container) {
    // 1. Obtener los datos del cliente logueado desde el localStorage
    const usuarioLogueado = JSON.parse(localStorage.getItem('user'));

    // 2. Renderizar la estructura HTML de la página del cliente
    container.innerHTML = `
        <div class="client-dashboard">
            <header style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Panel de Reportes - Cliente: ${usuarioLogueado.username}</h2>
                <button id="btn-logout-cliente" style="background-color: #ff4d4d; color: white; border: none; padding: 8px 12px; cursor: pointer;">Cerrar Sesión</button>
            </header>

            <!-- Sección para reportar un problema nuevo -->
            <section class="client-form-section" style="margin-top: 20px; padding: 15px; border: 1px solid #ddd;">
                <h3>Reportar Nueva Incidencia o Requerimiento</h3>
                <form id="client-ticket-form" style="display: flex; flex-direction: column; gap: 10px; max-width: 400px;">
                    <input type="text" id="client-title" placeholder="¿Cuál es el problema? (Ej: Monitor no enciende)" required>
                    
                    <select id="client-type" required>
                        <option value="">Seleccione el tipo de caso</option>
                        <option value="incidente">Incidente (Fallo técnico)</option>
                        <option value="requerimiento">Requerimiento (Solicitud de algo nuevo)</option>
                        <option value="soporte">Soporte general</option>
                    </select>
                    
                    <textarea id="client-description" placeholder="Describe detalladamente lo que ocurre..." required rows="4"></textarea>
                    
                    <button type="submit" style="background-color: #28a745; color: white; border: none; padding: 10px; cursor: pointer;">Enviar Reporte</button>
                </form>
            </section>

            <!-- Sección de historial de tickets propios -->
            <section class="client-list-section" style="margin-top: 30px;">
                <h3>Mis Tickets Reportados</h3>
                <div id="client-tickets-container">Cargando tus solicitudes...</div>
            </section>
        </div>
    `;

    // 3. Capturar elementos específicos del DOM inyectado
    const ticketForm = container.querySelector('#client-ticket-form');
    const ticketsContainer = container.querySelector('#client-tickets-container');
    const btnLogout = container.querySelector('#btn-logout-cliente');

    // 4. Cargar y filtrar los tickets desde json-server usando Fetch
    try {
        const todosLosTickets = await ticketService.getAllTickets();
        
        // Regla de privacidad: Filtrar para mostrar SOLO los del cliente actual
        const misTickets = todosLosTickets.filter(ticket => ticket.clientUsername === usuarioLogueado.username);
        
        renderMisTickets(misTickets, ticketsContainer);
    } catch (error) {
        ticketsContainer.innerHTML = `<p style="color: red;">Error al cargar tu historial de tickets.</p>`;
    }

    // 5. Evento POST: Crear ticket desde la perspectiva del cliente
    ticketForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Estructura obligatoria según las reglas de negocio del problema
        const nuevoTicket = {
            title: container.querySelector('#client-title').value.trim(),
            type: container.querySelector('#client-type').value,
            description: container.querySelector('#client-description').value.trim(),
            status: "En proceso",          // Todo ticket de cliente inicia en este estado
            assignedTechId: null,          // Inicia sin técnico asignado
            clientUsername: usuarioLogueado.username // El autor es el usuario actual
        };

        try {
            await ticketService.createTicket(nuevoTicket);
            alert("Tu reporte ha sido enviado con éxito al departamento de TI.");
            
            // Recargar la vista de forma modular para actualizar la lista en tiempo real
            DashboardClienteView(container); 
        } catch (error) {
            alert("Hubo un fallo al enviar el reporte.");
        }
    });

    // 6. Evento de cierre de sesión
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.hash = '#/login';
    });
}

// 7. Función interna modular para renderizar el listado de tickets propios
function renderMisTickets(tickets, container) {
    if (tickets.length === 0) {
        container.innerHTML = `<p>Aún no has reportado ninguna incidencia.</p>`;
        return;
    }

    container.innerHTML = ''; // Limpiar texto de carga

    tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.style.border = "1px solid #bbb";
        card.style.padding = "12px";
        card.style.marginBottom = "10px";
        card.style.borderRadius = "4px";
        
        // Color dinámico según el estado del ticket para mejorar la interfaz
        let colorEstado = "#ffc107"; // Amarillo para "En proceso"
        if (ticket.status === "Asignado") colorEstado = "#17a2b8"; // Azul
        if (ticket.status === "Solucionado") colorEstado = "#28a745"; // Verde

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4>${ticket.title}</h4>
                <span style="background-color: ${colorEstado}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold;">
                    ${ticket.status}
                </span>
            </div>
            <p style="margin: 5px 0;"><small>Categoría: <strong>${ticket.type}</strong></small></p>
            <p style="color: #555;">${ticket.description}</p>
            <p style="margin-top: 10px; font-size: 12px; color: #777;">
                Técnico asignado: <strong>${ticket.assignedTechId ? ticket.assignedTechId : 'Pendiente por asignar'}</strong>
            </p>
        `;
        container.appendChild(card);
    });
}
