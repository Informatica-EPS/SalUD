import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
   id?: number;
   name?: string;
   email?: string;
   roles?: string[];
   idPaciente?: number;
   idDoctor?: number;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   [key: string]: any;
}

interface AuthContextType {
   user: User | null;
   login: (userData: User) => void;
   logout: () => void;
   isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
   // Inicializar el usuario desde localStorage
   const [user, setUser] = useState<User | null>(() => {
      try {
         const storedUser = localStorage.getItem('user');
         if (storedUser) {
            return JSON.parse(storedUser);
         }
      } catch (error) {
         console.error('Error al leer usuario de localStorage:', error);
      }
      return null;
   });

   // Sincronizar con localStorage cuando cambia el usuario
   useEffect(() => {
      if (user) {
         localStorage.setItem('user', JSON.stringify(user));
      } else {
         localStorage.removeItem('user');
      }
   }, [user]);

   const login = (userData: User) => {
      console.log('Login exitoso:', userData);
      setUser(userData);
   };

   const logout = () => {
      console.log('Logout exitoso');
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
   };

   const isAuthenticated = user !== null;

   return (
      <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
         {children}
      </AuthContext.Provider>
   );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error('useAuth debe ser usado dentro de un AuthProvider');
   }
   return context;
};
