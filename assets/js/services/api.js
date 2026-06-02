const AUTH_URL ='http://localhost:3001/users';
const DATA_URL ='http://localhost:3002/tickets';

// Módulo de Autenticación y Usuarios (Puerto 3001)
export const authService = {
    async login(username, password) {
        const response = await fetch(`${AUTH_URL}?username=${username}&password=${password}`);
        console.log(`${AUTH_URL}?username=${username}&password=${password}`)
        if (!response.ok) throw new Error('Error en el servidor de autenticación');
        return await response.json(); 
    },
    async getTecnicos() {
        const response = await fetch(`${AUTH_URL}?role=tecnico`);
        if (!response.ok) throw new Error('Error al obtener técnicos');
        return await response.json();
    }
};

// Módulo de Tickets de Incidencias (Puerto 3002)
export const ticketService = {
    async getAllTickets() {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('Error al obtener los tickets');
        return await response.json();
    },
    async createTicket(ticket) {
        const response = await fetch(DATA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticket)
        });
        if (!response.ok) throw new Error('Error al crear el ticket');
        return await response.json();
    },
    async updateTicket(id, datosActualizados) {
        const response = await fetch(`${DATA_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        if (!response.ok) throw new Error('Error al actualizar el ticket');
        return await response.json();
    },
    async deleteTicket(id) {
        const response = await fetch(`${DATA_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar el ticket');
        return await response.json();
    }
};
