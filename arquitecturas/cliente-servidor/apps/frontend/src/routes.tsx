// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { LoginPage, HomePage, CitasDisponiblesPage, MisCitasPage } from './modulos/pages';
// import { useAuth } from './context';

// // Componente para proteger rutas
// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//    const { isAuthenticated } = useAuth();
//    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
// };

// const AppRoutes = () => {
//    return (
//       <BrowserRouter>
//          <Routes>
//             <Route path="/login" element={<LoginPage />} />
//             <Route
//                path="/home"
//                element={
//                   <ProtectedRoute>
//                      <HomePage />
//                   </ProtectedRoute>
//                }
//             />
//             <Route
//                path="/citas-disponibles"
//                element={
//                   <ProtectedRoute>
//                      <CitasDisponiblesPage />
//                   </ProtectedRoute>
//                }
//             />
//             <Route
//                path="/mis-citas"
//                element={
//                   <ProtectedRoute>
//                      <MisCitasPage />
//                   </ProtectedRoute>
//                }
//             />
//             <Route path="/" element={<Navigate to="/login" />} />
//             <Route path="*" element={<Navigate to="/login" />} />
//          </Routes>
//       </BrowserRouter>
//    );
// };

// export default AppRoutes;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage  from './modulos/pages/LoginPage';
import PacientePage from './modulos/pages/PacientePage';
import MedicoPage from './modulos/pages/MedicoPage';
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

            <Route path="/login" element={<LoginPage />} />

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

            <Route path="/" element={<Navigate to="/login" />} />

            <Route path="*" element={<Navigate to="/login" />} />

         </Routes>

      </BrowserRouter>
   );
};

export default AppRoutes;