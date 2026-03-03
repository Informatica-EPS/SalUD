import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
   isAuthenticated: boolean;
   user: { email: string; name: string } | null;
   login: (email: string, password: string) => void;
   logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
   const [isAuthenticated, setIsAuthenticated] = useState(() => {
      // Inicializar desde localStorage
      const stored = localStorage.getItem('isAuthenticated');
      return stored === 'true';
   });
   
   const [user, setUser] = useState<{ email: string; name: string } | null>(() => {
      // Inicializar desde localStorage
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
   });

   // Sincronizar con localStorage cuando cambie el estado
   useEffect(() => {
      if (isAuthenticated) {
         localStorage.setItem('isAuthenticated', 'true');
      } else {
         localStorage.removeItem('isAuthenticated');
      }
   }, [isAuthenticated]);

   useEffect(() => {
      if (user) {
         localStorage.setItem('user', JSON.stringify(user));
      } else {
         localStorage.removeItem('user');
      }
   }, [user]);

   const login = (email: string, _password: string) => {
      // Aquí implementarás la lógica real de autenticación con el backend
      // Por ahora, simulamos un login exitoso
      console.log('Login exitoso:', email);
      setIsAuthenticated(true);
      setUser({ email, name: email.split('@')[0] });
   };

   const logout = () => {
      console.log('Logout exitoso');
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
   };

   return (
      <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
};
