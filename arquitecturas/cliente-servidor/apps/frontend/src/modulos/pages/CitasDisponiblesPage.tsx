import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { useDoctors, useCreateAppointment } from '../../hooks';
import { timeSlotsService } from '../../services';
import { ITimeSlot } from '../../interface';

export const CitasDisponiblesPage = () => {
   const { doctors, loading: loadingDoctors } = useDoctors();
   const { createAppointment, loading: creatingAppointment } = useCreateAppointment();

   const [slots, setSlots] = useState<ITimeSlot[]>([]);
   const [filteredSlots, setFilteredSlots] = useState<ITimeSlot[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);

   // Filtros
   const [selectedDoctor, setSelectedDoctor] = useState<string>('todos');
   const [selectedDate, setSelectedDate] = useState<string>('todas');

   // Dialog para agendar
   const [openDialog, setOpenDialog] = useState(false);
   const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | null>(null);
   const [motivo, setMotivo] = useState('');
   const [tipoCita, setTipoCita] = useState('MEDICINA_GENERAL');

   const pacienteId = 1; // TODO: Obtener del contexto de autenticación

   useEffect(() => {
      loadAvailableSlots();
   }, []);

   useEffect(() => {
      applyFilters();
   }, [selectedDoctor, selectedDate, slots]);

   const loadAvailableSlots = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await timeSlotsService.getAvailable();
         setSlots(data);
      } catch (err) {
         setError('Error al cargar horarios disponibles');
         console.error('Error:', err);
      } finally {
         setLoading(false);
      }
   };

   const applyFilters = () => {
      let filtered = slots || [];

      if (selectedDoctor !== 'todos') {
         filtered = filtered.filter(
            (slot) => slot.idDoctor === parseInt(selectedDoctor)
         );
      }

      if (selectedDate !== 'todas') {
         filtered = filtered.filter((slot) => slot.fecha === selectedDate);
      }

      setFilteredSlots(filtered);
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

   // Obtener fechas únicas (con validación)
   const uniqueDates = Array.from(new Set((slots || []).map((slot) => slot.fecha))).sort();

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
               <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                     <InputLabel>Doctor</InputLabel>
                     <Select
                        value={selectedDoctor}
                        label="Doctor"
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                     >
                        <MenuItem value="todos">Todos los doctores</MenuItem>
                        {doctors.map((doctor) => (
                           <MenuItem key={doctor.id} value={doctor.id.toString()}>
                              Dr. {doctor.usuario?.primerNombre} {doctor.usuario?.primerApellido}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </Grid>
               <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                     <InputLabel>Fecha</InputLabel>
                     <Select
                        value={selectedDate}
                        label="Fecha"
                        onChange={(e) => setSelectedDate(e.target.value)}
                     >
                        <MenuItem value="todas">Todas las fechas</MenuItem>
                        {uniqueDates.map((date) => (
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
            </Grid>
         </Paper>

         {/* Resultados */}
         <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
               {(filteredSlots || []).length} horarios disponibles
            </Typography>
         </Box>

         {/* Grid de Horarios */}
         <Grid container spacing={2}>
            {(filteredSlots || []).map((slot) => (
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
                              Dr. {slot.doctor?.usuario?.primerNombre}{' '}
                              {slot.doctor?.usuario?.primerApellido}
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
         {(filteredSlots || []).length === 0 && (
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

         {/* Dialog Agendar Cita */}
         <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Agendar Nueva Cita</DialogTitle>
            <DialogContent>
               {selectedSlot && (
                  <Box sx={{ pt: 2 }}>
                     <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                           Dr. {selectedSlot.doctor?.usuario?.primerNombre}{' '}
                           {selectedSlot.doctor?.usuario?.primerApellido}
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
