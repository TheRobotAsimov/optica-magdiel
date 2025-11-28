# Óptica Magdiel

Una aplicación web full-stack para la gestión de una óptica llamada "Óptica Magdiel". Consiste en un frontend de React y un backend de Node.js/Express, con una base de datos MySQL.

## Tecnologías

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React (iconos)
- Chart.js y React-Chartjs-2 (gráficos)
- React DatePicker
- Socket.io-client
- SweetAlert2
- use-debounce
- html2canvas y jsPDF (para reportes PDF)

### Backend
- Node.js
- Express
- MySQL2
- JSON Web Tokens (JWT) para autenticación
- bcryptjs para hashing de contraseñas
- Nodemailer para envío de correos
- Socket.io
- Multer (para uploads)
- Express Rate Limit
- Cookie Parser
- CORS

## Arquitectura

El proyecto está dividido en dos partes principales:

- **`client`:** Contiene el código del frontend de React. Maneja la interfaz de usuario e interactúa con la API del backend.
- **`server`:** Contiene el código del backend de Node.js usando ESModules. Proporciona una API RESTful para el frontend, maneja la lógica de negocio e interactúa con la base de datos MySQL.

## Características

- Gestión de usuarios y empleados
- Administración de clientes y pacientes
- Gestión de ventas y entregas
- Control de rutas y gastos de rutas
- Sistema de pagos
- Catálogo de precios
- Reportes administrativos (balance, desempeño de asesores, pagos de clientes, rutas)
- Autenticación con JWT
- Notificaciones en tiempo real con Socket.io
- Generación de reportes en PDF

## Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- MySQL
- pnpm (recomendado) o npm

### Backend

1. Navega al directorio `server`:
   ```bash
   cd server
   ```

2. Instala las dependencias:
   ```bash
   pnpm install
   ```

3. Crea un archivo `.env` en el directorio `server` con las siguientes variables:
   ```
   DB_HOST=tu_host_de_base_de_datos
   DB_USER=tu_usuario_de_base_de_datos
   DB_PASS=tu_contraseña_de_base_de_datos
   DB_NAME=tu_nombre_de_base_de_datos
   JWT_SECRET=tu_secreto_jwt
   JWT_EXPIRE=tu_expiración_jwt
   CLIENT_URL=tu_url_del_cliente
   ```

4. Configura la base de datos MySQL ejecutando el script en `server/src/config/script.sql`.

### Frontend

1. Navega al directorio `client`:
   ```bash
   cd client
   ```

2. Instala las dependencias:
   ```bash
   pnpm install
   ```

## Ejecución

### Backend
Para ejecutar el backend:
- **Modo producción:** `pnpm start`
- **Modo desarrollo (con auto-restart):** `pnpm run dev`

### Frontend
Para ejecutar el frontend:
- **Modo desarrollo:** `pnpm run dev`
- **Construir para producción:** `pnpm run build`
- **Vista previa de producción:** `pnpm run preview`
- **Linting:** `pnpm run lint`

## Uso

1. Inicia el backend en un terminal.
2. Inicia el frontend en otro terminal.
3. Accede a la aplicación en `http://localhost:5173` (puerto por defecto de Vite).

La información del usuario logueado se puede acceder desde `useAuth → { user }` en `client/src/context/AuthContext.jsx`.

El objeto user contiene información de usuario y empleado:
```javascript
{
  id,
  correo,
  rol, // 'Matriz' (admin), 'Asesor', 'Optometrista'
  idempleado,
  nombre,
  paterno,
  materno,
  puesto,
  estado
}
```

## Desarrollo

- **Estilo de código:** El backend sigue el estilo ESModule de JavaScript. El frontend usa ESLint para linting.
- **Autenticación:** La aplicación usa JWT para autenticación. El backend proporciona endpoints para registro, login, reset de contraseña y gestión de perfil.
- **Enrutamiento:** El frontend usa React Router para enrutamiento del lado cliente. El backend usa Express Router para definir rutas de API.
- **Base de datos:** El backend usa `mysql2` para interactuar con MySQL. El esquema de la base de datos no está definido en el código y debe crearse por separado.
- **Idioma:** Usa español para todo el texto orientado al usuario en el frontend.

## Contribución

1. Fork el proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`).
4. Push a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia ISC.