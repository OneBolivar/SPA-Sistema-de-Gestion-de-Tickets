// URLs base hacia tus dos instancias locales de json-server
const AUTH_URL = 'http://localhost:3001/users';
const DATA_URL = 'http://localhost:3002/tickets';

// ==========================================================================
// 🛡️ MÓDULO DE AUTENTICACIÓN Y USUARIOS (Puerto 3001)
// ==========================================================================
export const authService = {
    /**
     * [R]EAD - Busca un usuario que coincida exactamente con las credenciales.
     * Envía las variables como cadenas de texto en la URL.
     */
    async login(username, password) {
        const response = await fetch(`${AUTH_URL}?username=${username}&password=${password}`);
        if (!response.ok) throw new Error('Error en el servidor de autenticación');
        return await response.json(); // Devuelve un arreglo [] con el usuario si coincide
    },

    /**
     * [R]EAD - Obtiene la lista de todos los usuarios registrados con rol técnico.
     */
    async getTecnicos() {
        const response = await fetch(`${AUTH_URL}?role=tecnico`);
        if (!response.ok) throw new Error('Error al obtener técnicos');
        return await response.json();
    },
    
    /**
     * [C]REATE - Registra un nuevo usuario en la base de datos de autenticación.
     * Guarda la contraseña de forma nativa como texto.
     */
    async registrarUsuario(nuevoUsuario) {
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoUsuario) // Convierte el objeto JS a texto JSON
        });
        if (!response.ok) throw new Error('Error al registrar el usuario');
        return await response.json();
    }
};

// ==========================================================================
// 🎫 MÓDULO DE GESTIÓN DE TICKETS (Puerto 3002)
// ==========================================================================
export const ticketService = {
    /**
     * [R]EAD - Obtiene el listado global de todas las incidencias.
     */
    async getAllTickets() {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('Error al obtener los tickets');
        return await response.json();
    },

    /**
     * [C]REATE - Inserta una nueva incidencia o requerimiento.
     */
    async createTicket(ticket) {
        const response = await fetch(DATA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticket)
        });
        if (!response.ok) throw new Error('Error al crear el ticket');
        return await response.json();
    },

    /**
     * [U]PDATE - Modifica parcialmente un ticket existente (Estado o Técnico asignado)
     * utilizando el método PATCH sin destruir el resto de las propiedades.
     */
    async updateTicket(id, datosActualizados) {
        const response = await fetch(`${DATA_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        if (!response.ok) throw new Error('Error al actualizar el ticket');
        return await response.json();
    },

    /**
     * [D]ELETE - Remueve de forma permanente una incidencia por su ID único.
     */
    async deleteTicket(id) {
        const response = await fetch(`${DATA_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar el ticket');
        return await response.json();
    }
};
