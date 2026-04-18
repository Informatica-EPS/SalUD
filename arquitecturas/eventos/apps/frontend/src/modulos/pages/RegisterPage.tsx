import { useState } from 'react';
import { Box, Paper, TextField, Typography, Button, MenuItem } from '@mui/material';
import { api } from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';

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

   const Discapacidades = [
      { value: 'ninguna', label: 'Ninguna' },
      { value: 'fisica', label: 'Física / Motora' },
      { value: 'visual', label: 'Visual' },
      { value: 'auditiva', label: 'Auditiva' },
      { value: 'intelectual', label: 'Intelectual' },
      { value: 'psicosocial', label: 'Mental / Psicosocial' },
      { value: 'multiple', label: 'Múltiple' },
   ];

   const Etnias = [
      { value: 'ninguna', label: 'Ninguna / No aplica' },
      { value: 'indigena', label: 'Indígena' },
      { value: 'rom', label: 'ROM (Gitano)' },
      { value: 'raizal', label: 'Raizal' },
      { value: 'palenquero', label: 'Palenquero' },
      { value: 'afro', label: 'Afrocolombiano / Negro / Mulato' },
      { value: 'otro', label: 'Otro' },
      { value: 'no_responde', label: 'Prefiere no responder' },
   ];

   const Religiones = [
      { value: 'ninguna', label: 'Ninguna' },
      { value: 'catolica', label: 'Católica' },
      { value: 'cristiana', label: 'Cristiana' },
      { value: 'evangelica', label: 'Evangélica' },
      { value: 'testigos_jehova', label: 'Testigos de Jehová' },
      { value: 'judaista', label: 'Judía' },
      { value: 'islam', label: 'Islam' },
      { value: 'otra', label: 'Otra' },
      { value: 'no_responde', label: 'Prefiere no responder' },
   ];

   const Sexos = [
      { value: 'masculino', label: 'Masculino' },
      { value: 'femenino', label: 'Femenino' },
      { value: 'intersexual', label: 'Intersexual' },
      { value: 'no_responde', label: 'Prefiere no responder' },
   ];

   const Generos = [
      { value: 'hombre', label: 'Hombre' },
      { value: 'mujer', label: 'Mujer' },
      { value: 'no_binario', label: 'No binario' },
      { value: 'transgenero', label: 'Transgénero' },
      { value: 'otro', label: 'Otro' },
      { value: 'no_responde', label: 'Prefiere no responder' },
   ];

   const [otroGenero, setOtroGenero] = useState('');

   const navigate = useNavigate();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (fechaMayorHoy) {
         Swal.fire({
            icon: 'warning',
            title: 'Fecha inválida',
            text: 'La fecha de nacimiento no puede ser mayor a hoy',
         });
         return;
      }

      if (esMenorEdadCC) {
         Swal.fire({
            icon: 'warning',
            title: 'Edad inválida',
            text: 'Para documento CC debe ser mayor de 18 años',
         });
         return;
      }

      if (esMayorEdadTI) {
         Swal.fire({
            icon: 'warning',
            title: 'Edad inválida',
            text: 'Con documento TI no puede ser mayor de 18 años',
         });
         return;
      }

      if (patientData.identidadGenero === 'otro' && !otroGenero.trim()) {
         Swal.fire({
            icon: 'warning',
            title: 'Campo requerido',
            text: 'Debes especificar la identidad de género',
         });
         return;
      }

      try {
         if (role === 'Paciente') {
            const identidadGeneroFinal =
               patientData.identidadGenero === 'otro'
                  ? otroGenero
                  : patientData.identidadGenero;

            await api.post('/patients/register', { userData, patientData: { ...patientData, identidadGenero: identidadGeneroFinal } });

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

   const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Edad mínima (18 años)
   const fechaMinimaCC = new Date();
      fechaMinimaCC.setFullYear(fechaMinimaCC.getFullYear() - 18);

      // Fecha seleccionada
   const fechaNacimientoDate = userData.fecha_nacimiento
         ? new Date(userData.fecha_nacimiento)
         : null;

      // Validaciones
   const fechaMayorHoy =
         fechaNacimientoDate && fechaNacimientoDate > hoy;

   const esMenorEdadCC =
         userData.tipo_documento === 'CC' &&
         fechaNacimientoDate &&
         fechaNacimientoDate > fechaMinimaCC;

   const esMayorEdadTI =
         userData.tipo_documento === 'TI' &&
         fechaNacimientoDate &&
         fechaNacimientoDate <= fechaMinimaCC;

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
               maxWidth: { xs: 500, md: 900 },
               borderRadius: 4,
               p: 4,
               background: 'rgba(255,255,255,0.96)',
               boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
               border: '1px solid rgba(255,255,255,0.7)',
            }}
         >
            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
               }}
            >
               <IconButton onClick={() => navigate(-1)}>
                  <ArrowBackIcon />
               </IconButton>

               <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ color: '#16324f', ml: 1 }}
               >
                  Crear cuenta
               </Typography>
            </Box>

            <Box
               component="form"
               onSubmit={handleSubmit}
            >
               <Grid container spacing={2}>
                  <Grid item xs={12}>
                     <Typography fontWeight="bold">Datos Usuario</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                     fullWidth
                        label="Primer Nombre"
                        required
                        value={userData.primer_nombre}
                        onChange={e => setUserData({ ...userData, primer_nombre: e.target.value })}
                        sx={inputStyle}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                        fullWidth
                        label="Segundo Nombre"
                        value={userData.segundo_nombre}
                        onChange={e => setUserData({ ...userData, segundo_nombre: e.target.value })}
                        sx={inputStyle}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                        fullWidth
                        label="Primer Apellido"
                        required
                        value={userData.primer_apellido}
                        onChange={e => setUserData({ ...userData, primer_apellido: e.target.value })}
                        sx={inputStyle}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                        fullWidth
                        label="Segundo Apellido"
                        value={userData.segundo_apellido}
                        onChange={e => setUserData({ ...userData, segundo_apellido: e.target.value })}
                        sx={inputStyle}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                        fullWidth
                        label="Documento"
                        required
                        value={userData.documento}
                        onChange={e => setUserData({ ...userData, documento: e.target.value })}
                        sx={inputStyle}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                        fullWidth
                        label="Tipo Documento"
                        required
                        select
                        value={userData.tipo_documento}
                        onChange={e => setUserData({ ...userData, tipo_documento: e.target.value })}
                        sx={inputStyle}
                     >
                        <MenuItem value="CC">CC</MenuItem>
                        <MenuItem value="TI">TI</MenuItem>
                     </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                        fullWidth
                        label="Usuario"
                        required
                        value={userData.usuario}
                        onChange={e => setUserData({ ...userData, usuario: e.target.value })}
                        sx={inputStyle}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                        fullWidth
                        label="Email"
                        required
                        value={userData.email}
                        onChange={e => setUserData({ ...userData, email: e.target.value })}
                        sx={inputStyle}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                        fullWidth
                        type="password"
                        required
                        label="Contraseña"
                        value={userData.password}
                        onChange={e => setUserData({ ...userData, password: e.target.value })}
                        sx={inputStyle}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                        fullWidth
                        type="date"
                        required
                        label="Fecha Nacimiento"
                        InputLabelProps={{ shrink: true }}
                        value={userData.fecha_nacimiento}
                        onChange={e =>
                           setUserData({ ...userData, fecha_nacimiento: e.target.value })
                        }
                        inputProps={{
                           max: new Date().toISOString().split('T')[0], // 🚫 futuro
                        }}
                        error={!!fechaMayorHoy || !!esMenorEdadCC || !!esMayorEdadTI}
                        helperText={
                           fechaMayorHoy
                              ? 'La fecha no puede ser mayor a hoy'
                              : esMenorEdadCC
                              ? 'Debe ser mayor de 18 años para CC'
                              : esMayorEdadTI
                              ? 'Con TI no puede ser mayor de 18 años'
                              : ''
                        }
                        sx={inputStyle}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                        fullWidth
                        label="Lugar Nacimiento"
                        value={userData.lugar_nacimiento}
                        onChange={e => setUserData({ ...userData, lugar_nacimiento: e.target.value })}
                        sx={inputStyle}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                        fullWidth
                        label="Dirección"
                        required
                        value={userData.direccion}
                        onChange={e => setUserData({ ...userData, direccion: e.target.value })}
                        sx={inputStyle}
                     />
                  </Grid>

                  <Grid item xs={12}>
                     <Typography fontWeight="bold">Selecciona Rol</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                     <TextField
                        fullWidth
                        required
                        select
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        sx={inputStyle}
                     >
                        <MenuItem value="Paciente">Paciente</MenuItem>
                        <MenuItem value="Doctor">Doctor</MenuItem>
                     </TextField>
                     
                  </Grid>

                  {role === 'Paciente' && (
                     <>

                        <Grid item xs={12}>
                           <Typography fontWeight="bold">Datos Paciente</Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                           <TextField
                              fullWidth
                              label="Ocupación"
                              value={patientData.ocupacion}
                              onChange={e =>
                                 setPatientData({ ...patientData, ocupacion: e.target.value })
                              }
                              sx={inputStyle}
                           />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                           <TextField
                              fullWidth
                              select
                              label="Discapacidad"
                              required
                              value={patientData.discapacidad}
                              onChange={e =>
                                 setPatientData({ ...patientData, discapacidad: e.target.value })
                              }
                              sx={inputStyle}
                           >
                              {Discapacidades.map((d) => (
                                 <MenuItem key={d.value} value={d.value}>
                                    {d.label}
                                 </MenuItem>
                              ))}
                           </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                           <TextField
                           fullWidth
                           select
                           label="Religión"
                           required
                           value={patientData.religion}
                           onChange={e => setPatientData({ ...patientData, religion: e.target.value })}
                           sx={inputStyle}
                        >
                           {Religiones.map((r) => (
                              <MenuItem key={r.value} value={r.value}>
                                 {r.label}
                              </MenuItem>
                           ))}
                        </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                           <TextField
                              fullWidth
                              select
                              label="Etnia"
                              required
                              value={patientData.etnia}
                              onChange={e => setPatientData({ ...patientData, etnia: e.target.value })}
                              sx={inputStyle}
                           >
                              {Etnias.map((e) => (
                                 <MenuItem key={e.value} value={e.value}>
                                    {e.label}
                                 </MenuItem>
                              ))}
                           </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                           <TextField
                              fullWidth
                              select
                              label="Identidad de Género"
                              value={patientData.identidadGenero}
                              onChange={e =>
                                 setPatientData({ ...patientData, identidadGenero: e.target.value })
                              }
                              sx={inputStyle}
                           >
                              {Generos.map((g) => (
                                 <MenuItem key={g.value} value={g.value}>
                                    {g.label}
                                 </MenuItem>
                              ))}
                           </TextField>
                        </Grid>

                        {patientData.identidadGenero === 'otro' && (
                           <Grid item xs={12} sm={6}>
                              <TextField
                                 fullWidth
                                 label="Especifique identidad de género"
                                 value={otroGenero}
                                 onChange={(e) => setOtroGenero(e.target.value)}
                                 sx={inputStyle}
                              />
                           </Grid>
                        )}

                        <Grid item xs={12} sm={6}>
                           <TextField
                           fullWidth
                           select
                           label="Sexo"
                           required
                           value={patientData.sexo}
                           onChange={e =>
                              setPatientData({ ...patientData, sexo: e.target.value })
                           }
                           sx={inputStyle}
                        >
                           {Sexos.map((s) => (
                              <MenuItem key={s.value} value={s.value}>
                                 {s.label}
                              </MenuItem>
                           ))}
                        </TextField>
                        </Grid>
                     </>
                  )}

                  {role === 'Doctor' && (
                     <>
                        <Grid item xs={12}>
                           <Typography fontWeight="bold">Datos Doctor</Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                           <TextField
                              fullWidth
                              label="Licencia Médica"
                              required
                              value={doctorData.licenciaMedica}
                              onChange={e =>
                                 setDoctorData({ ...doctorData, licenciaMedica: e.target.value })
                              }
                              sx={inputStyle}
                           />
                        </Grid>
                     </>
                  )}

                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                  </Grid>
               </Grid>
            </Box>
         </Paper>
      </Box>
   );
}
