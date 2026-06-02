import { authService } from '../services/api.js';

export async function RegistroView(container) {
    // Inyectamos la estructura respetando las clases y variables globales de tu CSS oscuro
    container.innerHTML = `
        <div class="login-container">
            <h2>Crear Cuenta</h2>
            <p style="color: var(--text-muted); font-size: 13px; text-align: center; margin-bottom: 20px;">
                Regístrate para reportar tus incidencias en la plataforma
            </p>
            
            <form id="registro-form">
                <input type="text" id="reg-username" placeholder="Usuario nuevo" required autocomplete="username">
                <input type="password" id="reg-password" placeholder="Contraseña" required autocomplete="new-password">
                <input type="password" id="reg-password-confirm" placeholder="Confirmar contraseña" required autocomplete="new-password">
                
                <button type="submit" style="width: 100%; margin-top: 10px;">Registrarse</button>
            </form>
            
            <p id="reg-error" class="error-msg" style="display: none; margin-top: 15px;"></p>
            <p id="reg-success" style="display: none; color: var(--neon-green); font-weight: bold; text-align: center; margin-top: 15px;">
                ¡Cuenta creada con éxito! Redirigiendo...
            </p>
            
            <div style="text-align: center; margin-top: 20px; font-size: 13px;">
                <span style="color: var(--text-muted)">¿Ya tienes cuenta?</span> 
                <a href="#/login" style="color: var(--purple-neon); font-weight: bold; text-decoration: none; margin-left: 5px;">
                    Inicia sesión
                </a>
            </div>
        </div>
    `;

    const form = container.querySelector('#registro-form');
    const errorTxt = container.querySelector('#reg-error');
    const successTxt = container.querySelector('#reg-success');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorTxt.style.display = 'none';

        const username = container.querySelector('#reg-username').value.trim();
        const password = container.querySelector('#reg-password').value.trim();
        const confirmPassword = container.querySelector('#reg-password-confirm').value.trim();

        // 1. Validar que las contraseñas coincidan antes de procesar
        if (password !== confirmPassword) {
            errorTxt.textContent = "Las contraseñas no coinciden.";
            errorTxt.style.display = 'block';
            return;
        }

        try {
            // 2. Consultar disponibilidad del nombre de usuario en json-server
            const response = await fetch(`http://localhost:3001/users?username=${username}`);
            const usuariosExistentes = await response.json();

            if (usuariosExistentes.length > 0) {
                errorTxt.textContent = "Este nombre de usuario ya está registrado.";
                errorTxt.style.display = 'block';
                return;
            }

            // 🧠 VALIDACIÓN INTELIGENTE: Si escribe solo números se guarda como Number. Si mezcla letras, se guarda como String.
            const passwordFinal = !isNaN(password) && password !== '' ? Number(password) : password;

            // 3. Objeto estructurado para el registro
            const nuevoCliente = {
                username: username,
                password: passwordFinal, 
                role: "cliente"    
            };

            // Ejecuta el POST a través de tu servicio modular centralizado
            await authService.registrarUsuario(nuevoCliente);
            
            successTxt.style.display = 'block';
            form.reset();

            // Retraso de 2 segundos para dar feedback visual antes de mover el Hash
            setTimeout(() => {
                window.location.hash = '#/login';
            }, 2000);

        } catch (error) {
            errorTxt.textContent = "Error de red con la base de datos de usuarios.";
            errorTxt.style.display = 'block';
        }
    });
}
