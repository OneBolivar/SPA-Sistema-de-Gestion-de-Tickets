// Importamos los constructores modulares de cada página
import { LoginView } from './pages/login.js';
import { DashboardAdminView } from './pages/dashboardAdmin.js';
import { DashboardClienteView } from './pages/dashboardCliente.js';
import { DashboardTecnicoView } from './pages/dashboardTecnico.js';

// Mapa formal de rutas soportadas por la SPA
const routes = {
    '#/login': LoginView,
    '#/admin': DashboardAdminView,
    '#/cliente': DashboardClienteView,
    '#/tecnico': DashboardTecnicoView
};

export async function router() {
    // Si la URL no tiene Hash (ej: http://localhost:5173), enviamos por defecto a #/login
    const hash = window.location.hash || '#/login';
    const root = document.getElementById('root');
    
    // Recuperamos los datos de la sesión del navegador
    const sessionData = localStorage.getItem('user');
    const user = sessionData ? JSON.parse(sessionData) : null;

    // --- REGLA 1: PROTECCIÓN CONTRA INGRESO NO AUTENTICADO ---
    // Si el usuario no está logueado e intenta forzar cualquier ruta que no sea login, lo redirigimos
    if (hash !== '#/login' && !user) {
        window.location.hash = '#/login';
        return;
    }

    // --- REGLA 2: CONTROL DE ACCESOS POR ROLES (SEGURIDAD DE RUTAS) ---
    if (hash === '#/admin' && user?.role !== 'admin') {
        renderAccesoDenegado(root, "Administrador");
        return;
    }

    if (hash === '#/tecnico' && user?.role !== 'tecnico') {
        renderAccesoDenegado(root, "Técnico");
        return;
    }

    if (hash === '#/cliente' && user?.role !== 'cliente') {
        renderAccesoDenegado(root, "Cliente");
        return;
    }

    // --- REGLA 3: RENDERIZADO DINÁMICO ---
    const viewBuilder = routes[hash];
    
    if (viewBuilder) {
        // Ejecutamos la función de la vista pasándole el contenedor principal <main id="root">
        await viewBuilder(root);
    } else {
        // En caso de ingresar un hash inexistente (Error 404)
        root.innerHTML = `
            <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
                <h2 style="color: #dc3545;">Error 404</h2>
                <p>La sección solicitada no existe en el sistema de tickets.</p>
                <a href="#/login" style="color: #007bff;">Volver al inicio</a>
            </div>
        `;
    }
}

// Función auxiliar interna para pintar un mensaje estético de denegación de permisos
function renderAccesoDenegado(container, rolRequerido) {
    container.innerHTML = `
        <div style="max-width: 500px; margin: 60px auto; padding: 20px; border: 2px dashed #ff4d4d; background-color: #fff5fff5; text-align: center; font-family: sans-serif; border-radius: 6px;">
            <h2 style="color: #d9534f; margin-top: 0;">🚫 Acceso Denegado</h2>
            <p style="color: #333;">Lo sentimos, esta sección es de uso exclusivo para perfiles con rol de <strong>${rolRequerido}</strong>.</p>
            <p style="font-size: 14px; color: #666;">Tu sesión actual no cuenta con los privilegios necesarios.</p>
            <button onclick="window.location.hash = '#/login'" style="background-color: #5bc0de; color: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 4px; font-weight: bold;">Regresar</button>
        </div>
    `;
}
