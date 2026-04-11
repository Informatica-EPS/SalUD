import { useState, useEffect } from 'react';
import {
   Box,
   Button,
   Card,
   CardContent,
   Container,
   TextField,
   Typography,
   Alert,
   CircularProgress,
   MenuItem,
   Grid,
   Paper,
   Divider,
   Chip,
   List,
   ListItem,
   ListItemText,
   ListItemIcon,
} from '@mui/material';
import {
   AssignmentTurnedIn as OrderIcon,
   Save as SaveIcon,
   Cancel as CancelIcon,
   CheckCircle as CheckIcon,
   Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrders } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { BackButton } from '../../components';
import Swal from 'sweetalert2';

const ESPECIALIDADES = [
   'Cardiología',
   'Neurología',
   'Pediatría',
   'Ginecología',
   'Oftalmología',
   'Dermatología',
   'Traumatología',
   'Psiquiatría',
   'Medicina General',
   'Radiología',
   'Laboratorio Clínico',
   'Fisioterapia',
   'Otra',
];

const ESTADOS_ORDEN = [
   { value: 'pendiente', label: 'Pendiente' },
   { value: 'programada', label: 'Programada' },
   { value: 'ejecutada', label: 'Ejecutada' },
   { value: 'cancelada', label: 'Cancelada' },
];

interface LocationState {
   citaId?: number;
   pacienteNombre?: string;
   doctorNombre?: string;
}

export const CrearOrdenPage = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const { user } = useAuth();
   const { createOrder, loading, fetchOrdersByAppointment, orders } = useOrders();

   const state = location.state as LocationState;
   const citaIdFromState = state?.citaId;
   const pacienteNombre = state?.pacienteNombre;
   const doctorNombre = state?.doctorNombre;

   const [formData, setFormData] = useState({
      idCita: citaIdFromState || 0,
      especialidad: '',
      entidadDestino: '',
      descripcion: '',
      estado: 'pendiente',
      fechaVencimiento: '',
   });

   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
   const [existingOrders, setExistingOrders] = useState<any[]>([]);

   useEffect(() => {
      if (citaIdFromState) {
         setFormData((prev) => ({ ...prev, idCita: citaIdFromState }));
         loadExistingOrders();
      }
   }, [citaIdFromState]);

   const loadExistingOrders = async () => {
      if (citaIdFromState) {
         try {
            await fetchOrdersByAppointment(citaIdFromState);
            setExistingOrders(orders);
         } catch (err) {
            console.error('Error al cargar órdenes existentes:', err);
         }
      }
   };

   useEffect(() => {
      setExistingOrders(orders);
   }, [orders]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError(null);
   };

   const validateForm = () => {
      if (!formData.idCita || formData.idCita === 0) {
         setError('Debe seleccionar una cita válida');
         return false;
      }
      if (!formData.especialidad.trim()) {
         setError('Debe seleccionar una especialidad');
         return false;
      }
      if (!formData.entidadDestino.trim()) {
         setError('Debe ingresar la entidad de destino');
         return false;
      }
      if (!formData.descripcion.trim()) {
         setError('Debe ingresar una descripción de la orden');
         return false;
      }
      return true;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      if (!validateForm()) {
         return;
      }

      const result = await createOrder({
         idCita: formData.idCita,
         especialidad: formData.especialidad,
         entidadDestino: formData.entidadDestino,
         descripcion: formData.descripcion,
         estado: formData.estado as 'pendiente' | 'programada' | 'ejecutada' | 'cancelada',
         fechaVencimiento: formData.fechaVencimiento || undefined,
         creadoPor: user?.id,
         actualizadoPor: user?.id,
      });

      if (result.success) {
         await Swal.fire({
            title: '¡Éxito!',
            text: result.message || 'Orden médica creada exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
         });
         // Redirigir al panel del médico si el usuario es médico
         if (user?.idDoctor) {
            navigate('/medico');
         } else {
            navigate('/mis-citas');
         }
      } else {
         setError(result.error || 'Error al crear la orden médica');
         await Swal.fire({
            title: 'Error',
            text: result.error || 'No se pudo crear la orden médica',
            icon: 'error',
            confirmButtonText: 'Aceptar',
         });
      }
   };

   const handleCancel = () => {
      navigate(-1);
   };

   return (
      <Container maxWidth="md" sx={{ py: 4 }}>
         <Box mb={4}>
            <BackButton />
            <Box display="flex" alignItems="center" gap={2} mb={2} mt={2}>
               <OrderIcon sx={{ fontSize: 40, color: 'primary.main' }} />
               <Typography variant="h4" fontWeight="bold">
                  Registrar Nueva Orden Médica
               </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
               Complete el formulario para registrar una orden médica asociada a la cita
            </Typography>
         </Box>

         {citaIdFromState && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light' }}>
               <Typography variant="h6" gutterBottom>
                  Información de la Cita
               </Typography>
               <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                     <Typography variant="body2" color="text.secondary">
                        ID Cita:
                     </Typography>
                     <Typography variant="body1" fontWeight="bold">
                        #{citaIdFromState}
                     </Typography>
                  </Grid>
                  {pacienteNombre && (
                     <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                           Paciente:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                           {pacienteNombre}
                        </Typography>
                     </Grid>
                  )}
                  {doctorNombre && (
                     <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                           Médico:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                           {doctorNombre}
                        </Typography>
                     </Grid>
                  )}
               </Grid>
            </Paper>
         )}

         {/* Órdenes Existentes */}
         {existingOrders.length > 0 && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light' }}>
               <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <CheckIcon color="success" />
                  <Typography variant="h6">
                     Órdenes Existentes para esta Cita ({existingOrders.length})
                  </Typography>
               </Box>
               <Divider sx={{ mb: 2 }} />
               <List>
                  {existingOrders.map((orden, index) => (
                     <ListItem
                        key={orden.id}
                        sx={{
                           bgcolor: 'white',
                           mb: 1,
                           borderRadius: 1,
                           border: '1px solid',
                           borderColor: 'divider',
                        }}
                     >
                        <ListItemIcon>
                           <OrderIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                           primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                 <Typography variant="subtitle1" fontWeight="bold">
                                    Orden #{orden.id} - {orden.especialidad}
                                 </Typography>
                                 <Chip
                                    label={orden.estado}
                                    color={
                                       orden.estado === 'ejecutada'
                                          ? 'success'
                                          : orden.estado === 'programada'
                                          ? 'primary'
                                          : orden.estado === 'cancelada'
                                          ? 'error'
                                          : 'default'
                                    }
                                    size="small"
                                 />
                              </Box>
                           }
                           secondary={
                              <Box sx={{ mt: 1 }}>
                                 <Typography variant="body2" color="text.secondary">
                                    <strong>Entidad:</strong> {orden.entidadDestino}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                    <strong>Descripción:</strong> {orden.descripcion}
                                 </Typography>
                                 {orden.fechaVencimiento && (
                                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                       <ScheduleIcon fontSize="small" />
                                       <Typography variant="caption" color="text.secondary">
                                          Vence: {new Date(orden.fechaVencimiento).toLocaleDateString('es-ES')}
                                       </Typography>
                                    </Box>
                                 )}
                              </Box>
                           }
                        />
                     </ListItem>
                  ))}
               </List>
               <Alert severity="info" sx={{ mt: 2 }}>
                  Esta cita ya tiene {existingOrders.length} orden(es) creada(s). Puedes crear una orden adicional si es necesario.
               </Alert>
            </Paper>
         )}

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

         <Card elevation={3}>
            <CardContent>
               <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  {existingOrders.length > 0 
                     ? 'Crear Orden Adicional' 
                     : 'Formulario de Nueva Orden'}
               </Typography>
               <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                     <Grid item xs={12}>
                        <TextField
                           fullWidth
                           label="ID de Cita"
                           name="idCita"
                           type="number"
                           value={formData.idCita}
                           onChange={handleChange}
                           required
                           disabled={!!citaIdFromState}
                           helperText={
                              citaIdFromState
                                 ? 'ID de cita asignado automáticamente'
                                 : 'Ingrese el ID de la cita asociada'
                           }
                        />
                     </Grid>

                     <Grid item xs={12} sm={6}>
                        <TextField
                           fullWidth
                           select
                           label="Especialidad"
                           name="especialidad"
                           value={formData.especialidad}
                           onChange={handleChange}
                           required
                           helperText="Seleccione la especialidad requerida"
                        >
                           {ESPECIALIDADES.map((especialidad) => (
                              <MenuItem key={especialidad} value={especialidad}>
                                 {especialidad}
                              </MenuItem>
                           ))}
                        </TextField>
                     </Grid>

                     <Grid item xs={12} sm={6}>
                        <TextField
                           fullWidth
                           select
                           label="Estado"
                           name="estado"
                           value={formData.estado}
                           onChange={handleChange}
                           required
                           helperText="Estado actual de la orden"
                        >
                           {ESTADOS_ORDEN.map((estado) => (
                              <MenuItem key={estado.value} value={estado.value}>
                                 {estado.label}
                              </MenuItem>
                           ))}
                        </TextField>
                     </Grid>

                     <Grid item xs={12}>
                        <TextField
                           fullWidth
                           label="Entidad de Destino"
                           name="entidadDestino"
                           value={formData.entidadDestino}
                           onChange={handleChange}
                           required
                           helperText="Institución o centro médico donde se realizará el procedimiento"
                           placeholder="Ej: Hospital Universitario, Clínica San Rafael..."
                        />
                     </Grid>

                     <Grid item xs={12}>
                        <TextField
                           fullWidth
                           label="Fecha de Vencimiento"
                           name="fechaVencimiento"
                           type="date"
                           value={formData.fechaVencimiento}
                           onChange={handleChange}
                           InputLabelProps={{
                              shrink: true,
                           }}
                           helperText="Fecha límite para realizar la orden (opcional)"
                        />
                     </Grid>

                     <Grid item xs={12}>
                        <TextField
                           fullWidth
                           multiline
                           rows={4}
                           label="Descripción de la Orden"
                           name="descripcion"
                           value={formData.descripcion}
                           onChange={handleChange}
                           required
                           helperText="Detalle los procedimientos, exámenes o tratamientos solicitados"
                           placeholder="Ej: Examen de sangre completo, radiografía de tórax, ecografía abdominal..."
                        />
                     </Grid>

                     <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                     </Grid>

                     <Grid item xs={12}>
                        <Box display="flex" gap={2} justifyContent="flex-end">
                           <Button
                              variant="outlined"
                              color="secondary"
                              startIcon={<CancelIcon />}
                              onClick={handleCancel}
                              disabled={loading}
                           >
                              Cancelar
                           </Button>
                           <Button
                              type="submit"
                              variant="contained"
                              color="primary"
                              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                              disabled={loading}
                           >
                              {loading ? 'Guardando...' : 'Guardar Orden'}
                           </Button>
                        </Box>
                     </Grid>
                  </Grid>
               </form>
            </CardContent>
         </Card>
      </Container>
   );
};

export default CrearOrdenPage;
