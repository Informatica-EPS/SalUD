import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';

const LoginPage = () => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const navigate = useNavigate();
   const { login } = useAuth();

   const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Llamar al método login del contexto
      login(email, password);
      // Navegar al home
      navigate('/home');
   };

   return (
      <Container maxWidth="sm">
         <Box
            sx={{
               minHeight: '100vh',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
            }}
         >
            <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
               <Typography variant="h4" component="h1" gutterBottom align="center">
                  SalUD
               </Typography>
               <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
                  Cliente-Servidor (Frontend)
               </Typography>
               <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
                  Sistema de Agendamiento de Citas Médicas
               </Typography>

               <form onSubmit={handleLogin}>
                  <TextField
                     label="Email"
                     type="email"
                     fullWidth
                     margin="normal"
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     required
                  />
                  <TextField
                     label="Contraseña"
                     type="password"
                     fullWidth
                     margin="normal"
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     required
                  />
                  <Button
                     type="submit"
                     variant="contained"
                     fullWidth
                     size="large"
                     sx={{ mt: 3 }}
                  >
                     Iniciar Sesión
                  </Button>
               </form>
            </Paper>
         </Box>
      </Container>
   );
};

export default LoginPage;
