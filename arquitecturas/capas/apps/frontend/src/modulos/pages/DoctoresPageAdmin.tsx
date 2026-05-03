import { useEffect, useState } from 'react';
import { api } from '../../services/apiClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../../components';

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
   Dialog,
   DialogTitle,
   DialogContent,
   DialogContentText,
   DialogActions,
} from '@mui/material';

export default function DoctorsPageAdmin() {
   const [doctors, setDoctors] = useState<any[]>([]);
   const navigate = useNavigate();
   const [openConfirm, setOpenConfirm] = useState(false);
   const [doctorToDelete, setDoctorToDelete] = useState<number | null>(null);

   useEffect(() => {
      const fetchDoctors = async () => {
         try {
            const res = await api.get('/doctors');
            setDoctors(Array.isArray(res) ? res : []);
         } catch (err) {
            console.error('Error cargando doctores:', err);
            setDoctors([]);
         }
      };
      fetchDoctors();
   }, []);

   const handleView = async (doc: any) => {
      try {
         const res = await api.get(`/doctors/${doc.id}`);
         const doctor = res;

         Swal.fire({
            title: 'Detalle Doctor',
            html: `
        <div style="text-align:left; font-size:14px; line-height:1.6;">
          <strong>Nombre:</strong> ${doctor.User?.primer_nombre || ''} ${doctor.User?.primer_apellido || ''}<br>
          <strong>Documento:</strong> ${doctor.User?.documento || ''}<br>
          <strong>Email:</strong> ${doctor.User?.email || ''}<br>
          <strong>Dirección:</strong> ${doctor.User?.direccion || ''}<br>
          <hr>
          <strong>Licencia Médica:</strong> ${doctor.licenciaMedica || ''}<br>
          <strong>Especialidad:</strong> ${doctor.especialidad || ''}
        </div>
      `,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#0e8f9a',
         });
      } catch (err) {
         Swal.fire('Error', 'No se pudo cargar el detalle del doctor', 'error');
      }
   };

   const handleCreateDoctor = async () => {
      const { value: formValues } = await Swal.fire({
         title: 'Registrar Doctor',
         html: `
      <input id="primer_nombre" class="swal2-input" placeholder="Primer Nombre">
      <input id="primer_apellido" class="swal2-input" placeholder="Primer Apellido">
      <input id="documento" class="swal2-input" placeholder="Documento">
      <input id="usuario" class="swal2-input" placeholder="Usuario">
      <input id="email" class="swal2-input" placeholder="Email">
      <input id="password" type="password" class="swal2-input" placeholder="Contraseña">
      <input id="licencia" class="swal2-input" placeholder="Licencia Médica">
      <input id="especialidad" class="swal2-input" placeholder="Especialidad">
    `,
         focusConfirm: false,
         preConfirm: () => {
            const licencia = (document.getElementById('licencia') as HTMLInputElement).value;
            if (!licencia) {
               Swal.showValidationMessage('La licencia médica es obligatoria');
               return null;
            }
            return {
               userData: {
                  primer_nombre: (document.getElementById('primer_nombre') as HTMLInputElement)
                     .value,
                  primer_apellido: (document.getElementById('primer_apellido') as HTMLInputElement)
                     .value,
                  documento: (document.getElementById('documento') as HTMLInputElement).value,
                  tipo_documento: 'CC',
                  usuario: (document.getElementById('usuario') as HTMLInputElement).value,
                  email: (document.getElementById('email') as HTMLInputElement).value,
                  password: (document.getElementById('password') as HTMLInputElement).value,
               },
               doctorData: {
                  licenciaMedica: licencia,
                  especialidad: (document.getElementById('especialidad') as HTMLInputElement).value,
               },
            };
         },
      });

      if (!formValues) return;

      try {
         await api.post('/doctors/register', formValues);
         const res = await api.get('/doctors');
         setDoctors(Array.isArray(res) ? res : []);
         Swal.fire('Éxito', 'Doctor creado correctamente', 'success');
      } catch {
         Swal.fire('Error', 'No se pudo crear el doctor', 'error');
      }
   };

   const handleEdit = async (doc: any) => {
      const { value: formValues } = await Swal.fire({
         title: 'Editar Doctor',
         html: `
        <input id="licencia" class="swal2-input" placeholder="Licencia Médica" value="${doc.licenciaMedica}">
        <input id="especialidad" class="swal2-input" placeholder="Especialidad" value="${doc.especialidad || ''}">
        <input id="nombre" class="swal2-input" placeholder="Primer Nombre" value="${doc.User?.primer_nombre || ''}">
        <input id="apellido" class="swal2-input" placeholder="Primer Apellido" value="${doc.User?.primer_apellido || ''}">
        <input id="email" class="swal2-input" placeholder="Email" value="${doc.User?.email || ''}">
        <input id="direccion" class="swal2-input" placeholder="Dirección" value="${doc.User?.direccion || ''}">
      `,
         focusConfirm: false,
         preConfirm: () => ({
            doctorData: {
               licenciaMedica: (document.getElementById('licencia') as HTMLInputElement).value,
               especialidad: (document.getElementById('especialidad') as HTMLInputElement).value,
            },
            userData: {
               primer_nombre: (document.getElementById('nombre') as HTMLInputElement).value,
               primer_apellido: (document.getElementById('apellido') as HTMLInputElement).value,
               email: (document.getElementById('email') as HTMLInputElement).value,
               direccion: (document.getElementById('direccion') as HTMLInputElement).value,
            },
         }),
      });

      if (!formValues) return;

      try {
         const res = await api.put(`/doctors/${doc.id}`, formValues);
         setDoctors(doctors.map(d => (d.id === doc.id ? res : d)));
         Swal.fire('Éxito', 'Doctor actualizado correctamente', 'success');
      } catch {
         Swal.fire('Error', 'No se pudo actualizar el doctor', 'error');
      }
   };

   const handleDeleteConfirm = async (doc: any) => {
      const result = await Swal.fire({
         html: `¿Está segur@ de eliminar al doctor <b>${doc.User?.primer_nombre} ${doc.User?.primer_apellido}</b>?`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#e74c3c',
         cancelButtonColor: '#6c757d',
         confirmButtonText: 'Sí, eliminar',
         cancelButtonText: 'Cancelar',
      });

      if (!result.isConfirmed) return;

      try {
         await api.delete(`/doctors/${doc.id}`);
         setDoctors(doctors.filter(d => d.id !== doc.id));

         Swal.fire({
            title: 'Eliminado',
            text: 'El doctor fue eliminado correctamente',
            icon: 'success',
            confirmButtonColor: '#0e8f9a',
         });
      } catch {
         Swal.fire('Error', 'No se pudo eliminar el doctor', 'error');
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
               Doctores Registrados
            </Typography>

            <Stack direction="row" spacing={2}>
               <Button
                  onClick={handleCreateDoctor}
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
                  ➕ Crear Doctor
               </Button>
            </Stack>
         </Box>

         {/* TABLE */}
         {doctors.length > 0 ? (
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
                           Licencia Médica
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                           Acciones
                        </TableCell>
                     </TableRow>
                  </TableHead>

                  <TableBody>
                     {doctors.map((doc, index) => (
                        <TableRow
                           key={doc.id}
                           sx={{
                              background: index % 2 === 0 ? '#fff' : '#f3f7f9',
                              '&:hover': { background: '#eaf3f5' },
                           }}
                        >
                           <TableCell align="center">{doc.id}</TableCell>

                           <TableCell align="center">
                              {doc.User
                                 ? `${doc.User.primer_nombre} ${doc.User.primer_apellido}`
                                 : ''}
                           </TableCell>

                           <TableCell align="center">{doc.licenciaMedica}</TableCell>

                           <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                 <Button
                                    onClick={() => handleView(doc)}
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
                                    onClick={() => handleEdit(doc)}
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
                                    onClick={() => handleDeleteConfirm(doc)}
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
            <Typography sx={{ mt: 2 }}>No hay doctores registrados.</Typography>
         )}
      </Box>
   );
}
