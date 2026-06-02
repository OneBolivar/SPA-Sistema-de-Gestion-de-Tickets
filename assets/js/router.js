import { LoginView } from './pages/login.js';
import { RegistroView } from './pages/registro.js'; 
import { DashboardAdminView } from './pages/dashboardAdmin.js';
import { DashboardClienteView } from './pages/dashboardCliente.js';
import { DashboardTecnicoView } from './pages/dashboardTecnico.js';

const routes = {
    '#/login': LoginView,
    '#/registro': RegistroView, 
    '#/admin': DashboardAdminView,
    '#/cliente': DashboardClienteView,
    '#/tecnico': DashboardTecnicoView
};

export async function router() {
    const hash = window.location.hash || '#/login';
    const root = document.getElementById('root');
    
    const sessionData = localStorage.getItem('user');
    const user = sessionData ? JSON.parse(sessionData) : null;

    // ⚠️ REGLA DE EXCEPCIÓN: Si no está logueado, se le permite ver Login Y Registro
    if (hash !== '#/login' && hash !== '#/registro' && !user) {
        window.location.hash = '#/login';
        return;
    }

    // Control estricto de accesos por roles
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

    // Inyección dinámica del módulo de página
    const viewBuilder = routes[hash];
    if (viewBuilder) {
        await viewBuilder(root);
    } else {
        root.innerHTML = `<div style="text-align:center; margin-top:50px;"><h2>404 - Página no encontrada</h2></div>`;
    }
}

function renderAccesoDenegado(container, rolRequerido) {
    container.innerHTML = `
        <div style="max-width: 500px; margin: 60px auto; padding: 25px; background: var(--card-bg); border: 2px dashed var(--accent-purple); text-align: center; border-radius: 8px;">
            <h2 style="color: var(--neon-red); margin-top: 0;">🚫 Acceso Restringido</h2>
            <p>Esta área requiere credenciales de <strong>${rolRequerido}</strong>.</p>
            <button onclick="window.location.hash = '#/login'" style="margin-top:15px;">Regresar al Inicio</button>
        </div>
    `;
}
