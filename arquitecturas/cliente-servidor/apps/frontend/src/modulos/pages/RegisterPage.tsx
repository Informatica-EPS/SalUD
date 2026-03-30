import { useState } from 'react';
import { Box, Paper, TextField, Typography, Button, MenuItem } from '@mui/material';
import { api } from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function RegisterPage() {
   const [role, setRole] = useState('Paciente');

   const [userData, setUserData] = useState({
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      documento: '',
      tipo_documento: 'CC',
      usuario: '',
      email: '',
      password: '',
      fecha_nacimiento: '',
      lugar_nacimiento: '',
      direccion: '',
   });

   const [patientData, setPatientData] = useState({
      ocupacion: '',
      discapacidad: '',
      religion: '',
      etnia: '',
      identidadGenero: '',
      sexo: '',
   });

   const [doctorData, setDoctorData] = useState({
      licenciaMedica: '',
   });

   const navigate = useNavigate();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
         if (role === 'Paciente') {
            await api.post('/patients/register', { userData, patientData });

            Swal.fire({
               icon: 'success',
               title: 'Registro exitoso',
               text: 'El paciente fue registrado correctamente',
               confirmButtonColor: '#1aa3a8',
            });

            navigate('/paciente');
         } else {
            await api.post('/doctors/register', { userData, doctorData });

            Swal.fire({
               icon: 'success',
               title: 'Registro exitoso',
               text: 'El doctor fue registrado correctamente',
               confirmButtonColor: '#1aa3a8',
            });

            navigate('/medico');
         }
      } catch (err: any) {
         Swal.fire({
            icon: 'error',
            title: 'Error en registro',
            text: err.response?.data?.message || 'No se pudo registrar',
            confirmButtonColor: '#c0392b',
         });
      }
   };

   const inputStyle = {
      '& .MuiOutlinedInput-root': {
         borderRadius: 3,
         background: '#f9fcfe',
      },
   };

   return (
      <Box
         sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `
               linear-gradient(135deg, rgba(7,86,91,0.92), rgba(17,116,143,0.88)),
               url("https://images.unsplash.com/photo-1588776814546-ec7c1e6b6f5b?q=80&w=1600&auto=format&fit=crop")
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            p: 3,
         }}
      >
         <Paper
            elevation={8}
            sx={{
               width: '100%',
               maxWidth: 500,
               borderRadius: 4,
               p: 4,
               background: 'rgba(255,255,255,0.96)',
               boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
               border: '1px solid rgba(255,255,255,0.7)',
            }}
         >
            <Typography
               variant="h5"
               textAlign="center"
               fontWeight="bold"
               mb={3}
               sx={{ color: '#16324f' }}
            >
               Crear cuenta
            </Typography>

            <Box
               component="form"
               onSubmit={handleSubmit}
               sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
               }}
            >
               <Typography fontWeight="bold">Datos Usuario</Typography>

               <TextField
                  label="Primer Nombre"
                  value={userData.primer_nombre}
                  onChange={e => setUserData({ ...userData, primer_nombre: e.target.value })}
                  sx={inputStyle}
               />

               <TextField
                  label="Segundo Nombre"
                  value={userData.segundo_nombre}
                  onChange={e => setUserData({ ...userData, segundo_nombre: e.target.value })}
                  sx={inputStyle}
               />

               <TextField
                  label="Primer Apellido"
                  value={userData.primer_apellido}
                  onChange={e => setUserData({ ...userData, primer_apellido: e.target.value })}
                  sx={inputStyle}
               />

               <TextField
                  label="Segundo Apellido"
                  value={userData.segundo_apellido}
                  onChange={e => setUserData({ ...userData, segundo_apellido: e.target.value })}
                  sx={inputStyle}
               />

               <TextField
                  label="Documento"
                  value={userData.documento}
                  onChange={e => setUserData({ ...userData, documento: e.target.value })}
                  sx={inputStyle}
               />

               <TextField
                  label="Tipo Documento"
                  select
                  value={userData.tipo_documento}
                  onChange={e => setUserData({ ...userData, tipo_documento: e.target.value })}
                  sx={inputStyle}
               >
                  <MenuItem value="CC">CC</MenuItem>
                  <MenuItem value="TI">TI</MenuItem>
               </TextField>

               <TextField
                  label="Usuario"
                  value={userData.usuario}
                  onChange={e => setUserData({ ...userData, usuario: e.target.value })}
                  sx={inputStyle}
               />

               <TextField
                  label="Email"
                  value={userData.email}
                  onChange={e => setUserData({ ...userData, email: e.target.value })}
                  sx={inputStyle}
               />

               <TextField
                  type="password"
                  label="Contraseña"
                  value={userData.password}
                  onChange={e => setUserData({ ...userData, password: e.target.value })}
                  sx={inputStyle}
               />

               <TextField
                  type="date"
                  label="Fecha Nacimiento"
                  InputLabelProps={{ shrink: true }}
                  value={userData.fecha_nacimiento}
                  onChange={e => setUserData({ ...userData, fecha_nacimiento: e.target.value })}
                  sx={inputStyle}
               />

               <TextField
                  label="Lugar Nacimiento"
                  value={userData.lugar_nacimiento}
                  onChange={e => setUserData({ ...userData, lugar_nacimiento: e.target.value })}
                  sx={inputStyle}
               />

               <TextField
                  label="Dirección"
                  value={userData.direccion}
                  onChange={e => setUserData({ ...userData, direccion: e.target.value })}
                  sx={inputStyle}
               />

               <Typography fontWeight="bold">Selecciona Rol</Typography>

               <TextField
                  select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  sx={inputStyle}
               >
                  <MenuItem value="Paciente">Paciente</MenuItem>
                  <MenuItem value="Doctor">Doctor</MenuItem>
               </TextField>

               {role === 'Paciente' && (
                  <>
                     <Typography fontWeight="bold">Datos Paciente</Typography>

                     <TextField
                        label="Ocupación"
                        value={patientData.ocupacion}
                        onChange={e =>
                           setPatientData({ ...patientData, ocupacion: e.target.value })
                        }
                        sx={inputStyle}
                     />

                     <TextField
                        label="Discapacidad"
                        value={patientData.discapacidad}
                        onChange={e =>
                           setPatientData({ ...patientData, discapacidad: e.target.value })
                        }
                        sx={inputStyle}
                     />

                     <TextField
                        label="Religión"
                        value={patientData.religion}
                        onChange={e => setPatientData({ ...patientData, religion: e.target.value })}
                        sx={inputStyle}
                     />

                     <TextField
                        label="Etnia"
                        value={patientData.etnia}
                        onChange={e => setPatientData({ ...patientData, etnia: e.target.value })}
                        sx={inputStyle}
                     />

                     <TextField
                        label="Identidad de Género"
                        value={patientData.identidadGenero}
                        onChange={e =>
                           setPatientData({ ...patientData, identidadGenero: e.target.value })
                        }
                        sx={inputStyle}
                     />

                     <TextField
                        label="Sexo"
                        value={patientData.sexo}
                        onChange={e => setPatientData({ ...patientData, sexo: e.target.value })}
                        sx={inputStyle}
                     />
                  </>
               )}

               {role === 'Doctor' && (
                  <>
                     <Typography fontWeight="bold">Datos Doctor</Typography>

                     <TextField
                        label="Licencia Médica"
                        value={doctorData.licenciaMedica}
                        onChange={e =>
                           setDoctorData({ ...doctorData, licenciaMedica: e.target.value })
                        }
                        sx={inputStyle}
                     />
                  </>
               )}

               <Button
                  type="submit"
                  sx={{
                     mt: 2,
                     py: 1.3,
                     borderRadius: 3,
                     fontWeight: 700,
                     textTransform: 'none',
                     color: 'white',
                     background: 'linear-gradient(135deg,#0e8f9a,#1aa3a8)',
                     '&:hover': {
                        opacity: 0.95,
                     },
                  }}
               >
                  Registrarse
               </Button>
            </Box>
         </Paper>
      </Box>
   );
}
