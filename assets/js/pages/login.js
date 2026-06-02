import { authService } from '../services/api.js';

export async function LoginView(container) {
    // 1. Inyectamos la estructura HTML limpia y estilizada
    container.innerHTML = `
        <div class="login-container">
            <h2>Gestión de Tickets - Login</h2>
            <form id="login-form">
                <input type="text" id="username" placeholder="Usuario" required autocomplete="username">
                <input type="password" id="password" placeholder="Contraseña" required autocomplete="current-password">
                <button type="submit">Ingresar</button>
            </form>
            <p id="error-msg" class="error-msg" style="display:none;"></p>
        </div>
    `;

    const form = container.querySelector('#login-form');
    const errorTxt = container.querySelector('#error-msg');

    // 2. Escuchamos el evento de envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ocultamos el mensaje de error en cada intento de login
        errorTxt.style.display = 'none';

        const username = container.querySelector('#username').value.trim();
        const password = container.querySelector('#password').value.trim();

        try {
            // Llamamos al servicio que hace el fetch a json-server
            const usuarios = await authService.login(username, password);

            // Si el arreglo tiene elementos, significa que el usuario y contraseña coinciden
            if (usuarios.length > 0) {
                // ⚠️ CORRECCIÓN CLAVE: Extraemos el primer objeto del arreglo
                const usuarioLogueado = usuarios[0];
                
                // Guardamos los datos de sesión en el almacenamiento local del navegador
                localStorage.setItem('user', JSON.stringify(usuarioLogueado));

                // Redirección por Hash controlada según el rol de la base de datos
                if (usuarioLogueado.role === 'admin') {
                    window.location.hash = '#/admin';
                } else if (usuarioLogueado.role === 'tecnico') {
                    window.location.hash = '#/tecnico';
                } else if (usuarioLogueado.role === 'cliente') {
                    window.location.hash = '#/cliente';
                }
            } else {
                // Si json-server devuelve un arreglo vacío []
                errorTxt.textContent = "Usuario o contraseña inválidos.";
                errorTxt.style.display = 'block';
            }
        } catch (error) {
            // Si el servidor de json-server puerto 3001 está apagado o incomunicado
            errorTxt.textContent = "Error de conexión con el servidor de autenticación.";
            errorTxt.style.display = 'block';
        }
    });
}



