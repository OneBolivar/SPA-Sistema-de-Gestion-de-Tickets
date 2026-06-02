import { ticketService } from '../services/api.js';

export async function DashboardTecnicoView(container) {
    const sessionData = localStorage.getItem('user');
    if (!sessionData) { window.location.hash = '#/login'; return; }
    const tecnicoLogueado = JSON.parse(sessionData);

    container.innerHTML = `
        <div class="tech-dashboard">
            <header>
                <div>
                    <h2>Centro de Operaciones Técnico</h2>
                    <small style="color: var(--text-muted)">Especialista de guardia: <strong>${tecnicoLogueado.username}</strong></small>
                </div>
                <button id="btn-logout-tech" style="background-color: #720000; box-shadow: none;">Cerrar Sesión</button>
            </header>

            <section class="tech-form-section" style="background: var(--card-bg); border: 1px solid var(--border-color);">
                <h3>Registrar Incidencia Interna (Autoasignada)</h3>
                <form id="tech-ticket-form">
                    <input type="text" id="tech-title" placeholder="Título o asunto del fallo" required>
                    <select id="tech-type" required>
                        <option value="">Clasificación del caso</option>
                        <option value="incidente">Incidente</option>
                        <option value="requerimiento">Requerimiento</option>
                        <option value="soporte">Soporte</option>
                    </select>
                    <textarea id="tech-description" placeholder="Anotaciones de diagnóstico inicial..." required rows="3"></textarea>
                    <button type="submit">Guardar y Asignar a mi Perfil</button>
                </form>
            </section>

            <section class="tech-lists-section">
                <div>
                    <h3 style="color: var(--success); margin-bottom:15px;">📋 Mis Tareas Asignadas</h3>
                    <div id="my-tickets-container">Buscando...</div>
                </div>
                <div>
                    <h3 style="color: var(--text-muted); margin-bottom:15px;">🌐 Resumen de Casos Globales</h3>
                    <div id="other-tickets-container">Sincronizando...</div>
                </div>
            </section>
        </div>
    `;

    const ticketForm = container.querySelector('#tech-ticket-form');
    const myTicketsContainer = container.querySelector('#my-tickets-container');
    const otherTicketsContainer = container.querySelector('#other-tickets-container');
    const btnLogout = container.querySelector('#btn-logout-tech');

    try {
        const todosLosTickets = await ticketService.getAllTickets();
        const misCasos = todosLosTickets.filter(t => t.assignedTechId === tecnicoLogueado.username);
        const otrosCasos = todosLosTickets.filter(t => t.assignedTechId !== tecnicoLogueado.username);

        renderMisCasos(misCasos, myTicketsContainer, container);
        renderOtrosCasos(otrosCasos, otherTicketsContainer);
    } catch (error) {
        myTicketsContainer.innerHTML = `<p style="color:red;">Error de conexión.</p>`;
    }

    // 🧠 REGLA DE NEGOCIO CUMPLIDA: Al crear, se autoasigna al técnico logueado
    ticketForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nuevoTicketInterno = {
            title: container.querySelector('#tech-title').value.trim(),
            type: container.querySelector('#tech-type').value,
            description: container.querySelector('#tech-description').value.trim(),
            status: "Asignado",                     
            assignedTechId: tecnicoLogueado.username, // Responsable automático
            clientUsername: tecnicoLogueado.username  
        };

        try {
            await ticketService.createTicket(nuevoTicketInterno);
            alert("Incidencia interna autoasignada.");
            DashboardTecnicoView(container);
        } catch (error) { alert("Error al guardar."); }
    });

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.hash = '#/login';
    });
}

function renderMisCasos(tickets, container, mainContainer) {
    if (tickets.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-style: italic;">No posee tareas asignadas.</p>`;
        return;
    }
    container.innerHTML = '';

    tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.className = "ticket-card";
        card.style.borderLeft = "6px solid var(--success)";

        card.innerHTML = `
            <div style="display:flex; justify-content:between; align-items:center;">
                <h4 style="margin:0; color:white; flex:1;">${ticket.title}</h4>
                <span>${ticket.type}</span>
            </div>
            <p style="color: var(--text-light); margin:8px 0; font-size:13px;">${ticket.description}</p>
            <p style="font-size:11px; color:var(--text-muted); margin:0 0 10px 0;">Usuario: <strong>${ticket.clientUsername}</strong></p>
            
            <div style="display:flex; align-items:center; gap:10px; background:#081C13; padding:8px; border-radius:4px;">
                <label style="font-size:11px; color:var(--text-muted); font-weight:bold;">Estado:</label>
                <select class="tech-status-select" data-id="${ticket.id}">
                    <option value="En proceso" ${ticket.status === 'En proceso' ? 'selected' : ''}>En proceso</option>
                    <option value="Asignado" ${ticket.status === 'Asignado' ? 'selected' : ''}>Asignado</option>
                    <option value="Solucionado" ${ticket.status === 'Solucionado' ? 'selected' : ''}>Solucionado</option>
                </select>
            </div>
        `;

        card.querySelector('.tech-status-select').addEventListener('change', async (e) => {
            try {
                await ticketService.updateTicket(ticket.id, { status: e.target.value });
                alert(`Estado cambiado a: ${e.target.value}`);
                DashboardTecnicoView(mainContainer);
            } catch (err) { alert("Error al modificar."); }
        });

        container.appendChild(card);
    });
}

function renderOtrosCasos(tickets, container) {
    if (tickets.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-style: italic;">No hay más incidencias.</p>`;
        return;
    }
    container.innerHTML = '';
    tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.style.background = "#081C13";
        card.style.padding = "12px";
        card.style.marginBottom = "10px";
        card.style.border = "1px solid var(--border-color)";
        card.style.borderRadius = "6px";
        card.innerHTML = `
            <h4 style="margin:0; color:var(--text-light); font-size:14px;">${ticket.title}</h4>
            <p style="margin:4px 0; font-size:12px; color:var(--text-muted);">${ticket.description}</p>
            <div style="font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
                <span>Estado: <strong style="color:var(--warning);">${ticket.status}</strong></span>
                <span>Técnico: <strong>${ticket.assignedTechId ? ticket.assignedTechId : 'Nadie'}</strong></span>
            </div>
        `;
        container.appendChild(card);
    });
}
