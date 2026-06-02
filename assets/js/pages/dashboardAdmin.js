import { ticketService, authService } from '../services/api.js';

export async function DashboardAdminView(container) {
    container.innerHTML = `
        <div class="admin-dashboard">
            <header>
                <h2>Panel de Control (Administrador)</h2>
                <button id="btn-logout">Cerrar Sesión</button>
            </header>

            <section class="form-section">
                <h3>Crear Nueva Incidencia</h3>
                <form id="ticket-form">
                    <input type="text" id="title" placeholder="Título" required>
                    <select id="type" required>
                        <option value="incidente">Incidente</option>
                        <option value="requerimiento">Requerimiento</option>
                        <option value="soporte">Soporte</option>
                    </select>
                    <textarea id="description" placeholder="Descripción del problema" required></textarea>
                    <select id="tech-assign">
                        <option value="">Sin asignar (En proceso)</option>
                    </select>
                    <button type="submit">Guardar Ticket</button>
                </form>
            </section>

            <section class="list-section">
                <h3>Listado Global de Tickets</h3>
                <div id="tickets-container">Cargando incidencias desde json-server...</div>
            </section>
        </div>
    `;

    const ticketsContainer = container.querySelector('#tickets-container');
    const techSelect = container.querySelector('#tech-assign');
    const ticketForm = container.querySelector('#ticket-form');
    const btnLogout = container.querySelector('#btn-logout');

    // Carga paralela de datos de ambos servidores json-server
    try {
        const [tickets, tecnicos] = await Promise.all([
            ticketService.getAllTickets(),
            authService.getTecnicos()
        ]);

        tecnicos.forEach(tech => {
            const opt = document.createElement('option');
            opt.value = tech.username;
            opt.textContent = tech.username;
            techSelect.appendChild(opt);
        });

        renderTicketsList(tickets, tecnicos, ticketsContainer);
    } catch (err) {
        ticketsContainer.innerHTML = `<p style="color:red;">Error al conectar con los servidores json-server.</p>`;
    }

    // Evento POST: Crear ticket
    ticketForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const adminData = JSON.parse(localStorage.getItem('user'));
        const tecnicoAsignado = techSelect.value;

        const nuevoTicket = {
            title: container.querySelector('#title').value.trim(),
            type: container.querySelector('#type').value,
            description: container.querySelector('#description').value.trim(),
            assignedTechId: tecnicoAsignado || null,
            status: tecnicoAsignado ? "Asignado" : "En proceso",
            clientUsername: adminData.username
        };

        await ticketService.createTicket(nuevoTicket);
        alert("Ticket almacenado en json-server.");
        DashboardAdminView(container); 
    });

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.hash = '#/login';
    });
}

function renderTicketsList(tickets, tecnicos, container) {
    if (tickets.length === 0) {
        container.innerHTML = `<p>No hay registros de tickets en este momento.</p>`;
        return;
    }
    container.innerHTML = '';

    tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.style.border = "1px solid #ccc";
        card.style.padding = "15px";
        card.style.marginBottom = "10px";

        let techOptions = `<option value="">Sin asignar</option>`;
        tecnicos.forEach(t => {
            techOptions += `<option value="${t.username}" ${ticket.assignedTechId === t.username ? 'selected' : ''}>${t.username}</option>`;
        });

        card.innerHTML = `
            <h4>${ticket.title} [${ticket.type}]</h4>
            <p>${ticket.description}</p>
            <p><small>Estado actual: <strong>${ticket.status}</strong></small></p>
            
            <label>Reasignar Técnico:</label>
            <select class="select-tech" data-id="${ticket.id}">${techOptions}</select>

            <label>Cambiar Estado:</label>
            <select class="select-status" data-id="${ticket.id}">
                <option value="En proceso" ${ticket.status === 'En proceso' ? 'selected' : ''}>En proceso</option>
                <option value="Asignado" ${ticket.status === 'Asignado' ? 'selected' : ''}>Asignado</option>
                <option value="Solucionado" ${ticket.status === 'Solucionado' ? 'selected' : ''}>Solucionado</option>
            </select>
            <br><br>
            <button class="btn-delete" data-id="${ticket.id}" style="color:red;">Eliminar</button>
        `;

        // Evento PATCH: Cambiar técnico y ajustar estado automáticamente
        card.querySelector('.select-tech').addEventListener('change', async (e) => {
            const id = e.target.dataset.id;
            const tech = e.target.value;
            const nuevoEstado = tech ? "Asignado" : "En proceso";

            await ticketService.updateTicket(id, { assignedTechId: tech || null, status: nuevoEstado });
            alert("Técnico y estado actualizados en la base de datos.");
            card.querySelector('.select-status').value = nuevoEstado;
        });

        // Evento PATCH: Cambiar estado manual con validación
        card.querySelector('.select-status').addEventListener('change', async (e) => {
            const id = e.target.dataset.id;
            const status = e.target.value;
            const techAsignado = card.querySelector('.select-tech').value;

            if (status === "Asignado" && !techAsignado) {
                alert("Operación inválida: No puedes pasar a 'Asignado' si no hay un técnico seleccionado.");
                e.target.value = "En proceso";
                return;
            }

            await ticketService.updateTicket(id, { status });
            alert("Estado modificado.");
        });

        // Evento DELETE: Eliminar ticket permanente
        card.querySelector('.btn-delete').addEventListener('click', async (e) => {
            if (confirm("¿Eliminar este ticket del servidor?")) {
                await ticketService.deleteTicket(e.target.dataset.id);
                card.remove();
            }
        });

        container.appendChild(card);
    });
}
