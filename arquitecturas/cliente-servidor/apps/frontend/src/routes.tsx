import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
   LoginPage,
   HomePage,
   PacientesPage,
   DoctoresListPage,
   CitasDisponiblesPage,
   MisCitasPage,
   GestionHorariosPage,
   HistoriaClinicaPage,
   // Páginas antiguas
   PacientePage,
   MedicoPage,
} from './modulos/pages';
import { useAuth } from './context';

// Protección de rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
   const { user } = useAuth();
   return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
   return (
      <BrowserRouter>
         <Routes>
            {/* Ruta de Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Ruta Principal */}
            <Route
               path="/home"
               element={
                  <ProtectedRoute>
                     <HomePage />
                  </ProtectedRoute>
               }
            />

            {/* Rutas de Gestión de Pacientes */}
            <Route
               path="/pacientes"
               element={
                  <ProtectedRoute>
                     <PacientesPage />
                  </ProtectedRoute>
               }
            />

            {/* Rutas de Doctores */}
            <Route
               path="/doctores"
               element={
                  <ProtectedRoute>
                     <DoctoresListPage />
                  </ProtectedRoute>
               }
            />

            {/* Rutas de Citas */}
            <Route
               path="/citas-disponibles"
               element={
                  <ProtectedRoute>
                     <CitasDisponiblesPage />
                  </ProtectedRoute>
               }
            />

            <Route
               path="/mis-citas"
               element={
                  <ProtectedRoute>
                     <MisCitasPage />
                  </ProtectedRoute>
               }
            />

            {/* Rutas de Gestión de Horarios (Médicos) */}
            <Route
               path="/gestion-horarios"
               element={
                  <ProtectedRoute>
                     <GestionHorariosPage />
                  </ProtectedRoute>
               }
            />

            {/* Ruta de Historia Clínica */}
            <Route
               path="/historia-clinica"
               element={
                  <ProtectedRoute>
                     <HistoriaClinicaPage />
                  </ProtectedRoute>
               }
            />

            <Route
               path="/historia-clinica/:pacienteId"
               element={
                  <ProtectedRoute>
                     <HistoriaClinicaPage />
                  </ProtectedRoute>
               }
            />

            {/* Rutas Antiguas (Mantener por compatibilidad) */}
            <Route
               path="/paciente"
               element={
                  <ProtectedRoute>
                     <PacientePage />
                  </ProtectedRoute>
               }
            />

            <Route
               path="/medico"
               element={
                  <ProtectedRoute>
                     <MedicoPage />
                  </ProtectedRoute>
               }
            />

            {/* Rutas por Defecto */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
         </Routes>
      </BrowserRouter>
   );
};

export default AppRoutes;
