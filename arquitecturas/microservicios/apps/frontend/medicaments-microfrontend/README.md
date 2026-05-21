# Microfrontend de Medicamentos - Arquitectura Module Federation

Este proyecto implementa un microfrontend para la gestión de medicamentos utilizando **Module Federation** de Vite.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Host Application                         │
│                  (Frontend Principal)                       │
│                     Puerto: 8080                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │        Module Federation Consumer                    │  │
│  │                                                       │  │
│  │  - Carga dinámica de microfrontends                 │  │
│  │  - Gestión de dependencias compartidas              │  │
│  │  - Routing principal                                 │  │
│  │                                                       │  │
│  └─────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│                    Remote Entry                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTP (localhost:8081)
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              Medicaments Microfrontend                      │
│                    Puerto: 8081                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │    Exposed Module: MedicamentsModule                │  │
│  │                                                       │  │
│  │  - Lista de medicamentos                            │  │
│  │  - Búsqueda y filtrado                              │  │
│  │  - CRUD completo                                     │  │
│  │  - Comunicación con Backend API                     │  │
│  │                                                       │  │
│  └─────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│                    API Client                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTP API
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              Backend Medicaments Service                    │
│                    Puerto: 8000                             │
│                                                             │
│  - API REST de medicamentos                                │
│  - Base de datos                                            │
│  - Lógica de negocio                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Estructura del Proyecto

```
apps/
├── frontend/                          # Host Application
│   ├── vite.config.ts                # Config con Module Federation Consumer
│   └── src/
│       ├── components/
│       │   └── MedicamentsRemoteWrapper.tsx  # Wrapper para cargar el remote
│       ├── routes.tsx                # Rutas con /medicamentos/*
│       └── medicaments-remote.d.ts   # Type definitions para el remote
│
└── medicaments-microfrontend/        # Remote Application
    ├── vite.config.ts                # Config con Module Federation Provider
    ├── package.json
    └── src/
        ├── MedicamentsModule.tsx     # Módulo expuesto
        ├── components/
        │   └── MedicamentsList.tsx   # UI principal
        ├── services/
        │   └── medicamentsService.ts # Comunicación con backend
        └── types/
            └── medicament.types.ts   # TypeScript types
```

## 🚀 Cómo Ejecutar

### 1. Iniciar el Backend de Medicamentos

```bash
cd backend/medicaments-service
# Activar entorno virtual y ejecutar
python main.py
# O con Docker
docker-compose up medicaments-service
```

El backend debería estar corriendo en `http://localhost:8000`

### 2. Iniciar el Microfrontend de Medicamentos (Remote)

```bash
cd medicaments-microfrontend

# Copiar variables de entorno
cp .env.example .env

# Instalar dependencias (si no lo has hecho)
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El microfrontend estará disponible en `http://localhost:8081`

### 3. Iniciar la Aplicación Principal (Host)

```bash
cd frontend

# Instalar dependencias (si no lo has hecho)
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación principal estará disponible en `http://localhost:8080`

### 4. Acceder al Módulo de Medicamentos

Una vez que ambas aplicaciones estén corriendo:

1. Abre tu navegador en `http://localhost:8080`
2. Inicia sesión
3. Navega a `http://localhost:8080/medicamentos`

## 🔧 Configuración

### Variables de Entorno

**medicaments-microfrontend/.env**
```env
VITE_MEDICAMENTS_API_URL=http://localhost:8000
```

### Configuración de Module Federation

**Host (frontend/vite.config.ts)**
```typescript
federation({
  name: 'host_app',
  remotes: {
    medicamentsApp: 'http://localhost:8081/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom', 'react-router-dom', '@mui/material', ...]
})
```

**Remote (medicaments-microfrontend/vite.config.ts)**
```typescript
federation({
  name: 'medicaments_app',
  filename: 'remoteEntry.js',
  exposes: {
    './MedicamentsModule': './src/MedicamentsModule.tsx',
  },
  shared: ['react', 'react-dom', 'react-router-dom', '@mui/material', ...]
})
```

## 📝 Cómo Funciona Module Federation

1. **Exposición del Módulo**: El microfrontend expone `MedicamentsModule` a través de `remoteEntry.js`

2. **Consumo en el Host**: La aplicación principal importa dinámicamente el módulo:
   ```typescript
   const MedicamentsModule = lazy(() => import('medicamentsApp/MedicamentsModule'));
   ```

3. **Dependencias Compartidas**: React, React Router y Material-UI se comparten como singleton, evitando duplicación

4. **Lazy Loading**: El microfrontend se carga solo cuando el usuario navega a `/medicamentos`

## 🎯 Ventajas de esta Arquitectura

- **Desarrollo Independiente**: Equipos pueden trabajar en diferentes microfrontends sin interferir
- **Deploy Independiente**: Cada microfrontend puede desplegarse por separado
- **Reutilización**: El mismo microfrontend puede usarse en múltiples aplicaciones host
- **Optimización**: Dependencias compartidas evitan duplicación de código
- **Escalabilidad**: Fácil agregar nuevos microfrontends

## 🔄 Agregar Más Microfrontends

Para agregar un nuevo microfrontend (ej: laboratorios):

1. Crear nueva carpeta `laboratorios-microfrontend`
2. Configurar Module Federation como remote
3. Agregar el remote al host en `frontend/vite.config.ts`:
   ```typescript
   remotes: {
     medicamentsApp: 'http://localhost:8081/assets/remoteEntry.js',
     laboratoriosApp: 'http://localhost:8082/assets/remoteEntry.js',
   }
   ```
4. Crear wrapper y agregar ruta en el host

## 🐛 Troubleshooting

### Error: "Failed to fetch dynamically imported module"

- Asegúrate de que el microfrontend esté corriendo en el puerto correcto (8081)
- Verifica que la URL del remote en `vite.config.ts` sea correcta

### Error: "Shared module is not available"

- Verifica que las versiones de las dependencias compartidas coincidan
- Asegúrate de que `singleton: true` esté configurado

### El módulo no se carga

- Revisa la consola del navegador para errores
- Verifica que ambas aplicaciones estén corriendo
- Limpia cache: `npm run build` en ambos proyectos

## 📚 Recursos

- [Module Federation Docs](https://module-federation.io/)
- [Vite Plugin Federation](https://github.com/originjs/vite-plugin-federation)
- [Micro-Frontends](https://micro-frontends.org/)

## 🎨 Personalización

Para personalizar el microfrontend:

1. **Estilos**: Modifica el theme en `MedicamentsList.tsx`
2. **API**: Ajusta las URLs en `medicamentsService.ts`
3. **Componentes**: Agrega nuevos componentes en `src/components/`
4. **Rutas**: Extiende las rutas en `MedicamentsModule.tsx`

## 🚢 Producción

Para construir para producción:

```bash
# Construir el microfrontend
cd medicaments-microfrontend
npm run build

# Construir el host
cd ../frontend
npm run build
```

Asegúrate de actualizar las URLs de los remotes en el host para apuntar a los servidores de producción.
