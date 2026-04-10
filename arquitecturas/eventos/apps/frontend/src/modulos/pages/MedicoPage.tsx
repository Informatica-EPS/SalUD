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
   Divider,
   Avatar,
   Accordion,
   AccordionSummary,
   AccordionDetails,
} from '@mui/material';
import {
   CalendarToday as CalendarIcon,
   AccessTime as TimeIcon,
   Check as CheckIcon,
   Edit as EditIcon,
   ExpandMore as ExpandMoreIcon,
   LocalHospital as HospitalIcon,
   Description as DescriptionIcon,
   Cancel as CancelIcon,
   AssignmentTurnedIn as OrderIcon,
} from '@mui/icons-material';
import { appointmentsService, appointmentDetailsService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { IAppointment, IAppointmentDetail } from '../../interface';
import { getPatientFullName } from '../../utils';
import { useNavigate } from 'react-router-dom';
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

export default function MedicoPage() {
   const navigate = useNavigate();
   const { user } = useAuth();
   const doctorId = user?.idDoctor || 3; // Fallback temporal

   const [appointments, setAppointments] = useState<IAppointment[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
   const [tabValue, setTabValue] = useState(0);

   // Dialog state
   const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
   const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null);
   const [existingDetail, setExistingDetail] = useState<IAppointmentDetail | null>(null);

   // Form state
   const [motivo, setMotivo] = useState('');
   const [antecedentes, setAntecedentes] = useState('');
   const [anamnesis, setAnamnesis] = useState('');
   const [revisionSistemas, setRevisionSistemas] = useState('');
   const [examenFisico, setExamenFisico] = useState('');
   const [diagnostico, setDiagnostico] = useState('');
   const [planManejo, setPlanManejo] = useState('');
   const [evolucion, setEvolucion] = useState('');

   useEffect(() => {
      loadAppointments();
   }, [doctorId]);

   const loadAppointments = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await appointmentsService.getByDoctor(doctorId);
         console.log('Citas recibidas:', data);
         
         // Manejar respuesta paginada o array directo
         let citasArray: IAppointment[] = [];
         if (data && typeof data === 'object' && 'citas' in data) {
            // Respuesta paginada
            citasArray = (data as any).citas || [];
         } else if (Array.isArray(data)) {
            // Array directo
            citasArray = data;
         }
         
         // Normalizar la estructura: mapear Patient -> paciente, TimeSlot -> horario, AppointmentDetail -> detalles
         const normalizedAppointments = citasArray.map((cita: any) => ({
            ...cita,
            paciente: cita.Patient || cita.paciente,
            horario: cita.TimeSlot || cita.horario,
            detalles: cita.AppointmentDetail || cita.detalles,
         }));
         
         setAppointments(normalizedAppointments);
      } catch (err) {
         setError('Error al cargar las citas');
         console.error('Error:', err);
         setAppointments([]);
      } finally {
         setLoading(false);
      }
   };

   const handleCrearOrden = (appointment: IAppointment) => {
      navigate('/crear-orden', {
         state: {
            citaId: appointment.id,
            pacienteNombre: getPatientFullName(appointment.paciente) || 'Paciente sin nombre',
            doctorNombre: user?.primerNombre + ' ' + user?.primerApellido || 'Doctor',
         },
      });
   };

   const handleIniciarCita = async (appointment: IAppointment) => {
      try {
         setLoading(true);
         await appointmentsService.start(appointment.id, doctorId);
         setSuccess('Cita iniciada exitosamente');
         await loadAppointments();
         setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
         setError('Error al iniciar la cita');
         console.error('Error:', err);
         setTimeout(() => setError(null), 3000);
      } finally {
         setLoading(false);
      }
   };

   const handleOpenDetailsDialog = async (appointment: IAppointment) => {
      setSelectedAppointment(appointment);

      // Intentar cargar detalles existentes
      try {
         const detail = await appointmentDetailsService.getByAppointmentId(appointment.id);
         setExistingDetail(detail);
         // Cargar datos existentes en el formulario
         setMotivo(detail.motivo || '');
         setAntecedentes(detail.antecedentes || '');
         setAnamnesis(detail.anamnesis || '');
         setRevisionSistemas(detail.revisionSistemas || '');
         setExamenFisico(detail.examenFisico || '');
         setDiagnostico(detail.diagnostico || '');
         setPlanManejo(detail.planManejo || '');
         setEvolucion(detail.evolucion || '');
      } catch (err) {
         // No hay detalles existentes, iniciar con formulario vacío
         setExistingDetail(null);
         resetForm();
      }

      setOpenDetailsDialog(true);
   };

   const handleCloseDetailsDialog = () => {
      setOpenDetailsDialog(false);
      setSelectedAppointment(null);
      setExistingDetail(null);
      resetForm();
   };

   const resetForm = () => {
      setMotivo('');
      setAntecedentes('');
      setAnamnesis('');
      setRevisionSistemas('');
      setExamenFisico('');
      setDiagnostico('');
      setPlanManejo('');
      setEvolucion('');
   };

   const handleSaveDetails = async () => {
      if (!selectedAppointment) return;

      try {
         const detailData = {
            motivo,
            antecedentes,
            anamnesis,
            revisionSistemas,
            examenFisico,
            diagnostico,
            planManejo,
            evolucion,
            idCita: selectedAppointment.id,
            creadoPor: doctorId,
            actualizadoPor: doctorId,
         };

         if (existingDetail) {
            // Actualizar detalle existente
            await appointmentDetailsService.update(existingDetail.id, detailData);
            setSuccess('Detalles actualizados exitosamente');
         } else {
            // Crear nuevo detalle
            await appointmentDetailsService.create(detailData);
            setSuccess('Detalles guardados exitosamente');
         }

         handleCloseDetailsDialog();
         loadAppointments();
         setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
         setError('Error al guardar los detalles');
         console.error('Error:', err);
         setTimeout(() => setError(null), 3000);
      }
   };

   const handleCompleteAppointment = async () => {
      if (!selectedAppointment) return;

      if (!diagnostico || !planManejo) {
         setError('Debe completar al menos el diagnóstico y plan de manejo');
         setTimeout(() => setError(null), 3000);
         return;
      }

      try {
         // Primero guardar los detalles
         const detailData = {
            motivo,
            antecedentes,
            anamnesis,
            revisionSistemas,
            examenFisico,
            diagnostico,
            planManejo,
            evolucion,
            idCita: selectedAppointment.id,
            creadoPor: doctorId,
            actualizadoPor: doctorId,
         };

         if (existingDetail) {
            await appointmentDetailsService.update(existingDetail.id, detailData);
         } else {
            await appointmentDetailsService.create(detailData);
         }

         // Intentar completar la cita
         try {
            // Si la cita está programada, primero iniciarla
            if (selectedAppointment.estado === 'programada') {
               await appointmentsService.start(selectedAppointment.id, doctorId);
            }
            
            // Ahora marcar como completada
            await appointmentsService.complete(selectedAppointment.id, {
               estado: 'completada',
               actualizadoPor: doctorId,
            } as any);
         } catch (completeError: any) {
            // Si falla porque no está en curso, actualizar directamente el estado
            if (completeError?.response?.data?.message?.includes('no está en curso') || 
                completeError?.message?.includes('no está en curso')) {
               console.log('Cita no está en curso, actualizando estado directamente...');
               await appointmentsService.update(selectedAppointment.id, {
                  estado: 'completada',
                  actualizadoPor: doctorId,
               } as any);
            } else {
               throw completeError;
            }
         }

         setSuccess('Cita completada exitosamente');
         handleCloseDetailsDialog();
         loadAppointments();
         setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
         setError('Error al completar la cita');
         console.error('Error:', err);
         setTimeout(() => setError(null), 3000);
      }
   };

   const getStatusColor = (estado: string) => {
      switch (estado) {
         case 'programada':
            return 'primary';
         case 'completada':
         case 'completado':
            return 'success';
         case 'cancelada':
         case 'cancelado':
            return 'error';
         case 'en_proceso':
            return 'warning';
         default:
            return 'default';
      }
   };

   const filterAppointments = (estados: string[]) => {
      return appointments.filter((apt) => estados.includes(apt.estado));
   };

   const programadas = filterAppointments(['programada']);
   const enProceso = filterAppointments(['en_proceso']);
   const completadas = filterAppointments(['completada', 'completado']);
   const canceladas = filterAppointments(['cancelada', 'cancelado']);

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
            <BackButton to="/home" />
         </Box>
         <Box mb={4}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
               👨‍⚕️ Panel de Doctor
            </Typography>
            <Typography variant="body1" color="text.secondary">
               Gestiona tus citas y pacientes
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

         {/* Estadísticas */}
         <Grid container spacing={2} mb={4}>
            <Grid item xs={6} sm={3}>
               <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                  <Typography variant="h4" fontWeight="bold">
                     {programadas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Programadas
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
               <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                  <Typography variant="h4" fontWeight="bold">
                     {enProceso.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     En Proceso
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
               <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                  <Typography variant="h4" fontWeight="bold">
                     {completadas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Completadas
                  </Typography>
               </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
               <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                  <Typography variant="h4" fontWeight="bold">
                     {canceladas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Canceladas
                  </Typography>
               </Paper>
            </Grid>
         </Grid>

         {/* Tabs */}
         <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
               <Tab icon={<CalendarIcon />} label="Programadas" iconPosition="start" />
               <Tab icon={<TimeIcon />} label="En Proceso" iconPosition="start" />
               <Tab icon={<CheckIcon />} label="Completadas" iconPosition="start" />
               <Tab icon={<CancelIcon />} label="Canceladas" iconPosition="start" />
            </Tabs>
         </Paper>

         {/* Tab: Programadas */}
         <TabPanel value={tabValue} index={0}>
            {programadas.length === 0 ? (
               <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                     No hay citas programadas
                  </Typography>
               </Paper>
            ) : (
               <Grid container spacing={3}>
                  {programadas.map((appointment) => (
                     <Grid item xs={12} md={6} key={appointment.id}>
                        <Card>
                           <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                 <Box display="flex" gap={2}>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                       {getPatientFullName(appointment.paciente)?.charAt(0) || 'P'}
                                    </Avatar>
                                    <Box>
                                       <Typography variant="h6">
                                          {getPatientFullName(appointment.paciente) || 'Paciente sin nombre'}
                                       </Typography>
                                       <Chip
                                          label={appointment.estado}
                                          color={getStatusColor(appointment.estado)}
                                          size="small"
                                       />
                                    </Box>
                                 </Box>
                                 <Box display="flex" gap={1}>
                                    <IconButton
                                       color="primary"
                                       onClick={() => handleOpenDetailsDialog(appointment)}
                                       title="Editar detalles"
                                    >
                                       <EditIcon />
                                    </IconButton>
                                    <IconButton
                                       color="success"
                                       onClick={() => handleCrearOrden(appointment)}
                                       title="Crear orden médica"
                                    >
                                       <OrderIcon />
                                    </IconButton>
                                 </Box>
                              </Box>

                              <Divider sx={{ my: 2 }} />

                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                 <CalendarIcon fontSize="small" color="action" />
                                 <Typography variant="body2">
                                    {appointment.horario?.fecha &&
                                       new Date(
                                          appointment.horario.fecha + 'T00:00:00'
                                       ).toLocaleDateString('es-ES', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                       })}
                                 </Typography>
                              </Box>

                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                 <TimeIcon fontSize="small" color="action" />
                                 <Typography variant="body2">
                                    {appointment.horario?.horaInicio?.substring(0, 5)} -{' '}
                                    {appointment.horario?.horaFin?.substring(0, 5)}
                                 </Typography>
                              </Box>

                              <Box display="flex" alignItems="center" gap={1} mb={2}>
                                 <HospitalIcon fontSize="small" color="action" />
                                 <Typography variant="body2">{appointment.tipoCita}</Typography>
                              </Box>

                              <Box display="flex" flexDirection="column" gap={1}>
                                 <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckIcon />}
                                    onClick={() => handleIniciarCita(appointment)}
                                    fullWidth
                                    size="small"
                                 >
                                    Iniciar Consulta
                                 </Button>
                                 <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<OrderIcon />}
                                    onClick={() => handleCrearOrden(appointment)}
                                    fullWidth
                                    size="small"
                                 >
                                    Crear Orden Médica
                                 </Button>
                              </Box>

                              {appointment.detalles && (
                                 <Chip
                                    label="Con detalles"
                                    size="small"
                                    color="info"
                                    sx={{ mt: 2 }}
                                    icon={<DescriptionIcon />}
                                 />
                              )}
                           </CardContent>
                        </Card>
                     </Grid>
                  ))}
               </Grid>
            )}
         </TabPanel>

         {/* Tab: En Proceso */}
         <TabPanel value={tabValue} index={1}>
            {enProceso.length === 0 ? (
               <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <TimeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                     No hay citas en proceso
                  </Typography>
               </Paper>
            ) : (
               <Grid container spacing={3}>
                  {enProceso.map((appointment) => (
                     <Grid item xs={12} md={6} key={appointment.id}>
                        <Card sx={{ border: 2, borderColor: 'warning.main' }}>
                           <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                 <Box display="flex" gap={2}>
                                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                                       {getPatientFullName(appointment.paciente)?.charAt(0) || 'P'}
                                    </Avatar>
                                    <Box>
                                       <Typography variant="h6">
                                          {getPatientFullName(appointment.paciente) || 'Paciente sin nombre'}
                                       </Typography>
                                       <Chip
                                          label="En Proceso"
                                          color="warning"
                                          size="small"
                                       />
                                    </Box>
                                 </Box>
                                 <Box display="flex" gap={1}>
                                    <IconButton
                                       color="primary"
                                       onClick={() => handleOpenDetailsDialog(appointment)}
                                       title="Completar consulta"
                                    >
                                       <EditIcon />
                                    </IconButton>
                                    <IconButton
                                       color="success"
                                       onClick={() => handleCrearOrden(appointment)}
                                       title="Crear orden médica"
                                    >
                                       <OrderIcon />
                                    </IconButton>
                                 </Box>
                              </Box>

                              <Divider sx={{ my: 2 }} />

                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                 <CalendarIcon fontSize="small" color="action" />
                                 <Typography variant="body2">
                                    {appointment.horario?.fecha &&
                                       new Date(
                                          appointment.horario.fecha + 'T00:00:00'
                                       ).toLocaleDateString('es-ES', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                       })}
                                 </Typography>
                              </Box>

                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                 <TimeIcon fontSize="small" color="action" />
                                 <Typography variant="body2">
                                    {appointment.horario?.horaInicio?.substring(0, 5)} -{' '}
                                    {appointment.horario?.horaFin?.substring(0, 5)}
                                 </Typography>
                              </Box>

                              <Box display="flex" alignItems="center" gap={1} mb={2}>
                                 <HospitalIcon fontSize="small" color="action" />
                                 <Typography variant="body2">{appointment.tipoCita}</Typography>
                              </Box>

                              <Button
                                 variant="contained"
                                 color="success"
                                 startIcon={<CheckIcon />}
                                 onClick={() => handleOpenDetailsDialog(appointment)}
                                 fullWidth
                                 size="small"
                              >
                                 Completar Consulta
                              </Button>

                              {appointment.detalles && (
                                 <Chip
                                    label="Con detalles"
                                    size="small"
                                    color="info"
                                    sx={{ mt: 2 }}
                                    icon={<DescriptionIcon />}
                                 />
                              )}
                           </CardContent>
                        </Card>
                     </Grid>
                  ))}
               </Grid>
            )}
         </TabPanel>

         {/* Tab: Completadas */}
         <TabPanel value={tabValue} index={2}>
            {completadas.length === 0 ? (
               <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <CheckIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                     No hay citas completadas
                  </Typography>
               </Paper>
            ) : (
               completadas
                  .sort((a, b) => {
                     const dateA = new Date(a.horario?.fecha || '').getTime();
                     const dateB = new Date(b.horario?.fecha || '').getTime();
                     return dateB - dateA;
                  })
                  .map((appointment) => (
                     <Accordion key={appointment.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                           <Box display="flex" alignItems="center" gap={2} width="100%">
                              <Avatar sx={{ bgcolor: 'success.main' }}>
                                 {getPatientFullName(appointment.paciente)?.charAt(0) || 'P'}
                              </Avatar>
                              <Box flex={1}>
                                 <Typography variant="subtitle1" fontWeight="bold">
                                    {getPatientFullName(appointment.paciente) || 'Paciente sin nombre'}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                    {appointment.horario?.fecha &&
                                       new Date(
                                          appointment.horario.fecha + 'T00:00:00'
                                       ).toLocaleDateString('es-ES')}
                                 </Typography>
                              </Box>
                              <Chip
                                 label={appointment.estado}
                                 color={getStatusColor(appointment.estado)}
                                 size="small"
                              />
                           </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                           {appointment.detalles ? (
                              <Box>
                                 {appointment.detalles.motivo && (
                                    <Box mb={2}>
                                       <Typography variant="subtitle2" color="primary" gutterBottom>
                                          Motivo de Consulta
                                       </Typography>
                                       <Typography variant="body2">{appointment.detalles.motivo}</Typography>
                                    </Box>
                                 )}

                                 {appointment.detalles.diagnostico && (
                                    <Box mb={2}>
                                       <Paper variant="outlined" sx={{ p: 2, bgcolor: 'warning.light' }}>
                                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                             Diagnóstico
                                          </Typography>
                                          <Typography variant="body2">
                                             {appointment.detalles.diagnostico}
                                          </Typography>
                                       </Paper>
                                    </Box>
                                 )}

                                 {appointment.detalles.planManejo && (
                                    <Box mb={2}>
                                       <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.light' }}>
                                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                             Plan de Manejo
                                          </Typography>
                                          <Typography variant="body2">
                                             {appointment.detalles.planManejo}
                                          </Typography>
                                       </Paper>
                                    </Box>
                                 )}

                                 <Button
                                    size="small"
                                    onClick={() => handleOpenDetailsDialog(appointment)}
                                    startIcon={<EditIcon />}
                                 >
                                    Ver detalles completos
                                 </Button>
                                 <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleCrearOrden(appointment)}
                                    startIcon={<OrderIcon />}
                                    sx={{ ml: 1 }}
                                 >
                                    Crear Orden
                                 </Button>
                              </Box>
                           ) : (
                              <Typography variant="body2" color="text.secondary">
                                 Sin detalles médicos registrados
                              </Typography>
                           )}
                        </AccordionDetails>
                     </Accordion>
                  ))
            )}
         </TabPanel>

         {/* Tab: Canceladas */}
         <TabPanel value={tabValue} index={3}>
            {canceladas.length === 0 ? (
               <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <CancelIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                     No hay citas canceladas
                  </Typography>
               </Paper>
            ) : (
               canceladas
                  .sort((a, b) => {
                     const dateA = new Date(a.horario?.fecha || '').getTime();
                     const dateB = new Date(b.horario?.fecha || '').getTime();
                     return dateB - dateA;
                  })
                  .map((appointment) => (
                     <Accordion key={appointment.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                           <Box display="flex" alignItems="center" gap={2} width="100%">
                              <Avatar sx={{ bgcolor: 'error.main' }}>
                                 {getPatientFullName(appointment.paciente)?.charAt(0) || 'P'}
                              </Avatar>
                              <Box flex={1}>
                                 <Typography variant="subtitle1" fontWeight="bold">
                                    {getPatientFullName(appointment.paciente) || 'Paciente sin nombre'}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                    {appointment.horario?.fecha &&
                                       new Date(
                                          appointment.horario.fecha + 'T00:00:00'
                                       ).toLocaleDateString('es-ES')}
                                 </Typography>
                              </Box>
                              <Chip
                                 label={appointment.estado}
                                 color={getStatusColor(appointment.estado)}
                                 size="small"
                              />
                           </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                           <Box>
                              {/* Información Básica */}
                              <Grid container spacing={2} mb={2}>
                                 <Grid item xs={12} sm={6}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                       <CalendarIcon fontSize="small" color="action" />
                                       <Typography variant="body2">
                                          <strong>Fecha:</strong>{' '}
                                          {appointment.horario?.fecha &&
                                             new Date(
                                                appointment.horario.fecha + 'T00:00:00'
                                             ).toLocaleDateString('es-ES')}
                                       </Typography>
                                    </Box>
                                 </Grid>
                                 <Grid item xs={12} sm={6}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                       <TimeIcon fontSize="small" color="action" />
                                       <Typography variant="body2">
                                          <strong>Horario:</strong> {appointment.horario?.horaInicio?.substring(0, 5)} -{' '}
                                          {appointment.horario?.horaFin?.substring(0, 5)}
                                       </Typography>
                                    </Box>
                                 </Grid>
                                 <Grid item xs={12}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                       <HospitalIcon fontSize="small" color="action" />
                                       <Typography variant="body2">
                                          <strong>Tipo:</strong> {appointment.tipoCita}
                                       </Typography>
                                    </Box>
                                 </Grid>
                              </Grid>

                              {appointment.detalles ? (
                                 <Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="body2" color="text.secondary" fontStyle="italic" mb={1}>
                                       Esta cita fue cancelada pero cuenta con detalles registrados:
                                    </Typography>
                                    
                                    {appointment.detalles.motivo && (
                                       <Box mb={2}>
                                          <Typography variant="subtitle2" color="primary" gutterBottom>
                                             Motivo de Consulta
                                          </Typography>
                                          <Typography variant="body2">{appointment.detalles.motivo}</Typography>
                                       </Box>
                                    )}
                                 </Box>
                              ) : (
                                 <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                    Sin detalles médicos registrados
                                 </Typography>
                              )}
                           </Box>
                        </AccordionDetails>
                     </Accordion>
                  ))
            )}
         </TabPanel>

         {/* Dialog: Detalles de Cita */}
         <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
            <DialogTitle>
               {selectedAppointment?.estado === 'en_proceso' 
                  ? 'Completar Consulta' 
                  : existingDetail 
                     ? 'Editar Detalles de la Cita' 
                     : 'Agregar Detalles de la Cita'}
            </DialogTitle>
            <DialogContent>
               {selectedAppointment && (
                  <Box sx={{ mb: 3, mt: 2 }}>
                     <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                           Paciente: {getPatientFullName(selectedAppointment.paciente) || 'Paciente sin nombre'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                           Fecha:{' '}
                           {selectedAppointment.horario?.fecha &&
                              new Date(
                                 selectedAppointment.horario.fecha + 'T00:00:00'
                              ).toLocaleDateString('es-ES')}
                        </Typography>
                     </Paper>
                  </Box>
               )}

               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                     fullWidth
                     label="Motivo de Consulta"
                     value={motivo}
                     onChange={(e) => setMotivo(e.target.value)}
                     required
                     multiline
                     rows={2}
                  />

                  <TextField
                     fullWidth
                     label="Antecedentes"
                     value={antecedentes}
                     onChange={(e) => setAntecedentes(e.target.value)}
                     multiline
                     rows={2}
                  />

                  <TextField
                     fullWidth
                     label="Anamnesis"
                     value={anamnesis}
                     onChange={(e) => setAnamnesis(e.target.value)}
                     multiline
                     rows={3}
                  />

                  <TextField
                     fullWidth
                     label="Revisión por Sistemas"
                     value={revisionSistemas}
                     onChange={(e) => setRevisionSistemas(e.target.value)}
                     multiline
                     rows={2}
                  />

                  <TextField
                     fullWidth
                     label="Examen Físico"
                     value={examenFisico}
                     onChange={(e) => setExamenFisico(e.target.value)}
                     multiline
                     rows={3}
                  />

                  <TextField
                     fullWidth
                     label="Diagnóstico"
                     value={diagnostico}
                     onChange={(e) => setDiagnostico(e.target.value)}
                     required
                     multiline
                     rows={2}
                     helperText="Campo requerido para completar la cita"
                  />

                  <TextField
                     fullWidth
                     label="Plan de Manejo"
                     value={planManejo}
                     onChange={(e) => setPlanManejo(e.target.value)}
                     required
                     multiline
                     rows={3}
                     helperText="Campo requerido para completar la cita"
                  />

                  <TextField
                     fullWidth
                     label="Evolución"
                     value={evolucion}
                     onChange={(e) => setEvolucion(e.target.value)}
                     multiline
                     rows={2}
                  />
               </Box>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseDetailsDialog}>Cancelar</Button>
               <Button onClick={handleSaveDetails} variant="outlined">
                  Guardar Detalles
               </Button>
               {(selectedAppointment?.estado === 'programada' || selectedAppointment?.estado === 'en_proceso') && (
                  <Button onClick={handleCompleteAppointment} variant="contained" color="success">
                     Completar Cita
                  </Button>
               )}
            </DialogActions>
         </Dialog>
      </Container>
   );
}
