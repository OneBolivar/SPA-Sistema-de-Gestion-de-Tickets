import { router } from './router.js';

// Variable global para almacenar la referencia del temporizador
let temporizadorInactividad;

/**
 * Función encargada de reiniciar el reloj de inactividad.
 * Cada vez que el usuario interactúe, el contador vuelve a empezar desde cero.
 */
function reiniciarContadorInactividad() {
    // Cancelamos el temporizador anterior para que no se duplique
    clearTimeout(temporizadorInactividad);
    
    // Verificamos si realmente hay una sesión activa antes de iniciar el reloj
    if (localStorage.getItem('user')) {
        // 5 minutos = 300,000 milisegundos
        temporizadorInactividad = setTimeout(() => {
            alert("Su sesión ha expirado por inactividad de 5 minutos.");
            localStorage.removeItem('user'); // Borramos los datos de sesión
            window.location.hash = '#/login'; // Redirección automática al Login
        }, 300000);
    }
}

/**
 * Función principal que arranca todo el ecosistema de la SPA
 */
function arrancarAplicación() {
    // 1. Escuchar cuando la URL cambia de Hash (ej: de #/login a #/admin)
    window.addEventListener('hashchange', router);

    // 2. Escuchar cuando el documento HTML termina de cargar por primera vez
    window.addEventListener('DOMContentLoaded', router);

    // 3. Capturar movimientos del mouse o pulsaciones de teclas para el control de inactividad
    window.addEventListener('mousemove', reiniciarContadorInactividad);
    window.addEventListener('keypress', reiniciarContadorInactividad);

    // Arrancamos el primer ciclo del temporizador
    reiniciarContadorInactividad();
}

// Ejecutamos el arranque del sistema
arrancarAplicación();
