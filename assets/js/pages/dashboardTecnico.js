import { ticketService } from '../services/api.js';

export async function DashboardTecnicoView(container) {
    // 1. Obtener los datos del técnico logueado desde el localStorage
    const tecnicoLogueado = JSON.parse(localStorage.getItem('user'));

    // 2. Renderizar la estructura HTML base de la página del técnico
    container.innerHTML = `
        <div class="tech-dashboard">
            <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px;">
                <h2>Panel Técnico - Operador: ${tecnicoLogueado.username}</h2>
                <button id="btn-logout-tech" style="background-color: #dc3545; color: white; border: none; padding: 8px 12px; cursor: pointer; border-radius: 4px;">Cerrar Sesión</button>
            </header>

            <!-- Formulario de Creación de Tickets con Autoasignación -->
            <section class="tech-form-section" style="margin-top: 20px; padding: 15px; border: 1px solid #007bff; background-color: #f0f8ff;">
                <h3>Crear e Iniciar Incidencia (Autoasignada)</h3>
                <form id="tech-ticket-form" style="display: flex; flex-direction: column; gap: 10px; max-width: 500px;">
                    <input type="text" id="tech-title" placeholder="Título de la incidencia interna" required style="padding: 8px;">
                    
                    <select id="tech-type" required style="padding: 8px;">
                        <option value="">Seleccione tipo de caso</option>
                        <option value="incidente">Incidente</option>
                        <option value="requerimiento">Requerimiento</option>
                        <option value="soporte">Soporte</option>
                    </select>
                    
                    <textarea id="tech-description" placeholder="Detalles técnicos del problema encontrado..." required rows="3" style="padding: 8px;"></textarea>
                    
                    <button type="submit" style="background-color: #007bff; color: white; border: none; padding: 10px; cursor: pointer; font-weight: bold;">Registrar y Asignármelo</button>
                </form>
            </section>

            <!-- Listado de incidencias dividido por responsabilidades -->
            <section class="tech-lists-section" style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h3 style="color: #28a745;">Mis Casos Asignados</h3>
                    <div id="my-tickets-container">Cargando tus tareas...</div>
                </div>
                <div>
                    <h3 style="color: #6c757d;">Otros Tickets en el Sistema</h3>
                    <div id="other-tickets-container">Cargando repositorio global...</div>
                </div>
            </section>
        </div>
    `;

    // 3. Capturar elementos del DOM
    const ticketForm = container.querySelector('#tech-ticket-form');
    const myTicketsContainer = container.querySelector('#my-tickets-container');
    const otherTicketsContainer = container.querySelector('#other-tickets-container');
    const btnLogout = container.querySelector('#btn-logout-tech');

    // 4. Cargar y clasificar la información desde json-server
    try {
        const todosLosTickets = await ticketService.getAllTickets();
        
        // Separación lógica de los datos según las reglas del negocio
        const misCasos = todosLosTickets.filter(t => t.assignedTechId === tecnicoLogueado.username);
        const otrosCasos = todosLosTickets.filter(t => t.assignedTechId !== tecnicoLogueado.username);

        renderMisCasos(misCasos, myTicketsContainer, container); // Vista interactiva (permite edición)
        renderOtrosCasos(otrosCasos, otherTicketsContainer);     // Vista de solo lectura
    } catch (error) {
        myTicketsContainer.innerHTML = `<p style="color:red;">Error al conectar con json-server.</p>`;
        otherTicketsContainer.innerHTML = `<p style="color:red;">Error al conectar con json-server.</p>`;
    }

    // 5. Evento POST: Crear ticket autoasignado
    ticketForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoTicketInterno = {
            title: container.querySelector('#tech-title').value.trim(),
            type: container.querySelector('#tech-type').value,
            description: container.querySelector('#tech-description').value.trim(),
            status: "Asignado",                     // Nace directamente en estado Asignado
            assignedTechId: tecnicoLogueado.username, // Se autoasigna al técnico actual
            clientUsername: tecnicoLogueado.username  // Reportado por el mismo técnico
        };

        try {
            await ticketService.createTicket(nuevoTicketInterno);
            alert("Incidencia interna creada y asignada a tu perfil.");
            DashboardTecnicoView(container); // Recarga modular de la página actual
        } catch (error) {
            alert("Fallo al guardar el registro en json-server.");
        }
    });

    // 6. Cierre de sesión
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.hash = '#/login';
    });
}

// 7. Renderizado dinámico de Casos Propios (Permite modificar estado)
function renderMisCasos(tickets, container, mainContainer) {
    if (tickets.length === 0) {
        container.innerHTML = `<p style="color: #777; font-style: italic;">No tienes incidencias asignadas en este momento.</p>`;
        return;
    }
    container.innerHTML = '';

    tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.style.border = "2px solid #28a745";
        card.style.padding = "15px";
        card.style.marginBottom = "12px";
        card.style.borderRadius = "5px";
        card.style.backgroundColor = "#f9fff9";

        card.innerHTML = `
            <h4>${ticket.title} <span style="background-color:#e2e3e5; padding:2px 5px; font-size:11px; border-radius:3px;">${ticket.type}</span></h4>
            <p style="font-size: 14px; margin: 5px 0;">${ticket.description}</p>
            <p style="font-size: 12px; color: #555;">Usuario afectado: <strong>${ticket.clientUsername}</strong></p>
            
            <div style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
                <label style="font-size: 13px; font-weight: bold;">Actualizar Estado:</label>
                <select class="tech-status-select" data-id="${ticket.id}" style="padding: 4px;">
                    <option value="En proceso" ${ticket.status === 'En proceso' ? 'selected' : ''}>En proceso</option>
                    <option value="Asignado" ${ticket.status === 'Asignado' ? 'selected' : ''}>Asignado</option>
                    <option value="Solucionado" ${ticket.status === 'Solucionado' ? 'selected' : ''}>Solucionado</option>
                </select>
            </div>
        `;

        // Evento PATCH: El técnico modifica el estado de sus tickets en tiempo real
        card.querySelector('.tech-status-select').addEventListener('change', async (e) => {
            const ticketId = e.target.dataset.id;
            const nuevoEstado = e.target.value;

            try {
                await ticketService.updateTicket(ticketId, { status: nuevoEstado });
                alert(`Estado cambiado exitosamente a: ${nuevoEstado}`);
                // Volvemos a refrescar la vista para mantener sincronía
                DashboardTecnicoView(mainContainer);
            } catch (error) {
                alert("Error al actualizar la base de datos.");
            }
        });

        container.appendChild(card);
    });
}

// 8. Renderizado de Casos Globales (De Solo Lectura)
function renderOtrosCasos(tickets, container) {
    if (tickets.length === 0) {
        container.innerHTML = `<p style="color: #777; font-style: italic;">No hay otros tickets en el sistema.</p>`;
        return;
    }
    container.innerHTML = '';

    tickets.forEach(ticket => {
        const card = document.createElement('div');
        card.style.border = "1px solid #ccc";
        card.style.padding = "12px";
        card.style.marginBottom = "10px";
        card.style.borderRadius = "4px";
        card.style.backgroundColor = "#fdfdfd";

        card.innerHTML = `
            <h4 style="margin: 0; color: #555;">${ticket.title}</h4>
            <p style="font-size: 13px; margin: 5px 0; color: #666;">${ticket.description}</p>
            <p style="font-size: 12px; margin: 0; color: #888;">
                Estado: <strong>${ticket.status}</strong> | Técnico: <strong>${ticket.assignedTechId ? ticket.assignedTechId : 'Nadie'}</strong>
            </p>
        `;
        container.appendChild(card);
    });
}
