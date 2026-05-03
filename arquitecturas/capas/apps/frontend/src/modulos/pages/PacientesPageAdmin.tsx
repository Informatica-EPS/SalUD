import { useEffect, useState } from 'react';
import {
   Box,
   Typography,
   Button,
   Table,
   TableHead,
   TableRow,
   TableCell,
   TableBody,
   Paper,
   Stack,
} from '@mui/material';
import { api } from '../../services/apiClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../../components';

export default function PacientesPageAdmin() {
   const [patients, setPatients] = useState<any[]>([]);
   const navigate = useNavigate();

   useEffect(() => {
      const fetchPatients = async () => {
         try {
            const res = await api.get('/patients');
            setPatients(Array.isArray(res) ? res : []);
         } catch (err) {
            console.error('Error cargando pacientes:', err);
            setPatients([]);
         }
      };
      fetchPatients();
   }, []);

   const handleView = async (pat: any) => {
      try {
         const res = await api.get(`/patients/${pat.id}`);
         const paciente = res;

         Swal.fire({
            title: 'Detalle Paciente',
            html: `
            <div style="text-align:left; font-size:14px; line-height:1.6;">
               <strong>Nombre:</strong> ${paciente.User?.primer_nombre || ''} ${paciente.User?.primer_apellido || ''}<br>
               <strong>Documento:</strong> ${paciente.User?.documento || ''}<br>
               <strong>Email:</strong> ${paciente.User?.email || ''}<br>
               <strong>Dirección:</strong> ${paciente.User?.direccion || ''}<br>
               <hr>
               <strong>Ocupación:</strong> ${paciente.ocupacion || ''}<br>
               <strong>Discapacidad:</strong> ${paciente.discapacidad || ''}<br>
               <strong>Religión:</strong> ${paciente.religion || ''}<br>
               <strong>Etnia:</strong> ${paciente.etnia || ''}<br>
               <strong>Identidad de Género:</strong> ${paciente.identidadGenero || ''}<br>
               <strong>Sexo:</strong> ${paciente.sexo || ''}
            </div>
         `,
            confirmButtonColor: '#0e8f9a',
         });
      } catch {
         Swal.fire('Error', 'No se pudo cargar el detalle del paciente', 'error');
      }
   };

   const handleDeleteConfirm = async (pat: any) => {
      const result = await Swal.fire({
         html: `¿Está segur@ de eliminar al paciente?`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#e74c3c',
         cancelButtonColor: '#6c757d',
         confirmButtonText: 'Sí, eliminar',
         cancelButtonText: 'Cancelar',
      });

      if (!result.isConfirmed) return;

      try {
         await api.delete(`/patients/${pat.id}`);
         setPatients(patients.filter(p => p.id !== pat.id));

         Swal.fire('Eliminado', 'Paciente eliminado correctamente', 'success');
      } catch {
         Swal.fire('Error', 'No se pudo eliminar el paciente', 'error');
      }
   };

   const handleCreatePatient = async () => {
      const { value: formValues } = await Swal.fire({
         title: 'Registrar Paciente',
         html: `
            <input id="primer_nombre" class="swal2-input" placeholder="Primer Nombre">
            <input id="primer_apellido" class="swal2-input" placeholder="Primer Apellido">
            <input id="documento" class="swal2-input" placeholder="Documento">
            <input id="usuario" class="swal2-input" placeholder="Usuario">
            <input id="email" class="swal2-input" placeholder="Email">
            <input id="password" type="password" class="swal2-input" placeholder="Contraseña">
            <input id="ocupacion" class="swal2-input" placeholder="Ocupación">
            <input id="discapacidad" class="swal2-input" placeholder="Discapacidad">
            <input id="religion" class="swal2-input" placeholder="Religión">
            <input id="etnia" class="swal2-input" placeholder="Etnia">
            <input id="identidadGenero" class="swal2-input" placeholder="Identidad de Género">
            <input id="sexo" class="swal2-input" placeholder="Sexo">
         `,
         preConfirm: () => {
            const documento = (document.getElementById('documento') as HTMLInputElement).value;
            if (!documento) {
               Swal.showValidationMessage('El documento es obligatorio');
               return null;
            }
            return {
               userData: {
                  primer_nombre: (document.getElementById('primer_nombre') as HTMLInputElement)
                     .value,
                  primer_apellido: (document.getElementById('primer_apellido') as HTMLInputElement)
                     .value,
                  documento,
                  tipo_documento: 'CC',
                  usuario: (document.getElementById('usuario') as HTMLInputElement).value,
                  email: (document.getElementById('email') as HTMLInputElement).value,
                  password: (document.getElementById('password') as HTMLInputElement).value,
               },
               patientData: {
                  ocupacion: (document.getElementById('ocupacion') as HTMLInputElement).value,
                  discapacidad: (document.getElementById('discapacidad') as HTMLInputElement).value,
                  religion: (document.getElementById('religion') as HTMLInputElement).value,
                  etnia: (document.getElementById('etnia') as HTMLInputElement).value,
                  identidadGenero: (document.getElementById('identidadGenero') as HTMLInputElement)
                     .value,
                  sexo: (document.getElementById('sexo') as HTMLInputElement).value,
               },
            };
         },
      });

      if (!formValues) return;

      try {
         await api.post('/patients/register', formValues);
         const res = await api.get('/patients');
         setPatients(Array.isArray(res) ? res : []);

         Swal.fire('Éxito', 'Paciente creado correctamente', 'success');
      } catch (err: any) {
         if (err.response?.status === 409) {
            Swal.fire('Error', 'Usuario, email o documento ya existen', 'error');
         } else {
            Swal.fire('Error', 'No se pudo crear el paciente', 'error');
         }
      }
   };

   const handleEdit = async (pat: any) => {
      const { value: formValues } = await Swal.fire({
         title: 'Editar Paciente',
         html: `
            <input id="ocupacion" class="swal2-input" value="${pat.ocupacion || ''}">
            <input id="discapacidad" class="swal2-input" value="${pat.discapacidad || ''}">
            <input id="religion" class="swal2-input" value="${pat.religion || ''}">
            <input id="etnia" class="swal2-input" value="${pat.etnia || ''}">
            <input id="identidadGenero" class="swal2-input" value="${pat.identidadGenero || ''}">
            <input id="sexo" class="swal2-input" value="${pat.sexo || ''}">
         `,
         preConfirm: () => ({
            patientData: {
               ocupacion: (document.getElementById('ocupacion') as HTMLInputElement).value,
               discapacidad: (document.getElementById('discapacidad') as HTMLInputElement).value,
               religion: (document.getElementById('religion') as HTMLInputElement).value,
               etnia: (document.getElementById('etnia') as HTMLInputElement).value,
               identidadGenero: (document.getElementById('identidadGenero') as HTMLInputElement)
                  .value,
               sexo: (document.getElementById('sexo') as HTMLInputElement).value,
            },
         }),
      });

      if (!formValues) return;

      try {
         const res = await api.put(`/patients/${pat.id}`, formValues);
         setPatients(patients.map(p => (p.id === pat.id ? res : p)));
         Swal.fire('Éxito', 'Paciente actualizado correctamente', 'success');
      } catch {
         Swal.fire('Error', 'No se pudo actualizar el paciente', 'error');
      }
   };

   return (
      <Box
         sx={{
            px: { xs: 2, sm: 3, md: 6 },
            py: { xs: 3, md: 5 },
            maxWidth: '1280px',
            mx: 'auto',
            minHeight: '100vh',
            background: 'linear-gradient(to right, #f9fbfc, #eef5f7)',
         }}
      >
         {/* HEADER */}
         <Box mb={2}>
            <BackButton to="/home" />
         </Box>
         <Box
            sx={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               mb: 3,
            }}
         >
            <Typography
               variant="h5"
               sx={{
                  fontWeight: 700,
                  color: '#16324f',
                  letterSpacing: 0.5,
               }}
            >
               Pacientes Registrados
            </Typography>

            <Stack direction="row" spacing={2}>
               <Button
                  onClick={handleCreatePatient}
                  sx={{
                     px: 2.5,
                     py: 1,
                     borderRadius: 2,
                     fontWeight: 'bold',
                     color: 'white',
                     textTransform: 'none',
                     background: 'linear-gradient(135deg,#0e8f9a,#1aa3a8)',
                     '&:hover': { opacity: 0.9 },
                  }}
               >
                  ➕ Crear Paciente
               </Button>
            </Stack>
         </Box>

         {/* TABLA */}
         {patients.length > 0 ? (
            <Paper
               sx={{
                  borderRadius: 3,
                  p: 3,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                  border: '1px solid #e6eef2',
               }}
            >
               <Table>
                  <TableHead
                     sx={{
                        background: '#0e8f9a',
                     }}
                  >
                     <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                           ID
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                           Nombre
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                           Email
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                           Ocupación
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                           Acciones
                        </TableCell>
                     </TableRow>
                  </TableHead>

                  <TableBody>
                     {patients.map((pat, index) => (
                        <TableRow
                           key={pat.id}
                           sx={{
                              background: index % 2 === 0 ? '#fff' : '#f3f7f9',
                              '&:hover': { background: '#eaf3f5' },
                           }}
                        >
                           <TableCell align="center">{pat.id}</TableCell>

                           <TableCell align="center">
                              {pat.User
                                 ? `${pat.User.primer_nombre} ${pat.User.primer_apellido}`
                                 : ''}
                           </TableCell>

                           <TableCell align="center">{pat.User?.email}</TableCell>

                           <TableCell align="center">{pat.ocupacion}</TableCell>

                           <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                 <Button
                                    onClick={() => handleView(pat)}
                                    sx={{
                                       background: '#3498db',
                                       color: 'white',
                                       textTransform: 'none',
                                       borderRadius: 1.5,
                                       px: 1.5,
                                       '&:hover': { opacity: 0.85 },
                                    }}
                                 >
                                    Ver
                                 </Button>

                                 <Button
                                    onClick={() => handleEdit(pat)}
                                    sx={{
                                       background: '#f39c12',
                                       color: 'white',
                                       textTransform: 'none',
                                       borderRadius: 1.5,
                                       px: 1.5,
                                       '&:hover': { opacity: 0.85 },
                                    }}
                                 >
                                    Editar
                                 </Button>

                                 <Button
                                    onClick={() => handleDeleteConfirm(pat)}
                                    sx={{
                                       background: '#e74c3c',
                                       color: 'white',
                                       textTransform: 'none',
                                       borderRadius: 1.5,
                                       px: 1.5,
                                       '&:hover': { opacity: 0.85 },
                                    }}
                                 >
                                    Eliminar
                                 </Button>
                              </Stack>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </Paper>
         ) : (
            <Typography sx={{ mt: 2 }}>No hay pacientes registrados.</Typography>
         )}
      </Box>
   );
}
