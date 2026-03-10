// import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context';

// const LoginPage = () => {
//    const [email, setEmail] = useState('');
//    const [password, setPassword] = useState('');
//    const navigate = useNavigate();
//    const { login } = useAuth();

//    const handleLogin = (e: React.FormEvent) => {
//       e.preventDefault();
//       // Llamar al método login del contexto
//       login(email, password);
//       // Navegar al home
//       navigate('/home');
//    };

//    return (
//       <Container maxWidth="sm">
//          <Box
//             sx={{
//                minHeight: '100vh',
//                display: 'flex',
//                alignItems: 'center',
//                justifyContent: 'center',
//             }}
//          >
//             <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
//                <Typography variant="h4" component="h1" gutterBottom align="center">
//                   SalUD
//                </Typography>
//                <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
//                   Cliente-Servidor (Frontend)
//                </Typography>
//                <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
//                   Sistema de Agendamiento de Citas Médicas
//                </Typography>

//                <form onSubmit={handleLogin}>
//                   <TextField
//                      label="Email"
//                      type="email"
//                      fullWidth
//                      margin="normal"
//                      value={email}
//                      onChange={e => setEmail(e.target.value)}
//                      required
//                   />
//                   <TextField
//                      label="Contraseña"
//                      type="password"
//                      fullWidth
//                      margin="normal"
//                      value={password}
//                      onChange={e => setPassword(e.target.value)}
//                      required
//                   />
//                   <Button
//                      type="submit"
//                      variant="contained"
//                      fullWidth
//                      size="large"
//                      sx={{ mt: 3 }}
//                   >
//                      Iniciar Sesión
//                   </Button>
//                </form>
//             </Paper>
//          </Box>
//       </Container>
//    );
// };

// export default LoginPage;

import { useState } from 'react';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../../assets/logo.png';

export default function LoginPage() {
   const [documento, setDocumento] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const { login } = useAuth();
   const navigate = useNavigate();

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
         const user = await apiClient('/users/login', {
            method: 'POST',
            body: JSON.stringify({ documento, password }),
         });

         login(user);
         if (user.roles?.includes('Medico')) {
            navigate('/medico');
         } else if (user.roles?.includes('Paciente')) {
            navigate('/paciente');
         } else {
            navigate('/');
         }
      } catch (err) {
         setError('Documento o contraseña incorrectos');
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
               <p>© 2026 SalUD EPS</p>
            </div>
         </div>
      </div>
   );
}
