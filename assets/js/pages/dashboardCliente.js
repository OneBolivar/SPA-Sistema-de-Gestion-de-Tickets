import { ticketService } from '../services/api.js';

export async function DashboardClienteView(container) {
    const sessionData = localStorage.getItem('user');
    if (!sessionData) { window.location.hash = '#/login'; return; }
    const usuarioLogueado = JSON.parse(sessionData);

    container.innerHTML = `
        <div class="client-dashboard">
            <header>
                <div>
                    <h2>Panel de Reportes - Soporte TI</h2>
                    <small style="color: var(--text-muted)">Usuario: <strong>${usuarioLogueado.username}</strong> (Cliente)</small>
                </div>
                <button id="btn-logout-cliente" style="background-color: #720000; box-shadow: none;">Cerrar Sesión</button>
            </header>

            <section class="client-form-section" style="background: var(--card-bg); border: 1px solid var(--border-color);">
                <h3>Reportar Nueva Incidencia</h3>
                <form id="client-ticket-form">
                    <input type="text" id="client-title" placeholder="¿Qué problema presenta su equipo?" required>
                    <select id="client-type" required>
                        <option value="">Seleccione la categoría</option>
                        <option value="incidente">Incidente</option>
                        <option value="requerimiento">Requerimiento</option>
                        <option value="soporte">Soporte General</option>
                    </select>
                    <textarea id="client-description" placeholder="Describa el fallo detalladamente..." required rows="3"></textarea>
                    <button type="submit">Enviar Reporte</button>
                </form>
            </section>

            <section class="client-list-section">
                <h3>Mis Solicitudes Enviadas</h3>
                <div id="client-tickets-container">Sincronizando...</div>
            </section>
        </div>
    `;

    const ticketForm = container.querySelector('#client-ticket-form');
    const ticketsContainer = container.querySelector('#client-tickets-container');
    const btnLogout = container.querySelector('#btn-logout-cliente');

    try {
        const todosLosTickets = await ticketService.getAllTickets();
        const misTickets = todosLosTickets.filter(t => t.clientUsername === usuarioLogueado.username);
        renderMisTickets(misTickets, ticketsContainer, container);
    } catch (error) {
        ticketsContainer.innerHTML = `<p style="color:red;">Error al cargar el historial.</p>`;
    }

    ticketForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nuevoTicket = {
            title: container.querySelector('#client-title').value.trim(),
            type: container.querySelector('#client-type').value,
            description: container.querySelector('#client-description').value.trim(),
            status: "En proceso",
            assignedTechId: null, // Regla: Nace sin técnico
            clientUsername: usuarioLogueado.username
        };

        try {
            await ticketService.createTicket(nuevoTicket);
            alert("Reporte registrado.");
            DashboardClienteView(container);
        } catch (error) { alert("Error al guardar."); }
    });

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.hash = '#/login';
    });
}

function renderMisTickets(tickets, container, mainContainer) {
    if (tickets.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-style: italic;">No tiene incidencias registradas.</p>`;
        return;
    }
    container.innerHTML = ''; 

    tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.className = "ticket-card";
        
        let badgeColor = "var(--warning)";
        if (ticket.status === "Asignado") badgeColor = "var(--primary-color)";
        if (ticket.status === "Solucionado") badgeColor = "var(--success)";

        // 🧠 REGLA DE NEGOCIO: Solo mostrar botón de editar si NO tiene técnico asignado
        const puedeEditar = ticket.assignedTechId === null;

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin:0; color: white;">${ticket.title}</h4>
                <span style="background: ${badgeColor}; color: black; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
                    ${ticket.status}
                </span>
            </div>
            <p style="margin: 5px 0; font-size: 12px; color: var(--text-muted);">Categoría: <strong>${ticket.type}</strong></p>
            <p style="color: var(--text-light); margin: 10px 0; font-size: 14px;">${ticket.description}</p>
            <p style="margin: 0 0 10px 0; font-size: 12px; color: var(--text-muted);">
                Especialista asignado: <strong style="color: white;">${ticket.assignedTechId ? ticket.assignedTechId : 'Pendiente por designar'}</strong>
            </p>
            ${puedeEditar ? `<button class="btn-edit-desc" data-id="${ticket.id}" style="background: var(--card-border); color: white; padding: 6px 12px; font-size: 12px; box-shadow: none;">✏️ Editar Descripción</button>` : ''}
        `;

        if (puedeEditar) {
            card.querySelector('.btn-edit-desc').addEventListener('click', async () => {
                const nuevaDesc = prompt("Modifique la descripción de su problema:", ticket.description);
                if (nuevaDesc && nuevaDesc.trim() !== "") {
                    try {
                        await ticketService.updateTicket(ticket.id, { description: nuevaDesc.trim() });
                        alert("Descripción actualizada con éxito.");
                        DashboardClienteView(mainContainer);
                    } catch (err) { alert("Error al actualizar."); }
                }
            });
        }

        container.appendChild(card);
    });
}
