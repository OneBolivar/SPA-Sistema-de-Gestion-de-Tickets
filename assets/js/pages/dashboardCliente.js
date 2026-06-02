import { ticketService } from '../services/api.js';

export async function DashboardClienteView(container) {
    const sessionData = localStorage.getItem('user');
    if (!sessionData) {
        window.location.hash = '#/login';
        return;
    }
    const usuarioLogueado = JSON.parse(sessionData);

    // 1. Inyectar estructura HTML con la paleta de colores tecnológica
    container.innerHTML = `
        <div class="client-dashboard">
            <header>
                <div>
                    <h2>Panel de Reportes - Soporte TI</h2>
                    <small style="color: var(--text-muted)">Usuario: <strong>${usuarioLogueado.username}</strong> (Cliente)</small>
                </div>
                <button id="btn-logout-cliente" style="background-color: #720000; box-shadow: none;">Cerrar Sesión</button>
            </header>

            <!-- FORMULARIO DE REPORTE -->
            <section class="client-form-section" style="background: var(--card-bg); border: 1px solid var(--border-color);">
                <h3>Reportar Nueva Incidencia</h3>
                <form id="client-ticket-form">
                    <input type="text" id="client-title" placeholder="¿Qué problema presenta su equipo? (Ej: Error de impresora)" required>
                    
                    <select id="client-type" required>
                        <option value="">Seleccione la categoría del caso</option>
                        <option value="incidente">Incidente (Fallo técnico)</option>
                        <option value="requerimiento">Requerimiento (Nueva solicitud)</option>
                        <option value="soporte">Soporte General</option>
                    </select>
                    
                    <textarea id="client-description" placeholder="Describa el fallo detalladamente para ayudar al equipo técnico..." required rows="3"></textarea>
                    
                    <button type="submit">Enviar Reporte de Ticket</button>
                </form>
            </section>

            <!-- HISTORIAL PROPIO -->
            <section class="client-list-section">
                <h3>Mis Solicitudes Enviadas</h3>
                <div id="client-tickets-container">Sincronizando sus registros...</div>
            </section>
        </div>
    `;

    const ticketForm = container.querySelector('#client-ticket-form');
    const ticketsContainer = container.querySelector('#client-tickets-container');
    const btnLogout = container.querySelector('#btn-logout-cliente');

    // 2. Consumir el READ de la API local y filtrar datos en el Frontend
    try {
        const todosLosTickets = await ticketService.getAllTickets();
        
        // Regla estricta de privacidad: El cliente solo ve lo que él mismo creó
        const misTickets = todosLosTickets.filter(t => t.clientUsername === usuarioLogueado.username);
        
        renderMisTickets(misTickets, ticketsContainer);
    } catch (error) {
        ticketsContainer.innerHTML = `<p style="color:red;">Error al cargar su historial desde json-server.</p>`;
    }

    // 3. Evento CREATE: Enviar datos del formulario al servidor
    ticketForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoTicket = {
            title: container.querySelector('#client-title').value.trim(),
            type: container.querySelector('#client-type').value,
            description: container.querySelector('#client-description').value.trim(),
            status: "En proceso",                     // Nace en este estado obligatorio
            assignedTechId: null,                     // Inicia libre sin técnico
            clientUsername: usuarioLogueado.username  // Autoría asignada automáticamente
        };

        try {
            await ticketService.createTicket(nuevoTicket);
            alert("Su incidencia ha sido registrada en el sistema.");
            DashboardClienteView(container); // Recarga modular instantánea
        } catch (error) {
            alert("No se pudo procesar el registro en la base de datos.");
        }
    });

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.hash = '#/login';
    });
}

// 4. Renderizado dinámico de tarjetas para el panel de cliente
function renderMisTickets(tickets, container) {
    if (tickets.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-style: italic;">Usted no tiene incidencias registradas vigentes.</p>`;
        return;
    }
    container.innerHTML = ''; 

    tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.className = "ticket-card";
        card.style.background = "var(--card-bg)";
        card.style.padding = "20px";
        card.style.marginBottom = "15px";
        card.style.border = "1px solid var(--border-color)";
        card.style.borderRadius = "8px";
        card.style.borderLeft = "6px solid var(--accent-purple)";

        // Etiqueta de estado con colores dinámicos según el avance
        let badgeColor = "var(--warning)";
        if (ticket.status === "Asignado") badgeColor = "var(--primary-color)";
        if (ticket.status === "Solucionado") badgeColor = "var(--success)";

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin:0; color: white;">${ticket.title}</h4>
                <span style="background: ${badgeColor}; color: black; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
                    ${ticket.status}
                </span>
            </div>
            <p style="margin: 5px 0; font-size: 12px; color: var(--text-muted);">Categoría: <strong>${ticket.type}</strong></p>
            <p style="color: var(--text-light); margin: 10px 0; font-size: 14px;">${ticket.description}</p>
            <p style="margin: 0; font-size: 12px; color: var(--text-muted); border-top: 1px dashed var(--border-color); padding-top: 8px;">
                Especialista asignado: <strong style="color: white;">${ticket.assignedTechId ? ticket.assignedTechId : 'Pendiente por designar'}</strong>
            </p>
        `;
        container.appendChild(card);
    });
}
