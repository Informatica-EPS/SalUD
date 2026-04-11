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
   FormControl,
   InputLabel,
   Select,
   MenuItem,
   Chip,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   TextField,
   Alert,
   Paper,
} from '@mui/material';
import {
   CalendarToday as CalendarIcon,
   AccessTime as TimeIcon,
   Person as PersonIcon,
   Add as AddIcon,
   NavigateBefore as NavigateBeforeIcon,
   NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useDoctors, useCreateAppointment } from '../../hooks';
import { timeSlotsService } from '../../services';
import { ITimeSlot } from '../../interface';
import { getTimeSlotDoctorFullName, getDoctorFullName } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { BackButton } from '../../components';

export const CitasDisponiblesPage = () => {
   const { user } = useAuth();
   const { doctors, loading: loadingDoctors } = useDoctors();
   const { createAppointment, loading: creatingAppointment } = useCreateAppointment();

   const [slots, setSlots] = useState<ITimeSlot[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);

   // Paginación
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [totalItems, setTotalItems] = useState(0);
   const [itemsPerPage, setItemsPerPage] = useState(10);

   // Filtros
   const [selectedDoctor, setSelectedDoctor] = useState<string>('todos');
   const [selectedDate, setSelectedDate] = useState<string>('todas');

   // Dialog para agendar
   const [openDialog, setOpenDialog] = useState(false);
   const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | null>(null);
   const [motivo, setMotivo] = useState('');
   const [tipoCita, setTipoCita] = useState('MEDICINA_GENERAL');

   const pacienteId = user?.idPaciente || 1;

   // Cargar cuando cambian los filtros o la página
   useEffect(() => {
      loadAvailableSlots();
   }, [currentPage, itemsPerPage, selectedDoctor, selectedDate]);

   const loadAvailableSlots = async () => {
      try {
         setLoading(true);
         setError(null);
         
         // Si hay filtro de doctor específico, usar endpoint especializado
         if (selectedDoctor !== 'todos') {
            const data = await timeSlotsService.getAvailableByDoctor(
               parseInt(selectedDoctor)
            );
            // Aplicar filtro de fecha si existe
            let filteredData = data;
            if (selectedDate !== 'todas') {
               filteredData = data.filter(slot => slot.fecha === selectedDate);
            }
            setSlots(filteredData);
            setTotalPages(1);
            setTotalItems(filteredData.length);
            setCurrentPage(1);
         } else {
            // Cargar todos los horarios con paginación
            const data = await timeSlotsService.getAvailable(currentPage, itemsPerPage);
            
            // Aplicar filtro de fecha si existe
            let finalSlots = data.franjasHorarias;
            if (selectedDate !== 'todas') {
               finalSlots = data.franjasHorarias.filter(slot => slot.fecha === selectedDate);
            }
            
            setSlots(finalSlots);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);
            setCurrentPage(data.currentPage);
         }
      } catch (err) {
         setError('Error al cargar horarios disponibles');
         console.error('Error:', err);
      } finally {
         setLoading(false);
      }
   };

   // Obtener fechas únicas de todos los slots cargados
   const uniqueDates = Array.from(new Set((slots || []).map((slot) => slot.fecha))).sort();

   const handleFilterChange = (filterType: 'doctor' | 'date', value: string) => {
      if (filterType === 'doctor') {
         setSelectedDoctor(value);
      } else {
         setSelectedDate(value);
      }
      setCurrentPage(1); // Resetear a página 1 cuando cambian filtros
   };

   const handleOpenDialog = (slot: ITimeSlot) => {
      setSelectedSlot(slot);
      setOpenDialog(true);
   };

   const handleCloseDialog = () => {
      setOpenDialog(false);
      setSelectedSlot(null);
      setMotivo('');
      setTipoCita('MEDICINA_GENERAL');
   };

   const handleAgendarCita = async () => {
      if (!selectedSlot) return;

      const result = await createAppointment(
         {
            tipoCita,
            estado: 'programada',
            idPaciente: pacienteId,
            idDoctor: selectedSlot.idDoctor,
            idHorario: selectedSlot.id,
            creadoPor: pacienteId,
            actualizadoPor: pacienteId,
         },
         {
            motivo: motivo || 'Consulta general',
         }
      );

      if (result.success) {
         setSuccess('¡Cita agendada exitosamente!');
         handleCloseDialog();
         await loadAvailableSlots();
         setTimeout(() => setSuccess(null), 3000);
      } else {
         setError('Error al agendar la cita');
      }
   };

   // Obtener todas las fechas disponibles (necesitamos cargar todas para el filtro)
   const [allDates, setAllDates] = useState<string[]>([]);
   
   useEffect(() => {
      loadAllDates();
   }, []);

   const loadAllDates = async () => {
      try {
         // Cargar una gran cantidad para obtener todas las fechas únicas
         const data = await timeSlotsService.getAvailable(1, 1000);
         const dates = Array.from(new Set(data.franjasHorarias.map(slot => slot.fecha))).sort();
         setAllDates(dates);
      } catch (err) {
         console.error('Error al cargar fechas:', err);
      }
   };

   const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
         setCurrentPage(newPage);
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }
   };

   if (loading || loadingDoctors) {
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
            <BackButton to="/home" />
         </Box>
         <Box mb={4}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
               Horarios Disponibles
            </Typography>
            <Typography variant="body1" color="text.secondary">
               Agenda tu cita médica en el horario que prefieras
            </Typography>
         </Box>

         {/* Alerts */}
         {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
               {error}
            </Alert>
         )}
         {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
               {success}
            </Alert>
         )}

         {/* Filtros */}
         <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
               <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                     <InputLabel>Doctor</InputLabel>
                     <Select
                        value={selectedDoctor}
                        label="Doctor"
                        onChange={(e) => handleFilterChange('doctor', e.target.value)}
                     >
                        <MenuItem value="todos">Todos los doctores</MenuItem>
                        {doctors.map((doctor) => (
                           <MenuItem key={doctor.id} value={doctor.id.toString()}>
                              {getDoctorFullName(doctor)}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </Grid>
               <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                     <InputLabel>Fecha</InputLabel>
                     <Select
                        value={selectedDate}
                        label="Fecha"
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                     >
                        <MenuItem value="todas">Todas las fechas</MenuItem>
                        {allDates.map((date) => (
                           <MenuItem key={date} value={date}>
                              {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                                 weekday: 'long',
                                 year: 'numeric',
                                 month: 'long',
                                 day: 'numeric',
                              })}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </Grid>
               <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                     <InputLabel>Resultados por página</InputLabel>
                     <Select
                        value={itemsPerPage}
                        label="Resultados por página"
                        onChange={(e) => {
                           setItemsPerPage(Number(e.target.value));
                           setCurrentPage(1);
                        }}
                     >
                        <MenuItem value={10}>10 resultados</MenuItem>
                        <MenuItem value={20}>20 resultados</MenuItem>
                        <MenuItem value={50}>50 resultados</MenuItem>
                        <MenuItem value={100}>100 resultados</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>
            </Grid>
         </Paper>

         {/* Resultados */}
         <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
               {selectedDoctor !== 'todos' || selectedDate !== 'todas' 
                  ? `Mostrando ${(slots || []).length} resultados filtrados`
                  : `Mostrando ${(slots || []).length} de ${totalItems} horarios disponibles (Página ${currentPage} de ${totalPages})`
               }
            </Typography>
         </Box>

         {/* Grid de Horarios */}
         <Grid container spacing={2}>
            {(slots || []).map((slot) => (
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
         {(slots || []).length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
               <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
               <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay horarios disponibles
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Intenta con otros filtros o revisa más tarde
               </Typography>
            </Paper>
         )}

         {/* Controles de Paginación - Solo mostrar si NO hay filtros activos */}
         {totalPages > 1 && selectedDoctor === 'todos' && selectedDate === 'todas' && (
            <Paper sx={{ p: 2, mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
               <Button
                  variant="outlined"
                  startIcon={<NavigateBeforeIcon />}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
               >
                  Anterior
               </Button>
               
               <Box display="flex" alignItems="center" gap={1}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                     let pageNum;
                     if (totalPages <= 5) {
                        pageNum = i + 1;
                     } else if (currentPage <= 3) {
                        pageNum = i + 1;
                     } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                     } else {
                        pageNum = currentPage - 2 + i;
                     }
                     
                     return (
                        <Button
                           key={pageNum}
                           variant={currentPage === pageNum ? 'contained' : 'outlined'}
                           onClick={() => handlePageChange(pageNum)}
                           disabled={loading}
                           sx={{ minWidth: '40px' }}
                        >
                           {pageNum}
                        </Button>
                     );
                  })}
               </Box>

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
            <DialogTitle>Agendar Nueva Cita</DialogTitle>
            <DialogContent>
               {selectedSlot && (
                  <Box sx={{ pt: 2 }}>
                     <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                           {getTimeSlotDoctorFullName(selectedSlot)}
                        </Typography>
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

                     <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Tipo de Cita</InputLabel>
                        <Select
                           value={tipoCita}
                           label="Tipo de Cita"
                           onChange={(e) => setTipoCita(e.target.value)}
                        >
                           <MenuItem value="MEDICINA_GENERAL">Medicina General</MenuItem>
                           <MenuItem value="CONTROL">Control</MenuItem>
                           <MenuItem value="URGENCIA">Urgencia</MenuItem>
                           <MenuItem value="ESPECIALIDAD">Especialidad</MenuItem>
                        </Select>
                     </FormControl>

                     <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Motivo de la consulta"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Describe brevemente el motivo de tu consulta..."
                        helperText="Esto ayudará al médico a preparar mejor tu cita"
                     />
                  </Box>
               )}
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseDialog}>Cancelar</Button>
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

export default CitasDisponiblesPage;
