# SalUD - Cliente-Servidor (Frontend)

Sistema de Agendamiento de Citas Médicas entre Pacientes y Médicos.

## 🏥 Descripción

Aplicación web frontend para la gestión y agendamiento de citas médicas, permitiendo la interacción entre pacientes y médicos de manera eficiente.

## 🚀 Estructura de Carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── atoms/          # Componentes atómicos (pequeños)
│   ├── layouts/        # Layouts de la aplicación
│   └── router/         # Componentes relacionados al router
├── config/             # Configuraciones de la aplicación
├── context/            # Context API de React
│   └── AuthContext.tsx # Contexto de autenticación
├── data/               # Datos estáticos y utilidades
├── hooks/              # Custom hooks
├── interface/          # Interfaces TypeScript
├── modulos/            # Módulos de la aplicación
│   └── pages/         # Páginas de cada módulo
│       ├── LoginPage.tsx
│       └── HomePage.tsx
├── services/           # Servicios API
├── styles/             # Estilos y temas
│   └── theme.ts       # Tema personalizado de Material-UI
├── test/               # Tests organizados por tipo
└── utils/              # Funciones utilitarias
```

## 📋 Rutas Implementadas

- `/login` - Página de inicio de sesión
- `/home` - Página principal (protegida)
- `/` - Redirección a login

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **Material-UI v6** (componentes, iconos)
- **React Router v7** para navegación
- **Zustand** para gestión de estado
- **Axios** para llamadas HTTP
- **Jest + Testing Library** para testing
- **Vite** como build tool
- **ESLint + Prettier** para calidad de código

## 📦 Instalación

```bash
npm install
```

## 🚀 Scripts Disponibles

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo en `http://localhost:8080`

### Build
```bash
npm run build          # Producción
npm run build-dev      # Desarrollo
npm run build-test     # Testing
```

### Calidad de Código
```bash
npm run lint           # Ejecuta el linter
npm run format         # Formatea el código
npm run format-check   # Verifica el formato
```

### Testing
```bash
npm run test           # Tests con cobertura
npm run test:watch     # Tests en modo watch
npm run test:coverage  # Reporte de cobertura
```

### Preview
```bash
npm run preview
```
Previsualiza la build de producción

## 🔐 Autenticación

La aplicación cuenta con un sistema básico de autenticación mediante Context API:

- **AuthContext**: Proporciona el estado de autenticación
- **useAuth**: Hook para acceder al contexto de autenticación
- **ProtectedRoute**: Componente para proteger rutas privadas

## 🎨 Diseño

La aplicación utiliza Material-UI con un tema personalizado que incluye:
- Paleta de colores primaria y secundaria
- Tipografía optimizada (Inter)
- Componentes con estilos personalizados
- Diseño responsive

## 📱 Funcionalidades

### Página de Login
- Formulario de autenticación
- Título: "SalUD - Cliente-Servidor (Frontend)"
- Subtítulo: "Sistema de Agendamiento de Citas Médicas"

### Página Home
- Dashboard principal con 3 secciones:
  - **Agendar Cita**: Programa nuevas citas médicas
  - **Médicos**: Directorio de médicos disponibles
  - **Mis Citas**: Historial y citas programadas
- Header con nombre de la aplicación y botón de cerrar sesión

## 🔌 Servicios API

La aplicación cuenta con servicios completos para conectar con el backend:

### Servicios Implementados

- **patientsService**: CRUD de pacientes
- **doctorsService**: CRUD de doctores
- **timeSlotsService**: Gestión de horarios disponibles
- **appointmentsService**: Gestión completa de citas médicas
- **appointmentDetailsService**: Detalles clínicos de las citas

### Configuración

1. Crea un archivo `.env` en la raíz del proyecto:
```bash
VITE_API_URL=http://localhost:5000/api
```

2. Asegúrate de que el backend esté corriendo en el puerto 5000

### Documentación

- **[SERVICIOS_API.md](./SERVICIOS_API.md)**: Documentación completa de todos los servicios
- **[MIGRACION_API.md](./MIGRACION_API.md)**: Guía de migración de mock a API real

### Ejemplo de Uso

```typescript
import { appointmentsService, timeSlotsService } from '@/services';

// Obtener horarios disponibles
const slots = await timeSlotsService.getAvailable();

// Crear una cita
const cita = await appointmentsService.create({
  tipoCita: "MEDICINA_GENERAL",
  estado: "programada",
  idPaciente: 1,
  idDoctor: 3,
  idHorario: 19,
  creadoPor: 1,
  actualizadoPor: 1
});
```

## 🔄 Próximas Implementaciones

- [x] Integración con backend - Servicios API completos
- [ ] Migrar componentes de mock a API real
- [ ] Implementar autenticación real con JWT
- [ ] Dashboard de estadísticas
- [ ] Sistema de notificaciones
- [ ] Mejoras en el historial médico

## 🐳 Docker

El proyecto incluye archivos Docker para despliegue:
- `Dockerfile`: Configuración para construcción de la imagen
- `.dockerignore`: Archivos excluidos del contexto Docker

## 📝 Notas

- El sistema de autenticación actual es básico y debe ser integrado con un backend real
- Las rutas están protegidas mediante el componente `ProtectedRoute`
- El tema puede ser personalizado en `src/styles/theme.ts`

## 🤝 Contribución

Este es un proyecto académico para la materia Cliente-Servidor en la Universidad Distrital.
