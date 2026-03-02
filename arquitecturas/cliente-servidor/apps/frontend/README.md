# Frontend React App

Proyecto React con TypeScript basado en Vite.

## Estructura de Carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── atoms/          # Componentes atómicos (pequeños)
│   ├── layouts/        # Layouts de la aplicación
│   └── router/         # Componentes relacionados al router
├── config/             # Configuraciones de la aplicación
├── context/            # Context API de React
├── data/               # Datos estáticos y utilidades
├── hooks/              # Custom hooks
├── interface/          # Interfaces TypeScript
├── modulos/            # Módulos de la aplicación
│   └── pages/         # Páginas de cada módulo
├── services/           # Servicios API
├── styles/             # Estilos y temas
├── test/               # Tests organizados por tipo
│   ├── AtomsTest/
│   ├── ConfigTest/
│   ├── DataTest/
│   ├── HooksTest/
│   ├── LayoutsTest/
│   ├── ModulosTest/
│   ├── ServicesTest/
│   └── ThemeTest/
└── utils/              # Funciones utilitarias
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run build-dev` - Construye para desarrollo
- `npm run build-test` - Construye para testing
- `npm run lint` - Ejecuta el linter
- `npm run format` - Formatea el código
- `npm run format-check` - Verifica el formato del código
- `npm run test` - Ejecuta los tests con cobertura
- `npm run test:watch` - Ejecuta los tests en modo watch
- `npm run preview` - Previsualiza la build de producción

## Tecnologías

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Material-UI** - Componentes UI
- **React Router** - Navegación
- **Zustand** - Gestión de estado
- **Axios** - Cliente HTTP
- **Jest** - Testing
- **Testing Library** - Testing de componentes
- **ESLint** - Linter
- **Prettier** - Formateador de código

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`
