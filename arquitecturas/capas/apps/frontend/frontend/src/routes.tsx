import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
   LoginPage,
   RegisterPage,
   HomePage,
   PacientesPage,
   DoctoresListPage,
   CitasDisponiblesPage,
   MisCitasPage,
   MisOrdenesPage,
   AgendarCitaEspecialidadPage,
   GestionHorariosPage,
   HistoriaClinicaPage,
   CrearOrdenPage,
   // Páginas antiguas
   PacientePage,
   MedicoPage,
   DoctorsPage,
   DoctoresPageAdmin,
   PacientesPageAdmin,
} from './modulos/pages';
import { useAuth } from './context';
import { MedicamentsRemoteWrapper } from './components/MedicamentsRemoteWrapper';

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

            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/doctors" element={<DoctoresPageAdmin />} />
            <Route path="/admin/patients" element={<PacientesPageAdmin />} />

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

            <Route
               path="/mis-ordenes"
               element={
                  <ProtectedRoute>
                     <MisOrdenesPage />
                  </ProtectedRoute>
               }
            />

            <Route
               path="/agendar-cita-especialidad/:especialidadId"
               element={
                  <ProtectedRoute>
                     <AgendarCitaEspecialidadPage />
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

            {/* Ruta de Órdenes Médicas */}
            <Route
               path="/crear-orden"
               element={
                  <ProtectedRoute>
                     <CrearOrdenPage />
                  </ProtectedRoute>
               }
            />

            <Route
               path="/crear-orden/:citaId"
               element={
                  <ProtectedRoute>
                     <CrearOrdenPage />
                  </ProtectedRoute>
               }
            />

            {/* Ruta de Medicamentos (Microfrontend) */}
            <Route
               path="/medicamentos/*"
               element={
                  <ProtectedRoute>
                     <MedicamentsRemoteWrapper />
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
