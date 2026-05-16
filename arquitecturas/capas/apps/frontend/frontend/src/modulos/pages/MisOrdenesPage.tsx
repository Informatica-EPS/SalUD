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
   Divider,
   Accordion,
   AccordionSummary,
   AccordionDetails,
} from '@mui/material';
import {
   AssignmentTurnedIn as OrderIcon,
   ExpandMore as ExpandMoreIcon,
   LocalHospital as HospitalIcon,
   CalendarToday as CalendarIcon,
   Description as DescriptionIcon,
   Business as BusinessIcon,
   Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../services';
import { IOrder } from '../../interface';
import { BackButton } from '../../components';
import { medicamentsService, Medicament } from '../../services/medicamentsService';
import { useSpecialties } from '../../hooks';

export const MisOrdenesPage = () => {
   const { user } = useAuth();
   const [orders, setOrders] = useState<IOrder[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
const { specialties } = useSpecialties(); // 👈 agrega esto
   const [medicaments, setMedicaments] = useState<Medicament[]>([]); // 👈 agrega esto

   useEffect(() => {
      loadOrders();
      // 👇 agrega esto
      medicamentsService.getAll()
         .then(setMedicaments)
         .catch(console.error);
   }, []);

   const loadOrders = async () => {
      try {
         setLoading(true);
         setError(null);
         const response = await ordersService.getOrders(1, 100);
         
         // Filtrar órdenes por paciente (si están asociadas a citas del paciente)
         // Por ahora mostramos todas, pero podrías filtrar por idPaciente si está disponible
         setOrders(response.ordenes || []);
      } catch (err) {
         setError('Error al cargar las órdenes');
         console.error('Error:', err);
         setOrders([]);
      } finally {
         setLoading(false);
      }
   };

   const resolverNombreOrden = (order: IOrder) => {
   const esNA = order.especialidad === 1;  // 👈 usa order.especialidad directamente
   const specialty = specialties.find(s => s.id === order.especialidad);  // 👈 igual
   const medicamento = medicaments.find(m => m.id === order.idMedicamento);
   const tieneMedicamento = medicamento && order.idMedicamento !== 1;
   const nombreEspecialidad = specialty?.nombre;

   if (esNA && tieneMedicamento) return medicamento.nombre;
   if (!esNA && tieneMedicamento) return `${nombreEspecialidad}, ${medicamento.nombre}`;
   return nombreEspecialidad || String(order.especialidad);  // 👈 igual
};

   const getStatusColor = (estado: string) => {
      switch (estado) {
         case 'ejecutada':
            return 'success';
         case 'programada':
            return 'primary';
         case 'cancelada':
            return 'error';
         case 'pendiente':
         default:
            return 'default';
      }
   };

   const getStatusLabel = (estado: string) => {
      switch (estado) {
         case 'pendiente':
            return 'Pendiente';
         case 'programada':
            return 'Programada';
         case 'ejecutada':
            return 'Ejecutada';
         case 'cancelada':
            return 'Cancelada';
         default:
            return estado;
      }
   };

   const filterOrders = (estados: string[]) => {
      return orders.filter((order) => estados.includes(order.estado));
   };

   const handleAgendarCita = (order: IOrder) => {
      navigate(`/agendar-cita-especialidad/${resolverNombreOrden(order)}`, {
         state: {
            ordenId: order.id,
            especialidadNombre: order.Specialty?.nombre || 'Especialidad',
         },
      });
   };

   const statCard = (gradient: string) => ({
      p: 2,
      borderRadius: 3,
      textAlign: 'center',
      background: gradient,
      boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
      '&:hover': { boxShadow: '0 15px 30px rgba(0,0,0,0.1)'},
   });

   // Órdenes autorizadas son las que están listas para agendar cita
   const autorizadas = filterOrders(['autorizada']);
   const pendientes = filterOrders(['pendiente']);
   const programadas = filterOrders(['programada']);
   const ejecutadas = filterOrders(['ejecutada']);
   const canceladas = filterOrders(['cancelada']);

   if (loading) {
      return (
         <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress size={60} />
         </Box>
      );
   }

   if (error) {
      return (
         <Container maxWidth="lg" sx={{ py: 4 }}>
            <Alert severity="error">{error}</Alert>
         </Container>
      );
   }

   return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
         {/* Header */}
         <Box mb={2}>
            <BackButton to="/mis-citas" />
         </Box>
         <Box mb={4}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
               <OrderIcon sx={{ fontSize: 40, color: 'primary.main' }} />
               <Typography variant="h4" fontWeight="bold">
                  Mis Órdenes Médicas
               </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
               Consulta todas tus órdenes médicas y su estado actual
            </Typography>
         </Box>

         {/* Estadísticas */}
         <Grid container spacing={2} mb={4} wrap="nowrap" sx={{ overflowX: 'auto' }}>
            <Grid item sx={{ minWidth: 180, flex: '1 1 0' }}>
               <Paper sx={statCard('linear-gradient(135deg, #c8e6c9, #ffffff)')}>
                  <Typography variant="h4" fontWeight="bold">
                     {autorizadas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Autorizadas
                  </Typography>
               </Paper>
            </Grid>
            <Grid item sx={{ minWidth: 180, flex: '1 1 0' }}>
               <Paper sx={statCard('linear-gradient(135deg, #eeeeee, #ffffff)')}>
                  <Typography variant="h4" fontWeight="bold">
                     {pendientes.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Pendientes
                  </Typography>
               </Paper>
            </Grid>
            <Grid item sx={{ minWidth: 180, flex: '1 1 0' }}>
               <Paper sx={statCard('linear-gradient(135deg, #bbdefb, #ffffff)')}>
                  <Typography variant="h4" fontWeight="bold">
                     {programadas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Programadas
                  </Typography>
               </Paper>
            </Grid>
            <Grid item sx={{ minWidth: 180, flex: '1 1 0' }}>
               <Paper sx={statCard('linear-gradient(135deg, #b3e5fc, #ffffff)')}>
                  <Typography variant="h4" fontWeight="bold">
                     {ejecutadas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Ejecutadas
                  </Typography>
               </Paper>
            </Grid>
            <Grid item sx={{ minWidth: 180, flex: '1 1 0' }}>
               <Paper sx={statCard('linear-gradient(135deg, #ffcdd2, #ffffff)')}>
                  <Typography variant="h4" fontWeight="bold">
                     {canceladas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     Canceladas
                  </Typography>
               </Paper>
            </Grid>
         </Grid>

         {/* Órdenes Pendientes */}
         {pendientes.length > 0 && (
            <>
               <Typography variant="h5" gutterBottom fontWeight="bold" mb={2}>
                  Órdenes Pendientes
               </Typography>
               <Grid container spacing={3} mb={4}>
                  {pendientes.map((order) => (
                     <Grid item xs={12} md={6} key={order.id}>
                        <Card elevation={3} sx={{ border: 2, borderColor: 'warning.main' }}>
                           <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                 <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                       Orden #{order.id}
                                    </Typography>
                                    <Chip
                                       label={getStatusLabel(order.estado)}
                                       color={getStatusColor(order.estado)}
                                       size="small"
                                       sx={{ mt: 1 }}
                                    />
                                 </Box>
                                 <OrderIcon color="primary" sx={{ fontSize: 32 }} />
                              </Box>

                              <Divider sx={{ my: 2 }} />

                              <Box display="flex" alignItems="start" gap={1} mb={1}>
                                 <HospitalIcon fontSize="small" color="action" />
                                 <Box>
                                    <Typography variant="body2" color="text.secondary">
                                       Especialidad
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                       {resolverNombreOrden(order)}
                                    </Typography>
                                 </Box>
                              </Box>

                              <Box display="flex" alignItems="start" gap={1} mb={1}>
                                 <BusinessIcon fontSize="small" color="action" />
                                 <Box>
                                    <Typography variant="body2" color="text.secondary">
                                       Entidad de Destino
                                    </Typography>
                                    <Typography variant="body1">
                                       {order.entidadDestino}
                                    </Typography>
                                 </Box>
                              </Box>

                              {order.fechaVencimiento && (
                                 <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <ScheduleIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                       Vence:{' '}
                                       {new Date(order.fechaVencimiento).toLocaleDateString('es-ES', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                       })}
                                    </Typography>
                                 </Box>
                              )}

                              <Box display="flex" alignItems="start" gap={1} mt={2}>
                                 <DescriptionIcon fontSize="small" color="action" />
                                 <Box>
                                    <Typography variant="body2" color="text.secondary">
                                       Descripción
                                    </Typography>
                                    <Typography variant="body2">
                                       {order.descripcion}
                                    </Typography>
                                 </Box>
                              </Box>

                              {order.Appointment && (
                                 <Box mt={2} p={1.5} bgcolor="grey.100" borderRadius={1}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                       Cita Asociada #{order.Appointment.id}
                                    </Typography>
                                    <Typography variant="body2">
                                       {order.Appointment.tipoCita}
                                    </Typography>
                                 </Box>
                              )}
                           </CardContent>
                        </Card>
                     </Grid>
                  ))}
               </Grid>
            </>
         )}

         {/* Órdenes Programadas */}
         {programadas.length > 0 && (
            <>
               <Typography variant="h5" gutterBottom fontWeight="bold" mb={2}>
                  Órdenes Programadas
               </Typography>
               <Grid container spacing={3} mb={4}>
                  {programadas.map((order) => (
                     <Grid item xs={12} md={6} key={order.id}>
                        <Card elevation={3}>
                           <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                 <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                       Orden #{order.id}
                                    </Typography>
                                    <Chip
                                       label={getStatusLabel(order.estado)}
                                       color={getStatusColor(order.estado)}
                                       size="small"
                                       sx={{ mt: 1 }}
                                    />
                                 </Box>
                                 <OrderIcon color="primary" sx={{ fontSize: 32 }} />
                              </Box>

                              <Divider sx={{ my: 2 }} />

                              <Box display="flex" alignItems="start" gap={1} mb={1}>
                                 <HospitalIcon fontSize="small" color="action" />
                                 <Box>
                                    <Typography variant="body2" color="text.secondary">
                                       Especialidad
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                       {resolverNombreOrden(order)}
                                    </Typography>
                                 </Box>
                              </Box>

                              <Box display="flex" alignItems="start" gap={1} mb={1}>
                                 <BusinessIcon fontSize="small" color="action" />
                                 <Box>
                                    <Typography variant="body2" color="text.secondary">
                                       Entidad de Destino
                                    </Typography>
                                    <Typography variant="body1">
                                       {order.entidadDestino}
                                    </Typography>
                                 </Box>
                              </Box>

                              {order.fechaVencimiento && (
                                 <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <ScheduleIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                       Vence:{' '}
                                       {new Date(order.fechaVencimiento).toLocaleDateString('es-ES', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                       })}
                                    </Typography>
                                 </Box>
                              )}

                              <Box display="flex" alignItems="start" gap={1} mt={2}>
                                 <DescriptionIcon fontSize="small" color="action" />
                                 <Box>
                                    <Typography variant="body2" color="text.secondary">
                                       Descripción
                                    </Typography>
                                    <Typography variant="body2">
                                       {order.descripcion}
                                    </Typography>
                                 </Box>
                              </Box>
                           </CardContent>
                        </Card>
                     </Grid>
                  ))}
               </Grid>
            </>
         )}

         {/* Historial (Ejecutadas y Canceladas) */}
         {(ejecutadas.length > 0 || canceladas.length > 0) && (
            <>
               <Divider sx={{ my: 4 }} />
               <Typography variant="h5" gutterBottom fontWeight="bold" mb={2}>
                  Historial de Órdenes
               </Typography>
               
               {[...ejecutadas, ...canceladas]
                  .sort((a, b) => {
                     const dateA = new Date(a.createdAt || '').getTime();
                     const dateB = new Date(b.createdAt || '').getTime();
                     return dateB - dateA;
                  })
                  .map((order) => (
                     <Accordion key={order.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                           <Box display="flex" alignItems="center" gap={2} width="100%">
                              <OrderIcon color="action" />
                              <Box flex={1}>
                                 <Typography variant="subtitle1" fontWeight="bold">
                                    Orden #{order.id} - {resolverNombreOrden(order)}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                    {order.entidadDestino}
                                 </Typography>
                              </Box>
                              <Chip
                                 label={getStatusLabel(order.estado)}
                                 color={getStatusColor(order.estado)}
                                 size="small"
                              />
                           </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                           <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                 <Typography variant="body2" color="text.secondary">
                                    Especialidad
                                 </Typography>
                                 <Typography variant="body1" fontWeight="bold">
                                    {resolverNombreOrden(order)}
                                 </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                 <Typography variant="body2" color="text.secondary">
                                    Entidad de Destino
                                 </Typography>
                                 <Typography variant="body1">
                                    {order.entidadDestino}
                                 </Typography>
                              </Grid>
                              {order.fechaVencimiento && (
                                 <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                       Fecha de Vencimiento
                                    </Typography>
                                    <Typography variant="body1">
                                       {new Date(order.fechaVencimiento).toLocaleDateString('es-ES')}
                                    </Typography>
                                 </Grid>
                              )}
                              <Grid item xs={12}>
                                 <Typography variant="body2" color="text.secondary">
                                    Descripción
                                 </Typography>
                                 <Typography variant="body1">
                                    {order.descripcion}
                                 </Typography>
                              </Grid>
                              {order.createdAt && (
                                 <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                       Creada el: {new Date(order.createdAt).toLocaleString('es-ES')}
                                    </Typography>
                                 </Grid>
                              )}
                           </Grid>
                        </AccordionDetails>
                     </Accordion>
                  ))}
            </>
         )}

         {/* Empty State */}
         {orders.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
               <OrderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
               <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tienes órdenes médicas
               </Typography>
               <Typography variant="body2" color="text.secondary" mb={3}>
                  Las órdenes médicas creadas por tu doctor aparecerán aquí
               </Typography>
            </Paper>
         )}
      </Container>
   );
};

export default MisOrdenesPage;