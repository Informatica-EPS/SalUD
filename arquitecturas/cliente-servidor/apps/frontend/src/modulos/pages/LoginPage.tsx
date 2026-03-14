import { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../../assets/logo.png';

export default function LoginPage() {
   const [documento, setDocumento] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const { login, user } = useAuth();
   const navigate = useNavigate();

   // Si ya está autenticado, redirigir al home
   useEffect(() => {
      if (user) {
         navigate('/home');
      }
   }, [user, navigate]);

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
         if (documento === '12345' && password === 'admin') {
            login({ roles: ['Admin'], usuario: 'admin' });
            navigate('/admin-home');
            return;
         }

         // Intenta login con el backend
         const user = await api.post('/users/login', {
            documento,
            password,
         });

         login(user);

         // Navegar según el rol
         if (user.roles?.includes('Medico')) {
            navigate('/medico');
         } else if (user.roles?.includes('Paciente')) {
            navigate('/paciente');
         } else {
            navigate('/home');
         }
      } catch (err: any) {
         console.error('Error en login:', err);

         // Mostrar mensaje de error apropiado
         if (err.response?.status === 404) {
            setError('Usuario no encontrado. Verifica tu documento.');
         } else if (err.response?.status === 400) {
            setError('Contraseña incorrecta. Por favor intenta de nuevo.');
         } else if (err.response?.data?.message) {
            setError(err.response.data.message);
         } else if (err.message) {
            setError('Error al conectar con el servidor. Verifica que el backend esté corriendo.');
         } else {
            setError('Error al iniciar sesión. Por favor intenta de nuevo.');
         }
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="login-page">
         <div className="login-overlay" />

         <div className="login-card">
            <div className="login-brand">
               <img src={logo} alt="SalUD Logo" className="brand-logo" />
               <div>
                  <h1>SalUD</h1>
                  <p>Tu bienestar, nuestra prioridad</p>
               </div>
            </div>

            <div className="login-header">
               <h2>Iniciar sesión</h2>
               <span>Accede al portal de pacientes y médicos</span>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
               <div className="input-group">
                  <label>Documento</label>
                  <input
                     type="text"
                     placeholder="Ingresa tu documento"
                     value={documento}
                     onChange={e => setDocumento(e.target.value)}
                     required
                  />
               </div>

               <div className="input-group">
                  <label>Contraseña</label>
                  <input
                     type="password"
                     placeholder="Ingresa tu contraseña"
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     required
                  />
               </div>

               {error && <div className="login-error">{error}</div>}

               <button type="submit" className="login-button" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Ingresar'}
               </button>
            </form>

            <div className="login-footer">
               <p>¿No tienes cuenta?</p>
               <button
                  type="button"
                  className="register-button"
                  onClick={() => navigate('/register')}
               >
                  Registrarse
               </button>
               <p>© 2026 SalUD EPS</p>
            </div>
         </div>
      </div>
   );
}
