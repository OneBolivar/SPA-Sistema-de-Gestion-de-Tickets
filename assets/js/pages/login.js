import { authService } from '../services/api.js';

export async function LoginView(container) {
    // 1. Inyectamos la estructura HTML limpia y centrada con el estilo neón
    container.innerHTML = `
        <div class="login-container">
            <h2>Gestión de Tickets - Login</h2>
            <form id="login-form">
                <input type="text" id="username" placeholder="Usuario" required autocomplete="username">
                <input type="password" id="password" placeholder="Contraseña" required autocomplete="current-password">
                <button type="submit">Ingresar</button>
            </form>
            
            <p id="error-msg" class="error-msg" style="display:none;"></p>
            
            <!-- Enlace hacia la vista de creación de cuenta -->
            <div style="text-align: center; margin-top: 20px; font-size: 13px;">
                <span style="color: var(--text-muted)">¿No tienes una cuenta?</span> 
                <a href="#/registro" style="color: var(--purple-neon); font-weight: bold; text-decoration: none; margin-left: 5px;">
                    Regístrate aquí
                </a>
            </div>
        </div>
    `;

    const form = container.querySelector('#login-form');
    const errorTxt = container.querySelector('#error-msg');

    // 2. Escuchamos el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorTxt.style.display = 'none';

        const username = container.querySelector('#username').value.trim();
        const inputPassword = container.querySelector('#password').value.trim();

        // 🧠 VALIDACIÓN INTELIGENTE: Si el campo es solo números, se transforma a tipo numérico. Si contiene letras, sigue como string.
        const passwordFinal = !isNaN(inputPassword) && inputPassword !== '' ? Number(inputPassword) : inputPassword;

        try {
            // Se envía a json-server con el tipo de dato exacto que corresponda
            const usuarios = await authService.login(username, passwordFinal);

            if (usuarios.length > 0) {
                const usuarioLogueado = usuarios[0]; // Extraemos el objeto del usuario limpio
                localStorage.setItem('user', JSON.stringify(usuarioLogueado));

                // Redirección controlada por Hash según el rol asignado
                if (usuarioLogueado.role === 'admin') {
                    window.location.hash = '#/admin';
                } else if (usuarioLogueado.role === 'tecnico') {
                    window.location.hash = '#/tecnico';
                } else if (usuarioLogueado.role === 'cliente') {
                    window.location.hash = '#/cliente';
                }
            } else {
                errorTxt.textContent = "Usuario o contraseña inválidos.";
                errorTxt.style.display = 'block';
            }
        } catch (error) {
            errorTxt.textContent = "Error de conexión con el servidor de autenticación.";
            errorTxt.style.display = 'block';
        }
    });
}
