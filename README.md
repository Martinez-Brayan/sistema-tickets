# 🎫 Sistema HelpDesk

Sistema de gestión de tickets de soporte técnico para empresas.

---

## ✅ Funcionalidades Implementadas

### Autenticación
- [x] Login con roles (Administrador, Agente, Cliente)
- [x] Contexto de autenticación
- [x] Rutas protegidas por rol

### Administrador
- [x] Dashboard con estadísticas
- [x] Gestión de tickets (crear, editar, eliminar)
- [x] Gestión de usuarios (crear, editar, eliminar)
- [x] Gestión de empresas (crear, editar, eliminar)
- [x] Calendario de agentes (eventos, reuniones, salidas a campo)
- [x] Reportes en formato documento
- [x] Configuración del sistema (general, prioridades, roles, notificaciones)

### Agente
- [x] Dashboard personal
- [x] Ver tickets asignados
- [x] Chat con clientes
- [x] Mi calendario
- [x] Registro de tiempo (Check-IN/OUT manual)

### Cliente
- [x] Crear nueva solicitud
- [x] Ver mis tickets
- [x] Chat con agente asignado

### Interfaz
- [x] Menú lateral por rol
- [x] Diseño responsive
- [x] Modales para formularios

---

##  Funcionalidades Pendientes

### Conexión a Base de Datos
- [ ] Conectar Supabase
- [ ] Autenticación real con Supabase Auth
- [ ] CRUD de tickets en base de datos
- [ ] CRUD de usuarios en base de datos
- [ ] CRUD de empresas en base de datos

### Notificaciones
- [ ] Notificaciones en la plataforma (campana)
- [ ] Notificaciones por email al asignar ticket

### Módulos Administrativos
- [ ] Contratos (gestión de contratos con clientes)
- [ ] Facturación (facturas, pagos pendientes)
- [ ] Servicios/Planes (paquetes de soporte)
- [ ] Inventario (equipos, licencias, activos)
- [ ] Viáticos (solicitud, aprobación, registro de gastos)
---

## 🛠 Tecnologías

- React 18
- React Router DOM
- React Icons
- Supabase (pendiente de conexión)

---

## 📦 Instalación
```bash
# Clonar repositorio
git clone [url-del-repositorio]
cd sistema-tickets

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm start
```

---

## 🚀 Deploy en Vercel

### Opción 1: Deploy desde CLI
```bash
# Instalar Vercel CLI
npm install -g vercel

# Iniciar sesión
vercel login

# Deploy (desde la carpeta del proyecto)
vercel

# Deploy a producción
vercel --prod
```

### Opción 2: Deploy desde GitHub
1. Sube el proyecto a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com) e inicia sesión
3. Click en "Add New" → "Project"
4. Importa tu repositorio de GitHub
5. Vercel detectará automáticamente que es un proyecto React (Create React App)
6. Click en "Deploy"

### Variables de Entorno en Vercel
Si tu proyecto usa variables de entorno, configúralas en:
- Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

Ejemplo de variables:
- `REACT_APP_API_URL` - URL de tu API backend
- `REACT_APP_SOCKET_URL` - URL del servidor de WebSockets

---

## 👥 Roles del Sistema

| Rol | Acceso |
|-----|--------|
| **Administrador** | Gestión completa del sistema |
| **Agente** | Tickets asignados, chat, calendario, tiempo |
| **Cliente** | Crear tickets, ver estado, chat |

---

## 📁 Estructura del Proyecto
```
src/
├── componentes/
│   ├── autenticacion/
│   ├── calendario/
│   ├── chat/
│   ├── comunes/
│   ├── configuracion/
│   ├── reportes/
│   ├── tickets/
│   ├── tiempo/
│   └── usuarios/
├── contextos/
├── paginas/
├── servicios/
└── App.js
```