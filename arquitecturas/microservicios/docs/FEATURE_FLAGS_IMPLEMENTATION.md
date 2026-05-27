# 🚀 Feature Flags - Guía de Implementación

## Descripción General

Los feature flags son variables de configuración que permiten habilitar/deshabilitar funcionalidades en tiempo de ejecución sin necesidad de redeploy.

---

## 📋 Feature Flags Disponibles

| Flag | Descripción | Estado Default | Ubicación |
|------|-------------|---|---|
| `orders.creation` | Permite crear órdenes médicas | ✅ Habilitado | Backend |
| `notifications.email` | Envía notificaciones por email | ✅ Habilitado | Notifications Service |
| `medicaments.newUI` | Activa nueva interfaz de medicamentos | ❌ Deshabilitado | Frontend |
| `users.twoFactor` | Autenticación de dos factores | ❌ Deshabilitado | Backend |
| `medicaments.gateway` | Enruta medicamentos a través del backend | ✅ Habilitado | Backend |
| `events.async` | Procesa eventos asincronamente | ✅ Habilitado | RabbitMQ |
| `appointments.multiDoctor` | Permite múltiples doctores por cita | ❌ Deshabilitado | Backend |
| `analytics.tracking` | Recolecta datos de analítica | ❌ Deshabilitado | Frontend |

---

## 🔧 Configuración en Docker

### **Variables de Entorno**

Editar `infra/dev.env`:

```bash
# Feature Flags - Habilitar/Deshabilitar funcionalidades
FEATURE_FLAGS_ENABLED=orders.creation,notifications.email,medicaments.gateway,events.async
FEATURE_FLAGS_DISABLED=medicaments.newUI,users.twoFactor,appointments.multiDoctor,analytics.tracking

# O configurar individualmente
FF_ORDERS_CREATION=true
FF_NOTIFICATIONS_EMAIL=true
FF_MEDICAMENTS_NEWUI=false
FF_USERS_TWOFACTOR=false
FF_MEDICAMENTS_GATEWAY=true
FF_EVENTS_ASYNC=true
```

### **Docker Compose**

```yaml
# infra/docker-compose.dev.yaml

services:
  backend:
    environment:
      - FEATURE_FLAGS_ENABLED=${FEATURE_FLAGS_ENABLED}
      - FEATURE_FLAGS_DISABLED=${FEATURE_FLAGS_DISABLED}
      - FF_ORDERS_CREATION=${FF_ORDERS_CREATION}
      - FF_NOTIFICATIONS_EMAIL=${FF_NOTIFICATIONS_EMAIL}

  notifications-service:
    environment:
      - FF_NOTIFICATIONS_EMAIL=${FF_NOTIFICATIONS_EMAIL}
      - FF_EVENTS_ASYNC=${FF_EVENTS_ASYNC}

  frontend:
    environment:
      - VITE_FF_MEDICAMENTS_NEWUI=${FF_MEDICAMENTS_NEWUI}
      - VITE_FF_ANALYTICS_TRACKING=${FF_ANALYTICS_TRACKING}
```

---

## 💻 Implementación en Backend (Node.js)

### **1. Servicio de Feature Flags**

Crear `backend/src/services/featureFlagService.js`:

```javascript
class FeatureFlagService {
  constructor() {
    this.flags = this.loadFlags();
  }

  loadFlags() {
    const enabled = (process.env.FEATURE_FLAGS_ENABLED || '').split(',').filter(Boolean);
    const disabled = (process.env.FEATURE_FLAGS_DISABLED || '').split(',').filter(Boolean);

    const flags = {
      'orders.creation': {
        enabled: process.env.FF_ORDERS_CREATION !== 'false',
        description: 'Permite crear órdenes médicas'
      },
      'notifications.email': {
        enabled: process.env.FF_NOTIFICATIONS_EMAIL !== 'false',
        description: 'Envía notificaciones por email'
      },
      'medicaments.gateway': {
        enabled: process.env.FF_MEDICAMENTS_GATEWAY !== 'false',
        description: 'Enruta medicamentos a través del backend'
      },
      'users.twoFactor': {
        enabled: process.env.FF_USERS_TWOFACTOR === 'true',
        description: 'Autenticación de dos factores'
      },
      'events.async': {
        enabled: process.env.FF_EVENTS_ASYNC !== 'false',
        description: 'Procesa eventos asincronamente'
      },
      'appointments.multiDoctor': {
        enabled: process.env.FF_APPOINTMENTS_MULTIDOCTOR === 'true',
        description: 'Permite múltiples doctores por cita'
      }
    };

    // Sobrescribir con valores explícitos si existen
    enabled.forEach(flag => {
      if (flags[flag]) flags[flag].enabled = true;
    });
    disabled.forEach(flag => {
      if (flags[flag]) flags[flag].enabled = false;
    });

    return flags;
  }

  isEnabled(flagName) {
    const flag = this.flags[flagName];
    if (!flag) {
      console.warn(`Feature flag '${flagName}' not defined, defaulting to false`);
      return false;
    }
    return flag.enabled;
  }

  getFlag(flagName) {
    return this.flags[flagName] || null;
  }

  getAllFlags() {
    return this.flags;
  }

  setFlag(flagName, enabled) {
    if (this.flags[flagName]) {
      this.flags[flagName].enabled = enabled;
      console.log(`Feature flag '${flagName}' set to ${enabled}`);
    }
  }
}

module.exports = new FeatureFlagService();
```

### **2. Middleware para Feature Flags**

Crear `backend/src/middlewares/featureFlag.middleware.js`:

```javascript
const featureFlagService = require('../services/featureFlagService');

const requireFeatureFlag = (flagName) => {
  return (req, res, next) => {
    if (!featureFlagService.isEnabled(flagName)) {
      return res.status(403).json({
        error: 'Feature not available',
        message: `Feature '${flagName}' is currently disabled`,
        flagName
      });
    }
    next();
  };
};

module.exports = { requireFeatureFlag };
```

### **3. Uso en Rutas**

```javascript
// backend/src/routes/orders.routes.js
const { requireFeatureFlag } = require('../middlewares/featureFlag.middleware');
const orderController = require('../controllers/orders.controller');

router.post(
  '/',
  requireFeatureFlag('orders.creation'),
  orderController.createOrder
);
```

### **4. Uso en Servicios**

```javascript
// backend/src/services/order.service.js
const featureFlagService = require('./featureFlagService');

class OrderService {
  async createOrder(data) {
    // Verificar si la creación de órdenes está habilitada
    if (!featureFlagService.isEnabled('orders.creation')) {
      throw new Error('Order creation feature is disabled');
    }

    // Lógica de creación de orden
    const order = await Order.create(data);

    // Verificar si se deben enviar eventos
    if (featureFlagService.isEnabled('events.async')) {
      await publishEvent('order.created', order);
    }

    return order;
  }
}
```

### **5. Endpoint de Admin para Gestionar Flags**

```javascript
// backend/src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const featureFlagService = require('../services/featureFlagService');

// Obtener todos los feature flags
router.get('/flags', (req, res) => {
  res.json(featureFlagService.getAllFlags());
});

// Obtener un flag específico
router.get('/flags/:flagName', (req, res) => {
  const flag = featureFlagService.getFlag(req.params.flagName);
  if (!flag) {
    return res.status(404).json({ error: 'Flag not found' });
  }
  res.json(flag);
});

// Cambiar estado de un flag (solo en desarrollo)
router.put('/flags/:flagName', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Cannot modify flags in production' });
  }

  const { enabled } = req.body;
  featureFlagService.setFlag(req.params.flagName, enabled);
  
  res.json({
    message: `Flag '${req.params.flagName}' updated`,
    flag: featureFlagService.getFlag(req.params.flagName)
  });
});

module.exports = router;
```

---

## 🎨 Implementación en Frontend (React)

### **1. Hook de Feature Flags**

Crear `frontend/src/hooks/useFeatureFlag.js`:

```javascript
import { useState, useEffect } from 'react';

export const useFeatureFlag = (flagName) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Opción 1: Variables de entorno en tiempo de build
    const envFlag = import.meta.env[`VITE_FF_${flagName.toUpperCase()}`];
    if (envFlag !== undefined) {
      setIsEnabled(envFlag === 'true');
      setLoading(false);
      return;
    }

    // Opción 2: Llamar a API del backend
    const fetchFlag = async () => {
      try {
        const response = await fetch(`/api/admin/flags/${flagName}`);
        if (response.ok) {
          const data = await response.json();
          setIsEnabled(data.enabled);
        }
      } catch (error) {
        console.error(`Error fetching feature flag '${flagName}':`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlag();
  }, [flagName]);

  return { isEnabled, loading };
};
```

### **2. Componente Wrapper**

```javascript
// frontend/src/components/FeatureFlagWrapper.jsx
import { useFeatureFlag } from '../hooks/useFeatureFlag';

export const FeatureFlagWrapper = ({ 
  flagName, 
  children, 
  fallback = null 
}) => {
  const { isEnabled, loading } = useFeatureFlag(flagName);

  if (loading) return <div>Loading feature...</div>;

  return isEnabled ? children : fallback;
};
```

### **3. Uso en Componentes**

```javascript
// frontend/src/pages/MedicamentsPage.jsx
import { FeatureFlagWrapper } from '../components/FeatureFlagWrapper';
import MedicamentsNewUI from '../components/MedicamentsNewUI';
import MedicamentsLegacyUI from '../components/MedicamentsLegacyUI';

export default function MedicamentsPage() {
  return (
    <FeatureFlagWrapper
      flagName="medicaments.newUI"
      fallback={<MedicamentsLegacyUI />}
    >
      <MedicamentsNewUI />
    </FeatureFlagWrapper>
  );
}
```

---

## 🐍 Implementación en Medicaments Service (Python)

### **1. Configuración de Feature Flags**

Crear `medicaments-service/app/core/feature_flags.py`:

```python
import os
from typing import Dict, bool

class FeatureFlagConfig:
    def __init__(self):
        self.flags = self._load_flags()

    def _load_flags(self) -> Dict[str, bool]:
        enabled = os.getenv('FEATURE_FLAGS_ENABLED', '').split(',')
        disabled = os.getenv('FEATURE_FLAGS_DISABLED', '').split(',')

        flags = {
            'events.async': os.getenv('FF_EVENTS_ASYNC', 'true').lower() == 'true',
            'medicaments.newUI': os.getenv('FF_MEDICAMENTS_NEWUI', 'false').lower() == 'true',
            'analytics.tracking': os.getenv('FF_ANALYTICS_TRACKING', 'false').lower() == 'true',
        }

        # Sobrescribir con valores de listas
        for flag in enabled:
            if flag.strip() in flags:
                flags[flag.strip()] = True
        for flag in disabled:
            if flag.strip() in flags:
                flags[flag.strip()] = False

        return flags

    def is_enabled(self, flag_name: str) -> bool:
        return self.flags.get(flag_name, False)

    def get_all_flags(self) -> Dict[str, bool]:
        return self.flags

feature_flags = FeatureFlagConfig()
```

### **2. Uso en Servicios**

```python
# medicaments-service/app/services/medicaments_service.py
from app.core.feature_flags import feature_flags

class MedicamentsService:
    async def dispatch_medicaments(self, dispatch_request: MedicamentDispatchRequest):
        # Verificar si los eventos asincronos están habilitados
        if feature_flags.is_enabled('events.async'):
            # Publicar evento de despacho
            await self._publish_dispatch_event(dispatch_request)
        
        # Actualizar inventario
        return await self._update_inventory(dispatch_request)
```

---

## 📊 Monitoreo de Feature Flags

### **Endpoint para Ver Estados**

```bash
# Obtener todos los flags
curl http://localhost:5000/api/admin/flags

# Obtener un flag específico
curl http://localhost:5000/api/admin/flags/orders.creation

# Cambiar estado de un flag (solo desarrollo)
curl -X PUT http://localhost:5000/api/admin/flags/medicaments.newUI \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

### **Logging de Feature Flags**

```javascript
// backend/src/index.js
const featureFlagService = require('./services/featureFlagService');

// Al iniciar el servidor
console.log('🚀 Feature Flags Status:');
Object.entries(featureFlagService.getAllFlags()).forEach(([name, config]) => {
  const status = config.enabled ? '✅' : '❌';
  console.log(`  ${status} ${name}: ${config.description}`);
});
```

---

## 🧪 Testing con Feature Flags

```javascript
// backend/src/tests/featureFlags.test.js
const featureFlagService = require('../services/featureFlagService');

describe('Feature Flags', () => {
  test('should check if feature is enabled', () => {
    const result = featureFlagService.isEnabled('orders.creation');
    expect(typeof result).toBe('boolean');
  });

  test('should return false for unknown flags', () => {
    const result = featureFlagService.isEnabled('unknown.flag');
    expect(result).toBe(false);
  });

  test('should toggle feature flags', () => {
    featureFlagService.setFlag('medicaments.newUI', true);
    expect(featureFlagService.isEnabled('medicaments.newUI')).toBe(true);

    featureFlagService.setFlag('medicaments.newUI', false);
    expect(featureFlagService.isEnabled('medicaments.newUI')).toBe(false);
  });
});
```

---

## 📈 Mejores Prácticas

1. **Nombrado:** Usar formato `domain.feature` (ej: `orders.creation`)
2. **Documentación:** Siempre documentar qué hace cada flag
3. **Expiración:** Remover flags después de cierto tiempo
4. **Testing:** Probar ambos casos (habilitado/deshabilitado)
5. **Monitoreo:** Registrar cambios de flags en logs
6. **Seguridad:** Proteger endpoints de admin con autenticación
7. **Versionado:** Mantener historial de cambios

---

## 🔄 Ciclo de Vida de un Feature Flag

```
1. NUEVO (deshabilitado por defecto)
   ↓
2. EVALUACIÓN (habilitar en dev/staging)
   ↓
3. BETA (habilitado para usuarios seleccionados)
   ↓
4. PRODUCCIÓN (habilitado para todos)
   ↓
5. DEPRECATED (mantener por compatibilidad)
   ↓
6. ELIMINADO (remover código)
```

---

**Última actualización:** Mayo 24, 2026
