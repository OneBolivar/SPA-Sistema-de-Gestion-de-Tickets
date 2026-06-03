
#  SPA - Sistema de Gestión de Tickets

¡Bienvenido al **Sistema de Gestión de Tickets**! Esta es una aplicación web moderna de tipo **SPA (Single Page Application)** diseñada para optimizar, centralizar y resolver el flujo de incidencias, solicitudes y soporte técnico en entornos dinámicos. Construida con tecnologías nativas del navegador para garantizar una velocidad de carga óptima y un consumo mínimo de recursos.

---

##  Características Principales

*   **Autenticación Local Segura:** Módulo de inicio de sesión basado en persistencia simulada de usuarios.
*   **Panel de Control Dinámico:** Visualización inmediata del estado general de los tickets de soporte.
*   **Operaciones CRUD Completas:** Creación, lectura, actualización y eliminación de tickets en tiempo real.
*   **Arquitectura SPA:** Navegación fluida e instantánea entre secciones sin recargar la página del navegador.
*   **Almacenamiento Descentralizado:** Base de datos modular simulada mediante archivos estructurados en formato JSON.

---

##  Tecnologías Utilizadas

El núcleo del proyecto aprovecha las capacidades estándar de la web moderna para evitar sobrecargar la aplicación con dependencias innecesarias:

*   **HTML5:** Estructuración semántica de las vistas de la aplicación.
*   **CSS3:** Estilos personalizados, diseño adaptivo y transiciones interactivas.
*   **JavaScript (ES6+):** Enrutamiento del lado del cliente, manipulación del DOM y lógica de negocio.
*   **JSON Server / Mock Data:** Gestión local de persistencia para usuarios y tickets de soporte.

---

##  Estructura del Proyecto

La organización limpia de los archivos permite identificar inmediatamente las capas de la aplicación:

```text
├── assets/               # Recursos estáticos (Imágenes, iconos, estilos globales)
├── auth-db.json          # Base de datos simulada para credenciales de usuarios
├── data-db.json          # Almacenamiento estructurado de los tickets de soporte
├── index.html            # Punto de entrada único de la SPA
├── package.json          # Configuración del entorno de desarrollo y dependencias
├── package-lock.json     # Registro detallado del árbol de dependencias
└── README.md             # Documentación del sistema
```

---

##  Guía de Instalación y Ejecución

Sigue estos sencillos pasos para poner en marcha el entorno de desarrollo local en tu computadora:

### Pre-requisitos

Asegúrate de tener instalados los siguientes componentes en tu sistema:
*   [Node.js](https://nodejs.org) (Versión 16.x o superior recomendada)
*   Un gestor de paquetes como **npm** (instalado automáticamente junto con Node.js)

### Paso 1: Clonar el Repositorio

Abre la terminal de tu sistema operativo y descarga el código fuente utilizando Git:

```bash
git clone https://github.com/OneBolivar/SPA-Sistema-de-Gestion-de-Tickets.git
```

Entra al directorio raíz del proyecto recién descargado:

```bash
cd SPA-Sistema-de-Gestion-de-Tickets
```

### Paso 2: Instalar Dependencias

Instala los módulos de desarrollo necesarios configurados en el archivo `package.json`:

```bash
npm install
```

### Paso 3: Iniciar el Servidor de Datos (Mock API)

Para que el login y el flujo de tickets funcionen de forma persistente, la aplicación se conecta a las bases de datos simuladas. Inicializa el servidor local de desarrollo ejecutando:

```bash
npm run start
```
> *Nota: Dependiendo de cómo esté configurado el script interno del proyecto en tu `package.json`, este comando levantará un servidor local (usualmente mediante `json-server` o `live-server`) mapeando los puertos para `auth-db.json` y `data-db.json`.*

### Paso 4: Acceder a la Aplicación

Una vez que la consola indique que el entorno está corriendo con éxito, abre tu navegador web preferido e ingresa a la siguiente dirección:

```text
http://localhost:3000
```
*(Si usas extensiones como Live Server en tu editor de código, también puedes abrir directamente el archivo `index.html` tras encender tu Mock API local).*

---

##  Datos de Acceso de Prueba

Para testear las funcionalidades de administración y creación de tickets de inmediato, puedes validar el inicio de sesión revisando los usuarios registrados dentro del archivo `auth-db.json`. 


---

## 📄 Licencia

Este proyecto está bajo la distribución de Software Libre. Siéntete libre de clonarlo, modificarlo y usarlo para fines educativos o profesionales.

## PARA EJECUTARLO DESDE CONSOLA
Debemos abrir 2 terminales.
La primera para tickets: json-server --watch auth-db.json --port 3001
La segunda para usuarios: json-server --watch data-db.json --port 3002

