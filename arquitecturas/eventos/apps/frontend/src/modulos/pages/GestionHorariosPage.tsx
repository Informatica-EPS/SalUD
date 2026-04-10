import React, { useState } from 'react';
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
   IconButton,
   Tabs,
   Tab,
} from '@mui/material';
import {
   Add as AddIcon,
   Delete as DeleteIcon,
   AccessTime as TimeIcon,
   CalendarToday as CalendarIcon,
   EventAvailable as AvailableIcon,
} from '@mui/icons-material';
import { useDoctorTimeSlots } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { BackButton } from '../../components';

interface TabPanelProps {
   children?: React.ReactNode;
   index: number;
   value: number;
}

function TabPanel(props: TabPanelProps) {
   const { children, value, index, ...other } = props;
   return (
      <div hidden={value !== index} {...other}>
         {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
      </div>
   );
}

export const GestionHorariosPage = () => {
   const { user } = useAuth();
   const doctorId = user?.idDoctor || 3; // Fallback temporal
   const {
      availableSlots,
      allSlots,
      loading,
      error,
      createTimeSlot,
      deleteTimeSlot,
      refetchAll,
   } = useDoctorTimeSlots(doctorId);

   const [tabValue, setTabValue] = useState(0);
   const [openDialog, setOpenDialog] = useState(false);
   const [success, setSuccess] = useState<string | null>(null);

   // Form state
   const [fecha, setFecha] = useState('');
   const [horaInicio, setHoraInicio] = useState('08:00');
   const [horaFin, setHoraFin] = useState('08:30');

   React.useEffect(() => {
      if (tabValue === 1) {
         refetchAll(100);
      }
   }, [tabValue]);

   const handleOpenDialog = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFecha(tomorrow.toISOString().split('T')[0]);
      setOpenDialog(true);
   };

   const handleCloseDialog = () => {
      setOpenDialog(false);
      setFecha('');
      setHoraInicio('08:00');
      setHoraFin('08:30');
   };

   const handleCrearHorario = async () => {
      const result = await createTimeSlot(fecha, horaInicio + ':00', horaFin + ':00');
      
      if (result.success) {
         setSuccess('Horario creado exitosamente');
         handleCloseDialog();
         setTimeout(() => setSuccess(null), 3000);
      } else {
         setSuccess('Error al crear horario');
      }
   };

   const handleEliminar = async (slotId: number) => {
      if (window.confirm('¿Está seguro de eliminar este horario?')) {
         const result = await deleteTimeSlot(slotId);
         
         if (result.success) {
            setSuccess('Horario eliminado exitosamente');
            setTimeout(() => setSuccess(null), 3000);
         }
      }
   };

   const getStatusColor = (estado: string) => {
      switch (estado) {
         case 'disponible':
            return 'success';
         case 'programado':
            return 'primary';
         case 'completado':
            return 'default';
         case 'cancelado':
            return 'error';
         default:
            return 'default';
      }
   };

   const groupSlotsByDate = (slots: typeof availableSlots) => {
      const grouped: { [key: string]: typeof availableSlots } = {};
      
      // Asegurarse de que slots es un array
      const slotsArray = Array.isArray(slots) ? slots : [];
      
      slotsArray.forEach((slot) => {
         if (!grouped[slot.fecha]) {
            grouped[slot.fecha] = [];
         }
         grouped[slot.fecha].push(slot);
      });
      return grouped;
   };

   if (loading) {
      return (
         <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress size={60} />
         </Box>
      );
   }

   const groupedAvailable = groupSlotsByDate(availableSlots);
   const groupedAll = groupSlotsByDate(allSlots);
   const sortedDates = Object.keys(groupedAvailable).sort();
   const sortedAllDates = Object.keys(groupedAll).sort();

   return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
         {/* Header */}
         <Box mb={2}>
            <BackButton to="/home" />
         </Box>
         <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
               <Typography variant="h4" gutterBottom fontWeight="bold">
                  Gestión de Horarios
               </Typography>
               <Typography variant="body1" color="text.secondary">
                  Administra tu disponibilidad médica
               </Typography>
            </Box>
            <Button
               variant="contained"
               startIcon={<AddIcon />}
               onClick={handleOpenDialog}
               size="large"
            >
               Nuevo Horario
            </Button>
         </Box>

         {/* Alerts */}
         {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
               {error}
            </Alert>
         )}
         {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
               {success}
            </Alert>
         )}

         {/* Estadísticas */}
         <Grid container spacing={2} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
               <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                  <Typography variant="h4" fontWeight="bold">
                     {Array.isArray(availableSlots) ? availableSlots.length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Disponibles
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
               <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                  <Typography variant="h4" fontWeight="bold">
                     {Array.isArray(allSlots) ? allSlots.filter((s) => s.estado === 'programado').length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Programados
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
               <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.200' }}>
                  <Typography variant="h4" fontWeight="bold">
                     {Array.isArray(allSlots) ? allSlots.filter((s) => s.estado === 'completado').length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Completados
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
               <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.300' }}>
                  <Typography variant="h4" fontWeight="bold">
                     {Array.isArray(allSlots) ? allSlots.length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Total
                  </Typography>
               </Paper>
            </Grid>
         </Grid>

         {/* Tabs */}
         <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
               <Tab icon={<AvailableIcon />} label="Disponibles" iconPosition="start" />
               <Tab icon={<CalendarIcon />} label="Todos los Horarios" iconPosition="start" />
            </Tabs>
         </Paper>

         {/* Tab Panel: Disponibles */}
         <TabPanel value={tabValue} index={0}>
            {sortedDates.length === 0 ? (
               <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                     No hay horarios disponibles
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                     Crea nuevos horarios para que los pacientes puedan agendar citas
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
                     Crear Horario
                  </Button>
               </Paper>
            ) : (
               sortedDates.map((date) => (
                  <Box key={date} mb={4}>
                     <Typography variant="h6" gutterBottom fontWeight="bold">
                        {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                           weekday: 'long',
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric',
                        })}
                     </Typography>
                     <Grid container spacing={2}>
                        {groupedAvailable[date]
                           .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                           .map((slot) => (
                              <Grid item xs={12} sm={6} md={4} key={slot.id}>
                                 <Card variant="outlined">
                                    <CardContent>
                                       <Box
                                          display="flex"
                                          justifyContent="space-between"
                                          alignItems="start"
                                       >
                                          <Box>
                                             <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                <TimeIcon fontSize="small" color="action" />
                                                <Typography variant="h6">
                                                   {slot.horaInicio.substring(0, 5)} -{' '}
                                                   {slot.horaFin.substring(0, 5)}
                                                </Typography>
                                             </Box>
                                             <Chip
                                                label={slot.estado}
                                                color={getStatusColor(slot.estado)}
                                                size="small"
                                             />
                                          </Box>
                                          <IconButton
                                             size="small"
                                             color="error"
                                             onClick={() => handleEliminar(slot.id)}
                                          >
                                             <DeleteIcon />
                                          </IconButton>
                                       </Box>
                                    </CardContent>
                                 </Card>
                              </Grid>
                           ))}
                     </Grid>
                  </Box>
               ))
            )}
         </TabPanel>

         {/* Tab Panel: Todos */}
         <TabPanel value={tabValue} index={1}>
            {sortedAllDates.length === 0 ? (
               <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                     No hay horarios registrados
                  </Typography>
               </Paper>
            ) : (
               sortedAllDates.map((date) => (
                  <Box key={date} mb={4}>
                     <Typography variant="h6" gutterBottom fontWeight="bold">
                        {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                           weekday: 'long',
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric',
                        })}
                     </Typography>
                     <Grid container spacing={2}>
                        {groupedAll[date]
                           .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                           .map((slot) => (
                              <Grid item xs={12} sm={6} md={4} key={slot.id}>
                                 <Card variant="outlined">
                                    <CardContent>
                                       <Box display="flex" alignItems="center" gap={1} mb={1}>
                                          <TimeIcon fontSize="small" color="action" />
                                          <Typography variant="subtitle1">
                                             {slot.horaInicio.substring(0, 5)} -{' '}
                                             {slot.horaFin.substring(0, 5)}
                                          </Typography>
                                       </Box>
                                       <Chip
                                          label={slot.estado}
                                          color={getStatusColor(slot.estado)}
                                          size="small"
                                       />
                                    </CardContent>
                                 </Card>
                              </Grid>
                           ))}
                     </Grid>
                  </Box>
               ))
            )}
         </TabPanel>

         {/* Dialog Crear Horario */}
         <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Nuevo Horario</DialogTitle>
            <DialogContent>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField
                     fullWidth
                     type="date"
                     label="Fecha"
                     value={fecha}
                     onChange={(e) => setFecha(e.target.value)}
                     InputLabelProps={{ shrink: true }}
                     inputProps={{
                        min: new Date().toISOString().split('T')[0],
                     }}
                  />
                  <TextField
                     fullWidth
                     type="time"
                     label="Hora Inicio"
                     value={horaInicio}
                     onChange={(e) => setHoraInicio(e.target.value)}
                     InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                     fullWidth
                     type="time"
                     label="Hora Fin"
                     value={horaFin}
                     onChange={(e) => setHoraFin(e.target.value)}
                     InputLabelProps={{ shrink: true }}
                  />
                  <Alert severity="info">
                     Este horario quedará disponible para que los pacientes puedan agendar citas
                  </Alert>
               </Box>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseDialog}>Cancelar</Button>
               <Button onClick={handleCrearHorario} variant="contained">
                  Crear Horario
               </Button>
            </DialogActions>
         </Dialog>
      </Container>
   );
};

export default GestionHorariosPage;
