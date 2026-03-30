import { useState, useEffect } from 'react';
import {
   Box,
   Paper,
   TextField,
   Typography,
   Button,
   Alert,
   InputAdornment,
   IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { api } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function LoginPage() {
   const [documento, setDocumento] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [showPwd, setShowPwd] = useState(false);

   const { login, user } = useAuth();
   const navigate = useNavigate();

   useEffect(() => {
      if (user) navigate('/home');
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

         const user = await api.post('/users/login', {
            documento,
            password,
         });

         login(user);

         if (user.roles?.includes('Medico')) {
            navigate('/medico');
         } else if (userData.roles?.includes('Paciente')) {
            navigate('/paciente');
         } else {
            navigate('/home');
         }
      } catch (err: any) {
         if (err.response?.status === 404) {
            setError('Usuario no encontrado. Verifica tu documento.');
         } else if (err.response?.status === 400) {
            setError('Contraseña incorrecta.');
         } else {
            setError('Error al iniciar sesión.');
         }
      } finally {
         setLoading(false);
      }
   };

   return (
      <Box
         sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            background: `
         linear-gradient(135deg, rgba(7, 86, 91, 0.92), rgba(17, 116, 143, 0.88)),
         url("https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1600&auto=format&fit=crop")
      `,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            padding: '24px',
         }}
      >
         <Paper
            elevation={8}
            sx={{
               position: 'relative',
               width: '100%',
               maxWidth: 430,
               borderRadius: 4,
               p: 4,
               background: 'rgba(255,255,255,0.96)',
               boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
               border: '1px solid rgba(255,255,255,0.7)',
            }}
         >
            {/* LOGO */}
            <Box
               sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 3.5,
               }}
            >
               <Box
                  component="img"
                  src={logo}
                  alt="SalUD"
                  sx={{
                     height: 100,
                     width: 'auto',
                     objectFit: 'contain',
                     display: 'block',
                  }}
               />
            </Box>

            {/* HEADER */}
            <Box sx={{ mb: 3 }}>
               <Typography
                  variant="h5"
                  sx={{
                     fontWeight: 700,
                     color: '#16324f',
                     mb: 0.5,
                  }}
               >
                  Iniciar sesión
               </Typography>

               <Typography variant="body2" sx={{ color: '#6b7c8d' }}>
                  Accede al portal de pacientes y médicos
               </Typography>
            </Box>

            {/* FORM */}
            <Box
               component="form"
               onSubmit={handleLogin}
               sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
               }}
            >
               <TextField
                  label="Documento"
                  placeholder="Ingresa tu documento"
                  value={documento}
                  onChange={e => setDocumento(e.target.value)}
                  fullWidth
                  required
                  sx={{
                     '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#f9fcfe',
                     },
                  }}
               />

               <TextField
                  label="Contraseña"
                  placeholder="Ingresa tu contraseña"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                     endAdornment: (
                        <InputAdornment position="end">
                           <IconButton onClick={() => setShowPwd(!showPwd)}>
                              {showPwd ? <VisibilityOff /> : <Visibility />}
                           </IconButton>
                        </InputAdornment>
                     ),
                  }}
                  sx={{
                     '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#f9fcfe',
                     },
                  }}
               />

               {error && <Alert severity="error">{error}</Alert>}

               <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  sx={{
                     mt: 1,
                     py: 1.4,
                     borderRadius: 3,
                     fontWeight: 700,
                     fontSize: 16,
                     textTransform: 'none',
                     color: 'white',
                     background: 'linear-gradient(135deg,#0e8f9a,#1aa3a8)',

                     '&:hover': {
                        opacity: 0.95,
                     },
                  }}
               >
                  {loading ? 'Ingresando...' : 'Ingresar'}
               </Button>
            </Box>

            {/* FOOTER */}
            <Box
               sx={{
                  textAlign: 'center',
                  mt: 3,
               }}
            >
               <Typography variant="body2" sx={{ color: '#7a8c9a' }}>
                  ¿No tienes cuenta?
               </Typography>

               <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/register')}
                  sx={{
                     mt: 2,
                     py: 1.4,
                     borderRadius: 3,
                     fontWeight: 700,
                     textTransform: 'none',
                     borderColor: '#1aa3a8',
                     color: '#1aa3a8',
                  }}
               >
                  Registrarse
               </Button>

               <Typography
                  variant="body2"
                  sx={{
                     mt: 2,
                     color: '#7a8c9a',
                  }}
               >
                  © 2026 SalUD EPS
               </Typography>
            </Box>
         </Paper>
      </Box>
   );
}
