# Sistema de Gestión de Tickets (Help Desk)

Sistema integral para la administración de incidencias y solicitudes de soporte, diseñado con una arquitectura basada en roles para optimizar el flujo de trabajo entre administradores, agentes y clientes.

## 🚀 Características Principales

### 👥 Gestión de Roles y Permisos
El sistema tiene tres niveles de acceso diferenciados:
*   **Administrador**: Control total del sistema, gestión de usuarios y supervisión global.
*   **Agente de Soporte**: Gestión y resolución de tickets asignados, acceso al dashboard de productividad.
*   **Cliente**: Creación de nuevos tickets, seguimiento de estado y comunicación con agentes.

### 🎫 Sistema de Tickets Avanzado
Configuración  para incidencias correctamente:
*   **Tipos**: Incidente y Solicitud.
*   **Prioridades**: Alta, Media, Baja.
*   **Estados del Ciclo de Vida**:
    *   Abierto / En Proceso / Resuelto
    *   En Espera de Usuario / Respondido Usuario
    *   Proyectos (En Proceso/Culminado)
    *   Escalamiento a Fábrica
*   **Categorización**: Jerarquía completa de Categoría -> Subcategoría (ej. Hardware -> Impresora, Red -> VPN).

### 💬 Comunicación en Tiempo Real
*   Chat integrado para comunicación directa entre Agentes y Clientes.
*   Implementado con **Socket.io** para mensajería instantánea sin recargas.

---

## 🔐 Credenciales de Acceso (Entorno de Pruebas)

El sistema cuenta con usuarios pre-configurados para facilitar el testing:

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@helpdesk.com` | `admin123` |
| **Agente** | `agente@helpdesk.com` | `agente123` |
| **Cliente** | `cliente@helpdesk.com` | `cliente123` |

---

## 🛠️ Stack Tecnológico

*   **Core**: React 19
*   **Navegación**: React Router DOM v7
*   **Comunicación**: Axios (HTTP), Socket.io Client (WebSockets)
*   **Estilos**: CSS Modules y CSS puro para componentes aislados.
*   **Estado Global**: Context API (ContextoAutenticacion).

---

## 📂 Estructura del Proyecto

```text
src/
├── componentes/
│   ├── autenticacion/  # Login y protección de rutas
│   ├── chat/           # Interfaz de chat real-time
│   ├── comunes/        # Layouts específicos por rol (Admin/Agente/Cliente)
│   ├── tickets/        # Formularios y Listados de tickets
│   └── usuarios/       # Gestión de usuarios
├── contextos/          # Lógica de estado global (Auth)
├── paginas/            # Vistas principales (Dashboard, Tickets, Chat)
└── servicios/          # Conexión con APIs externas
```

---

## ⚡ Instalación y Despliegue

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Iniciar servidor de desarrollo:**
    ```bash
    npm start
    ```
    Accede a [http://localhost:3000](http://localhost:3000) en tu navegador.

3.  **Compilar para producción:**
    ```bash
    npm run build
    ```
