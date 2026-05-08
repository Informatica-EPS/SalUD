import React, { Suspense, lazy } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Importación dinámica del microfrontend
const MedicamentsModule = lazy(() => import('medicamentsApp/MedicamentsModule'));

const LoadingFallback = () => (
  <Box
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    minHeight="400px"
    gap={2}
  >
    <CircularProgress />
    <Typography variant="body1" color="text.secondary">
      Cargando módulo de medicamentos...
    </Typography>
  </Box>
);

const ErrorFallback = () => (
  <Box
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    minHeight="400px"
    gap={2}
  >
    <Typography variant="h6" color="error">
      Error al cargar el módulo de medicamentos
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Por favor, asegúrese de que el microfrontend esté corriendo en el puerto 8081
    </Typography>
  </Box>
);

export const MedicamentsRemoteWrapper: React.FC = () => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    // Verificar si el microfrontend está disponible
    fetch('http://localhost:8081/remoteEntry.js')
      .catch(() => setHasError(true));
  }, []);

  if (hasError) {
    return <ErrorFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <MedicamentsModule />
    </Suspense>
  );
};
