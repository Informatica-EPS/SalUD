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

function TabPanel(props: Readonly<TabPanelProps>) {
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

   const hoy = new Date().toISOString().split('T')[0];
   const fechaInvalida = fecha && fecha < hoy;
   const horaInvalida = horaInicio && horaFin && horaInicio >= horaFin;

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
      if (fechaInvalida) {
         setSuccess('La fecha no puede ser anterior a hoy');
         return;
      }

      if (horaInvalida) {
         setSuccess('La hora inicio no puede ser mayor o igual a la hora fin');
         return;
      }

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
      if (globalThis.confirm('¿Está seguro de eliminar este horario?')) {
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
   const sortedDates = Object.keys(groupedAvailable).sort((a, b) => a.localeCompare(b));
   const sortedAllDates = Object.keys(groupedAll).sort((a, b) => a.localeCompare(b));

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
               <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
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
               <Paper
                  sx={{
                     p: 2,
                     borderRadius: 3,
                     textAlign: 'center',
                     background: 'linear-gradient(135deg, rgba(76,175,80,0.15), #ffffff)',
                     boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                     transition: 'all 0.3s ease',
                     '&:hover': {
                     boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                     },
                  }}
               >
                  <Typography variant="h4" fontWeight="bold">
                     {Array.isArray(availableSlots) ? availableSlots.length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Disponibles
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
               <Paper
                  sx={{
                     p: 2,
                     borderRadius: 3,
                     textAlign: 'center',
                     background: 'linear-gradient(135deg, rgba(33,150,243,0.15), #ffffff)',
                     boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                     transition: 'all 0.3s ease',
                     '&:hover': {
                     boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                     },
                  }}
               >
                  <Typography variant="h4" fontWeight="bold">
                     {Array.isArray(allSlots) ? allSlots.filter((s) => s.estado === 'programado').length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Programados
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
               <Paper
                  sx={{
                     p: 2,
                     borderRadius: 3,
                     textAlign: 'center',
                     background: 'linear-gradient(135deg, rgba(158,158,158,0.15), #ffffff)',
                     boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                     transition: 'all 0.3s ease',
                     '&:hover': {
                     boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                     },
                  }}
               >                  
                  <Typography variant="h4" fontWeight="bold">
                     {Array.isArray(allSlots) ? allSlots.filter((s) => s.estado === 'completado').length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Completados
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
               <Paper
                  sx={{
                     p: 2,
                     borderRadius: 3,
                     textAlign: 'center',
                     background: 'linear-gradient(135deg, rgba(0,0,0,0.08), #ffffff)',
                     boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                     transition: 'all 0.3s ease',
                     '&:hover': {
                     boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                     },
                  }}
               >
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
         <Paper
   sx={{
      mb: 3,
      borderRadius: 3,
      p: 1,
      background: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(6px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
   }}
>
   <Tabs
      value={tabValue}
      onChange={(_e, newValue) => setTabValue(newValue)}
      variant="fullWidth"
      textColor="inherit"
      sx={{
         '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #0e8f9a, #1aa3a8)',
         },
      }}
   >
      <Tab
         icon={<AvailableIcon />}
         label="Disponibles"
         iconPosition="start"
         sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            '&.Mui-selected': {
               color: '#2e7d32',
               background: 'rgba(46,125,50,0.1)',
            },
         }}
      />

      <Tab
         icon={<CalendarIcon />}
         label="Todos los Horarios"
         iconPosition="start"
         sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            '&.Mui-selected': {
               color: '#1976d2',
               background: 'rgba(25,118,210,0.1)',
            },
         }}
      />
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
                        min: hoy,
                     }}
                     error={!!fechaInvalida}
                     helperText={
                        fechaInvalida
                           ? 'No puede ser menor a hoy'
                           : ''
                     }
                  />
                  <TextField
                     fullWidth
                     type="time"
                     label="Hora Inicio"
                     value={horaInicio}
                     onChange={(e) => setHoraInicio(e.target.value)}
                     InputLabelProps={{ shrink: true }}
                     error={!!horaInvalida}
                  />
                  <TextField
                     fullWidth
                     type="time"
                     label="Hora Fin"
                     value={horaFin}
                     onChange={(e) => setHoraFin(e.target.value)}
                     InputLabelProps={{ shrink: true }}
                     error={!!horaInvalida}
                     helperText={
                        horaInvalida
                           ? 'La hora fin debe ser mayor que la hora inicio'
                           : ''
                     }
                  />
                  {(fechaInvalida || horaInvalida) && (
                     <Alert severity="warning">
                        {fechaInvalida && 'La fecha no puede ser anterior a hoy'}
                        {horaInvalida && 'La hora inicio debe ser menor que la hora fin'}
                     </Alert>
                  )}

                  {!fechaInvalida && !horaInvalida && (
                     <Alert severity="info">
                        Este horario quedará disponible para que los pacientes puedan agendar citas
                     </Alert>
                  )}
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
