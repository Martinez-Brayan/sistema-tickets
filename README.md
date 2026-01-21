# 🎫 Sistema HelpDesk

Sistema de gestión de tickets de soporte técnico para la empresa.

## Características

- **Multi-rol:** Administrador, Agente y Cliente
- **Gestión de tickets:** Crear, asignar, dar seguimiento
- **Chat en tiempo real:** Comunicación agente-cliente
- **Calendario:** Gestión de reuniones y salidas a campo
- **Registro de tiempo:** Control de horas trabajadas por ticket.
- **Reportes:** Informes de gestión en formato documento
- **Gestión de usuarios y empresas**

## Tecnologías
- React 18
- Supabase (Base de datos y autenticación)
- React Icons

## Instalación

```bash
# Clonar repositorio
git clone [url-del-repositorio]
cd sistema-tickets

# Instalar dependencias
npm install

# Configurar Supabase en src/servicios/supabase.js

# Iniciar
npm start

#produccion
npm build
```

## Roles definidos con sus acciones


| Rol | Acceso |
|-----|--------|
| **Administrador** | Gestión completa del sistema |

| **Agente** | Tickets asignados, chat, calendario, registro de tiempo |

| **Cliente** | Crear tickets, ver estado, chat con soporte |

# Por Definir 
**Falta el area administativa agregarse**
equivale a contratos y las horas de los contratos 
viaticos y otros porcesos admnistrativos aun no definidos.