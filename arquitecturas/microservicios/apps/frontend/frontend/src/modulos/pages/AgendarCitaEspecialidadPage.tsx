import { useState, useEffect } from 'react';
import {
   Box,
   Button,
   Card,
   CardContent,
   Container,
   Grid,
   Typography,
   CircularProgress,
   Chip,
   Alert,
   Paper,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   TextField,
} from '@mui/material';
import {
   CalendarToday as CalendarIcon,
   AccessTime as TimeIcon,
   Person as PersonIcon,
   Add as AddIcon,
   NavigateBefore as NavigateBeforeIcon,
   NavigateNext as NavigateNextIcon,
   LocalHospital as SpecialtyIcon,
   AssignmentTurnedIn as OrderIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { timeSlotsService, appointmentsService } from '../../services';
import { ITimeSlot } from '../../interface';
import { getTimeSlotDoctorFullName } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { BackButton } from '../../components';
import Swal from 'sweetalert2';

interface LocationState {
   ordenId?: number;
   especialidadNombre?: string;
}

export const AgendarCitaEspecialidadPage = () => {
   const { especialidadId } = useParams<{ especialidadId: string }>();
   const navigate = useNavigate();
   const location = useLocation();
   const { user } = useAuth();

   const state = location.state as LocationState;
   const ordenId = state?.ordenId;
   const especialidadNombre = state?.especialidadNombre;

   const [slots, setSlots] = useState<ITimeSlot[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // Paginación
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [totalItems, setTotalItems] = useState(0);
   const [itemsPerPage] = useState(12);

   // Dialog para agendar
   const [openDialog, setOpenDialog] = useState(false);
   const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | null>(null);
   const [motivo, setMotivo] = useState('');
   const [creatingAppointment, setCreatingAppointment] = useState(false);

   const pacienteId = user?.idPaciente || 1;

   useEffect(() => {
      if (especialidadId) {
         loadAvailableSlots();
      }
   }, [especialidadId, currentPage]);

   const loadAvailableSlots = async () => {
      try {
         setLoading(true);
         setError(null);
         
         console.log('Cargando horarios para especialidad:', especialidadId);
         
         const data = await timeSlotsService.getBySpecialty(
            Number(especialidadId),
            currentPage,
            itemsPerPage
         );
         
         console.log('Datos recibidos del servicio:', data);
         console.log('Número de slots:', data.franjasHorarias?.length);
         
         if (data.franjasHorarias && data.franjasHorarias.length > 0) {
            console.log('Primer slot:', data.franjasHorarias[0]);
            console.log('Doctor del primer slot:', data.franjasHorarias[0].Doctor);
         }
         
         setSlots(data.franjasHorarias || []);
         setTotalPages(data.totalPages || 1);
         setTotalItems(data.totalItems || 0);
         setCurrentPage(data.currentPage || 1);
      } catch (err) {
         console.error('Error al cargar horarios:', err);
         setError('Error al cargar horarios disponibles');
      } finally {
         setLoading(false);
      }
   };

   const handleOpenDialog = (slot: ITimeSlot) => {
      setSelectedSlot(slot);
      setOpenDialog(true);
   };

   const handleCloseDialog = () => {
      setOpenDialog(false);
      setSelectedSlot(null);
      setMotivo('');
   };

   const handleAgendarCita = async () => {
      if (!selectedSlot || !especialidadId) return;

      console.log('Datos del slot seleccionado:', selectedSlot);
      console.log('ID Especialidad:', especialidadId);
      console.log('ID Doctor del slot:', selectedSlot.idDoctor);
      console.log('Especialidad del doctor:', selectedSlot.Doctor?.especialidad);
      console.log('Specialty del doctor:', selectedSlot.Doctor?.Specialty);

      try {
         setCreatingAppointment(true);
         
         const payload = {
            tipoCita: 'ESPECIALIDAD',
            estado: 'programada',
            idPaciente: pacienteId,
            idDoctor: selectedSlot.idDoctor,
            idHorario: selectedSlot.id,
            creadoPor: user?.id || pacienteId,
            actualizadoPor: user?.id || pacienteId,
         };

         console.log('Payload que se enviará:', payload);
         
         const response = await appointmentsService.createAppointmentBySpecialty(
            Number(especialidadId),
            payload,
            {
               motivo: motivo || 'Consulta de especialidad',
            }
         );

         // Cerrar el modal primero
         handleCloseDialog();
         setCreatingAppointment(false);

         // Luego mostrar el mensaje de éxito
         if (response) {
            await Swal.fire({
               title: '¡Éxito!',
               text: 'Cita con especialista agendada exitosamente',
               icon: 'success',
               confirmButtonText: 'Aceptar',
            });
            navigate('/mis-citas');
         }
      } catch (err: any) {
         setCreatingAppointment(false);
         handleCloseDialog();
         
         console.error('Error al agendar cita:', err);
         console.error('Respuesta del error:', err.response?.data);
         
         await Swal.fire({
            title: 'Error',
            text: err.response?.data?.message || 'No se pudo agendar la cita',
            icon: 'error',
            confirmButtonText: 'Aceptar',
         });
      }
   };

   const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
         setCurrentPage(newPage);
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }
   };

   if (loading) {
      return (
         <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress size={60} />
         </Box>
      );
   }

   return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
         {/* Header */}
         <Box mb={2}>
            <BackButton to="/mis-ordenes" />
         </Box>
         <Box mb={4}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
               Agendar Cita de Especialidad
            </Typography>
            <Typography variant="body1" color="text.secondary">
               Selecciona un horario disponible con un especialista en {especialidadNombre}
            </Typography>
         </Box>

         {/* Info de Orden */}
         {ordenId && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light' }}>
               <Box display="flex" alignItems="center" gap={2}>
                  <OrderIcon sx={{ fontSize: 40 }} />
                  <Box>
                     <Typography variant="h6" fontWeight="bold">
                        Orden Médica #{ordenId}
                     </Typography>
                     <Typography variant="body2">
                        Esta cita se agendará para cumplir con la orden médica
                     </Typography>
                  </Box>
               </Box>
            </Paper>
         )}

         {/* Alerts */}
         {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
               {error}
            </Alert>
         )}

         {/* Resultados */}
         <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
               Mostrando {slots.length} de {totalItems} horarios disponibles (Página {currentPage} de {totalPages})
            </Typography>
         </Box>

         {/* Grid de Horarios */}
         <Grid container spacing={2}>
            {slots.map((slot) => (
               <Grid item xs={12} sm={6} md={4} key={slot.id}>
                  <Card
                     elevation={2}
                     sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.2s',
                        '&:hover': {
                           transform: 'translateY(-4px)',
                           boxShadow: 4,
                        },
                     }}
                  >
                     <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                           <PersonIcon color="primary" />
                           <Typography variant="subtitle1" fontWeight="bold">
                              {getTimeSlotDoctorFullName(slot)}
                           </Typography>
                        </Box>

                        {slot.Doctor?.Specialty && (
                           <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <SpecialtyIcon fontSize="small" color="secondary" />
                              <Typography variant="body2" color="secondary.main" fontWeight="medium">
                                 {slot.Doctor.Specialty.nombre}
                              </Typography>
                           </Box>
                        )}

                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                           <CalendarIcon fontSize="small" color="action" />
                           <Typography variant="body2" color="text.secondary">
                              {new Date(slot.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                                 weekday: 'short',
                                 day: 'numeric',
                                 month: 'short',
                              })}
                           </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                           <TimeIcon fontSize="small" color="action" />
                           <Typography variant="body2" color="text.secondary">
                              {slot.horaInicio} - {slot.horaFin}
                           </Typography>
                        </Box>

                        <Chip
                           label="Disponible"
                           color="success"
                           size="small"
                           sx={{ mb: 2 }}
                        />

                        <Button
                           fullWidth
                           variant="contained"
                           startIcon={<AddIcon />}
                           onClick={() => handleOpenDialog(slot)}
                        >
                           Agendar Cita
                        </Button>
                     </CardContent>
                  </Card>
               </Grid>
            ))}
         </Grid>

         {/* Empty State */}
         {slots.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
               <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
               <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay horarios disponibles
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  No se encontraron horarios disponibles para esta especialidad
               </Typography>
            </Paper>
         )}

         {/* Paginación */}
         {totalPages > 1 && (
            <Paper sx={{ p: 2, mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
               <Button
                  variant="outlined"
                  startIcon={<NavigateBeforeIcon />}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
               >
                  Anterior
               </Button>
               
               <Typography variant="body2">
                  Página {currentPage} de {totalPages}
               </Typography>

               <Button
                  variant="outlined"
                  endIcon={<NavigateNextIcon />}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
               >
                  Siguiente
               </Button>
            </Paper>
         )}

         {/* Dialog Agendar Cita */}
         <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Confirmar Cita con Especialista</DialogTitle>
            <DialogContent>
               {selectedSlot && (
                  <Box sx={{ pt: 2 }}>
                     <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                           {getTimeSlotDoctorFullName(selectedSlot)}
                        </Typography>
                        {selectedSlot.Doctor?.Specialty && (
                           <Typography variant="body2" fontWeight="medium" color="secondary.main">
                              Especialidad: {selectedSlot.Doctor.Specialty.nombre}
                           </Typography>
                        )}
                        <Typography variant="body2">
                           {new Date(selectedSlot.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                           })}
                        </Typography>
                        <Typography variant="body2">
                           Hora: {selectedSlot.horaInicio} - {selectedSlot.horaFin}
                        </Typography>
                     </Alert>

                     {ordenId && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                           <Typography variant="body2">
                              Esta cita se asociará a la Orden Médica #{ordenId}
                           </Typography>
                        </Alert>
                     )}

                     <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Motivo de la consulta"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Describe brevemente el motivo de tu consulta..."
                        helperText="Esto ayudará al especialista a preparar mejor tu cita"
                     />
                  </Box>
               )}
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseDialog} disabled={creatingAppointment}>
                  Cancelar
               </Button>
               <Button
                  onClick={handleAgendarCita}
                  variant="contained"
                  disabled={creatingAppointment}
               >
                  {creatingAppointment ? 'Agendando...' : 'Confirmar Cita'}
               </Button>
            </DialogActions>
         </Dialog>
      </Container>
   );
};

export default AgendarCitaEspecialidadPage;
