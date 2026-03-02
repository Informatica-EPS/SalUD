import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, HomePage } from './modulos/pages';
import { useAuth } from './context';

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
   const { isAuthenticated } = useAuth();
   return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
   return (
      <BrowserRouter>
         <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
               path="/home"
               element={
                  <ProtectedRoute>
                     <HomePage />
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
