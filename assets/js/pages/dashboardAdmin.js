import { ticketService, authService } from '../services/api.js';

export async function DashboardAdminView(container) {
    const adminData = JSON.parse(localStorage.getItem('user'));
    
    // Variables locales para almacenar los datos cargados de json-server
    let todosLosTickets = [];
    let todosLosTecnicos = [];

    // 1. Inyectar estructura con la nueva paleta y controles de filtrado
    container.innerHTML = `
        <div class="admin-dashboard">
            <header>
                <div>
                    <h2>🛡️ Panel de Control Global</h2>
                    <small style="color: var(--text-muted)">Sesión activa: ${adminData.username} (Administrador)</small>
                </div>
                <button id="btn-logout" style="background-color: #720000; box-shadow: none;">Cerrar Sesión</button>
            </header>

            <!-- FORMULARIO DE CREACIÓN -->
            <section class="form-section" style="background: var(--card-bg); border: 1px solid var(--border-color);">
                <h3>Crear Nueva Incidencia</h3>
                <form id="ticket-form">
                    <input type="text" id="title" placeholder="Título corto del problema" required>
                    <select id="type" required>
                        <option value="incidente">Incidente</option>
                        <option value="requerimiento">Requerimiento</option>
                        <option value="soporte">Soporte</option>
                    </select>
                    <textarea id="description" placeholder="Descripción detallada del caso..." required rows="3"></textarea>
                    <select id="tech-assign">
                        <option value="">Sin asignar (En proceso)</option>
                    </select>
                    <button type="submit">Guardar e Iniciar Ticket</button>
                </form>
            </section>

            <!-- BARRA DE FILTROS EN TIEMPO REAL -->
            <section class="toolbar-filters">
                <div style="flex: 2;">
                    <label style="font-size: 12px; font-weight: bold; color: var(--accent-purple);">BUSCAR TICKET:</label>
                    <input type="text" id="search-input" placeholder="Buscar por título o descripción..." style="margin-bottom:0;">
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 12px; font-weight: bold; color: var(--accent-purple);">FILTRAR POR ESTADO:</label>
                    <select id="status-filter" style="margin-bottom:0;">
                        <option value="todos">Todos los estados</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Asignado">Asignado</option>
                        <option value="Solucionado">Solucionado</option>
                    </select>
                </div>
            </section>

            <!-- LISTADO DINÁMICO -->
            <section class="list-section">
                <h3>Historial del Sistema</h3>
                <div id="tickets-container">Conectando con la base de datos...</div>
            </section>
        </div>
    `;

    const ticketsContainer = container.querySelector('#tickets-container');
    const techSelect = container.querySelector('#tech-assign');
    const ticketForm = container.querySelector('#ticket-form');
    const btnLogout = container.querySelector('#btn-logout');
    
    // Captura de los controles de filtrado
    const searchInput = container.querySelector('#search-input');
    const statusFilter = container.querySelector('#status-filter');

    // 2. Cargar datos iniciales desde json-server
    try {
        [todosLosTickets, todosLosTecnicos] = await Promise.all([
            ticketService.getAllTickets(),
            authService.getTecnicos()
        ]);

        // Llenar el select del formulario de creación
        todosLosTecnicos.forEach(tech => {
            const opt = document.createElement('option');
            opt.value = tech.username;
            opt.textContent = tech.username;
            techSelect.appendChild(opt);
        });

        // Pintar la lista inicial
        aplicarFiltros();

    } catch (err) {
        ticketsContainer.innerHTML = `<p style="color:red;">Error de sincronización con json-server.</p>`;
    }

    // 3. Función interna para procesar las búsquedas en tiempo real
    function aplicarFiltros() {
        const textoBusqueda = searchInput.value.toLowerCase().trim();
        const estadoSeleccionado = statusFilter.value;

        // Filtrar el arreglo en memoria usando reglas lógicas combinadas
        const ticketsFiltrados = todosLosTickets.filter(ticket => {
            const coincideTexto = ticket.title.toLowerCase().includes(textoBusqueda) || 
                                  ticket.description.toLowerCase().includes(textoBusqueda);
            
            const coincideEstado = estadoSeleccionado === 'todos' || ticket.status === estadoSeleccionado;

            return coincideTexto && coincideEstado;
        });

        // Volver a renderizar solo los elementos que pasaron el filtro
        renderTicketsList(ticketsFiltrados, todosLosTecnicos, ticketsContainer, async () => {
            // Callback para refrescar datos tras una actualización sin recargar toda la página
            try {
                todosLosTickets = await ticketService.getAllTickets();
                aplicarFiltros();
            } catch (err) {
                console.error("Error al refrescar tickets", err);
            }
        });
    }

    // 4. Escuchadores de eventos para los filtros (Cambio dinámico)
    searchInput.addEventListener('input', aplicarFiltros);
    statusFilter.addEventListener('change', aplicarFiltros);

    // Evento POST: Guardar ticket
    ticketForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tecnicoAsignado = techSelect.value;

        const nuevoTicket = {
            title: container.querySelector('#title').value.trim(),
            type: container.querySelector('#type').value,
            description: container.querySelector('#description').value.trim(),
            assignedTechId: tecnicoAsignado || null,
            status: tecnicoAsignado ? "Asignado" : "En proceso",
            clientUsername: adminData.username
        };

        try {
            await ticketService.createTicket(nuevoTicket);
            alert("Ticket guardado con éxito.");
            ticketForm.reset(); // Limpia el formulario
            // Recargar datos y renderizar localmente en lugar de reinstanciar la vista completa
            todosLosTickets = await ticketService.getAllTickets();
            aplicarFiltros();
        } catch (err) {
            alert("Error al guardar el ticket.");
        }
    });

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.hash = '#/login';
    });
}

// 5. Renderizado de Tarjetas con la nueva estética oscura y morada
function renderTicketsList(tickets, tecnicos, container, callbackRefrescar) {
    if (tickets.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-style: italic;">No se encontraron tickets que coincidan con la búsqueda.</p>`;
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

        let techOptions = `<option value="">Sin asignar</option>`;
        tecnicos.forEach(t => {
            techOptions += `<option value="${t.username}" ${ticket.assignedTechId === t.username ? 'selected' : ''}>${t.username}</option>`;
        });

        // Reconstrucción y cierre correcto del HTML de la tarjeta
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h4 style="margin:0; font-size:1.2rem; color: white;">${ticket.title}</h4>
                <span style="background:#1F3F2F; color:var(--success); padding:2px 8px; font-size:11px; border-radius:4px; font-weight:bold; text-transform:uppercase;">${ticket.type}</span>
            </div>
            <p style="color: var(--text-light); margin: 10px 0; font-size:14px;">${ticket.description}</p>
            <p style="margin:0 0 15px 0; font-size:12px; color: var(--text-muted);">Estado: <strong style="color: var(--warning);">${ticket.status}</strong></p>
            
            <div style="margin-top: 15px; display: flex; gap: 10px; align-items: center; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">
                <label style="font-size: 12px; color: var(--text-light); white-space: nowrap;">Reasignar Técnico:</label>
                <select class="select-change-tech" style="margin: 0; flex: 1;">
                    ${techOptions}
                </select>
            </div>
        `;

        // Evento para cambiar de técnico/estado directamente desde la tarjeta
        const selectTech = card.querySelector('.select-change-tech');
        selectTech.addEventListener('change', async (e) => {
            const nuevoTecnico = e.target.value;
            const nuevoEstado = nuevoTecnico ? "Asignado" : "En proceso";
            
            const ticketActualizado = {
                ...ticket,
                assignedTechId: nuevoTecnico || null,
                status: ticket.status === "Solucionado" ? "Solucionado" : nuevoEstado
            };

            try {
                await ticketService.updateTicket(ticket.id, ticketActualizado);
                callbackRefrescar(); // Refresca la interfaz con los nuevos datos
            } catch (err) {
                alert("Error al actualizar el técnico del ticket.");
            }
        });
        container.appendChild(card);
    });
}    