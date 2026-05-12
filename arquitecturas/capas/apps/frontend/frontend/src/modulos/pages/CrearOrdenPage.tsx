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
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Avatar,
} from '@mui/material';
import {
   AssignmentTurnedIn as OrderIcon,
   Save as SaveIcon,
   Cancel as CancelIcon,
   CheckCircle as CheckIcon,
   Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrders, useSpecialties } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { BackButton } from '../../components';
import Swal from 'sweetalert2';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedIcon from '@mui/icons-material/Verified';

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
   const { createOrder, updateOrder, loading, fetchOrdersByAppointment, orders } = useOrders();
   const { specialties, loading: loadingSpecialties } = useSpecialties();

   const state = location.state as LocationState;
   const citaIdFromState = state?.citaId;
   const pacienteNombre = state?.pacienteNombre;
   const doctorNombre = state?.doctorNombre;
   const nombreDoctor = `${user?.primerNombre || ''} ${user?.primerApellido || ''}`.trim();

   console.log(state);

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

   const [editingOrder, setEditingOrder] = useState<any | null>(null);
   const [openEditDialog, setOpenEditDialog] = useState(false);
   const [editFormData, setEditFormData] = useState({
      especialidad: '',
      entidadDestino: '',
      descripcion: '',
      fechaVencimiento: '',
   });
   const [fechaInvalida, setFechaInvalida] = useState(false);

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

   useEffect(() => {
      console.log('Estado del diálogo cambió:', openEditDialog);
      console.log('Orden siendo editada:', editingOrder);
   }, [openEditDialog, editingOrder]);

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
      if (formData.fechaVencimiento) {
         const hoy = new Date().setHours(0, 0, 0, 0);
         const fecha = new Date(formData.fechaVencimiento).setHours(0, 0, 0, 0);

         if (fecha < hoy) {
            setError('La fecha de vencimiento no puede ser anterior a hoy');
            return false;
         }
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

   const handleAutorizarOrden = async (ordenId: number) => {
      const confirmResult = await Swal.fire({
         title: '¿Autorizar orden?',
         text: 'Esta acción cambiará el estado de la orden a "Autorizada"',
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: 'Sí, autorizar',
         cancelButtonText: 'Cancelar',
         confirmButtonColor: '#4caf50',
      });

      if (confirmResult.isConfirmed) {
         const result = await updateOrder(ordenId, {
            estado: 'autorizada',
            actualizadoPor: user?.id,
         });

         if (result.success) {
            await Swal.fire({
               title: '¡Éxito!',
               text: 'Orden autorizada exitosamente',
               icon: 'success',
               confirmButtonText: 'Aceptar',
            });
            loadExistingOrders();
         } else {
            await Swal.fire({
               title: 'Error',
               text: result.error || 'No se pudo autorizar la orden',
               icon: 'error',
               confirmButtonText: 'Aceptar',
            });
         }
      }
   };

   const handleCambiarEstadoOrden = async (ordenId: number, nuevoEstado: string) => {
      const estadoLabels: Record<string, string> = {
         pendiente: 'Pendiente',
         autorizada: 'Autorizada',
         programada: 'Programada',
         ejecutada: 'Ejecutada',
         cancelada: 'Cancelada',
      };

      const confirmResult = await Swal.fire({
         title: '¿Cambiar estado?',
         text: `Esta acción cambiará el estado de la orden a "${estadoLabels[nuevoEstado]}"`,
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: 'Sí, cambiar',
         cancelButtonText: 'Cancelar',
      });

      if (confirmResult.isConfirmed) {
         const result = await updateOrder(ordenId, {
            estado: nuevoEstado as any,
            actualizadoPor: user?.id,
         });

         if (result.success) {
            await Swal.fire({
               title: '¡Éxito!',
               text: 'Estado de la orden actualizado exitosamente',
               icon: 'success',
               confirmButtonText: 'Aceptar',
            });
            loadExistingOrders();
         } else {
            await Swal.fire({
               title: 'Error',
               text: result.error || 'No se pudo actualizar el estado',
               icon: 'error',
               confirmButtonText: 'Aceptar',
            });
         }
      }
   };

   const handleOpenEditDialog = (orden: any) => {
      console.log('Abriendo diálogo de edición para orden:', orden);
      setEditingOrder(orden);
      setEditFormData({
         especialidad: orden.especialidad?.toString() || orden.Specialty?.id?.toString() || '',
         entidadDestino: orden.entidadDestino || '',
         descripcion: orden.descripcion || '',
         fechaVencimiento: orden.fechaVencimiento 
            ? new Date(orden.fechaVencimiento).toISOString().split('T')[0] 
            : '',
      });
      setOpenEditDialog(true);
      console.log('Estado openEditDialog:', true);
   };

   const handleCloseEditDialog = () => {
      setOpenEditDialog(false);
      setEditingOrder(null);
      setEditFormData({
         especialidad: '',
         entidadDestino: '',
         descripcion: '',
         fechaVencimiento: '',
      });
   };

   const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditFormData((prev) => ({ ...prev, [name]: value }));

      if (name === 'fechaVencimiento') {
      const hoy = new Date().toISOString().split('T')[0];
      setFechaInvalida(value < hoy);
   }
   };

   const handleSaveEdit = async () => {
      if (!editingOrder) return;

      if (!editFormData.especialidad.trim()) {
         setError('Debe seleccionar una especialidad');
         return;
      }
      if (!editFormData.entidadDestino.trim()) {
         setError('Debe ingresar la entidad de destino');
         return;
      }
      if (!editFormData.descripcion.trim()) {
         setError('Debe ingresar una descripción');
         return;
      }
      if (fechaInvalida) {
         const hoy = new Date().setHours(0,0,0,0);
         const fecha = new Date(editFormData.fechaVencimiento).setHours(0,0,0,0);

         if (fecha < hoy) {
            await Swal.fire({
               title: 'Fecha inválida',
               text: 'La fecha de vencimiento no puede ser anterior a hoy',
               icon: 'warning',
               confirmButtonText: 'Aceptar',
               didOpen: () => {
                  const swal = document.querySelector('.swal2-container') as HTMLElement;
                  if (swal) {
                     swal.style.zIndex = '2000';
                  }
               }
            });
            return;
         }
      }

      console.log('Guardando cambios de orden:', editingOrder.id);
      
      const result = await updateOrder(editingOrder.id, {
         especialidad: editFormData.especialidad,
         entidadDestino: editFormData.entidadDestino,
         descripcion: editFormData.descripcion,
         fechaVencimiento: editFormData.fechaVencimiento || undefined,
         actualizadoPor: user?.id,
      });

      console.log('Resultado de actualización:', result);

      // Cerrar el diálogo primero
      handleCloseEditDialog();
      
      // Luego mostrar el mensaje
      if (result.success) {
         await loadExistingOrders();
         await Swal.fire({
            title: '¡Éxito!',
            text: 'Orden actualizada exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
         });
      } else {
         await Swal.fire({
            title: 'Error',
            text: result.error || 'No se pudo actualizar la orden',
            icon: 'error',
            confirmButtonText: 'Aceptar',
         });
      }
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
            <Paper
               sx={{
                  p: 3,
                  mb: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
               }}
            >
               <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                     <OrderIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                     Información de la Cita
                  </Typography>
               </Box>

               <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                     <Typography variant="caption" color="text.secondary">
                        ID Cita
                     </Typography>
                     <Typography variant="body1" fontWeight="bold">
                        #{citaIdFromState}
                     </Typography>
                  </Grid>

                  {pacienteNombre && (
                     <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                           Paciente
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                           {pacienteNombre}
                        </Typography>
                     </Grid>
                  )}

                  <Grid item xs={12} sm={4}>
                     <Typography variant="caption" color="text.secondary">
                        Médico
                     </Typography>
                     <Typography variant="body1" fontWeight="bold">
                        {nombreDoctor || doctorNombre || 'Médico actual'}
                     </Typography>
                  </Grid>
               </Grid>
            </Paper>
         )}

         {/* Órdenes Existentes */}
         {existingOrders.length > 0 && (
            <Paper
               sx={{
                  p: 3,
                  mb: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
               }}
            >
               {/* HEADER */}
               <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                     <CheckIcon />
                  </Avatar>

                  <Box>
                     <Typography variant="h6" fontWeight="bold">
                        Órdenes de la Cita
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                        {existingOrders.length} orden(es) registradas
                     </Typography>
                  </Box>
               </Box>

               <Divider sx={{ mb: 3 }} />

               {/* LISTA */}
               <Grid container spacing={2}>
                  {existingOrders.map((orden) => (
                     <Grid item xs={12} key={orden.id}>
                        <Card
                           variant="outlined"
                           sx={{
                              borderRadius: 2,
                              transition: '0.2s',
                              '&:hover': {
                                 boxShadow: 3,
                              },
                           }}
                        >
                           <CardContent>

                              {/* HEADER ORDEN */}
                              <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
                                 <Typography fontWeight="bold">
                                    Orden #{orden.id}
                                 </Typography>

                                 <Chip
                                    label={orden.estado}
                                    color={
                                       orden.estado === 'autorizada' || orden.estado === 'ejecutada'
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

                              {/* ESPECIALIDAD */}
                              <Typography variant="body2" color="text.secondary" mt={1}>
                                 {orden.Specialty?.nombre || orden.especialidad}
                              </Typography>

                              <Divider sx={{ my: 2 }} />

                              {/* INFO */}
                              <Grid container spacing={2}>
                                 <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                       Entidad
                                    </Typography>
                                    <Typography variant="body2">
                                       {orden.entidadDestino}
                                    </Typography>
                                 </Grid>

                                 {orden.fechaVencimiento && (
                                    <Grid item xs={12} sm={6}>
                                       <Typography variant="caption" color="text.secondary">
                                          Fecha de vencimiento
                                       </Typography>
                                       <Typography variant="body2">
                                          {new Date(orden.fechaVencimiento).toLocaleDateString('es-ES')}
                                       </Typography>
                                    </Grid>
                                 )}

                                 <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                       Descripción
                                    </Typography>
                                    <Typography variant="body2">
                                       {orden.descripcion}
                                    </Typography>
                                 </Grid>
                              </Grid>

                              {/* ACCIONES */}
                              <Box
                                 display="flex"
                                 gap={1}
                                 mt={3}
                                 justifyContent="flex-end"
                                 flexWrap="wrap"
                              >
                                 {orden.estado !== 'ejecutada' && orden.estado !== 'cancelada' && (
                                    <Button
                                       size="small"
                                       variant="outlined"
                                       startIcon={<EditIcon />}
                                       onClick={() => handleOpenEditDialog(orden)}
                                    >
                                       Editar
                                    </Button>
                                 )}

                                 {orden.estado !== 'autorizada' &&
                                    orden.estado !== 'ejecutada' &&
                                    orden.estado !== 'cancelada' && (
                                       <Button
                                          size="small"
                                          variant="contained"
                                          color="success"
                                          startIcon={<VerifiedIcon />}
                                          onClick={() => handleAutorizarOrden(orden.id)}
                                       >
                                          Autorizar
                                       </Button>
                                    )}

                                 {orden.estado !== 'ejecutada' &&
                                    orden.estado !== 'cancelada' && (
                                       <Button
                                          size="small"
                                          variant="text"
                                          color="error"
                                          startIcon={<CancelIcon />}
                                          onClick={() =>
                                             handleCambiarEstadoOrden(orden.id, 'cancelada')
                                          }
                                       >
                                          Cancelar
                                       </Button>
                                    )}
                              </Box>
                           </CardContent>
                        </Card>
                     </Grid>
                  ))}
               </Grid>

               {/* INFO */}
               <Alert severity="info" sx={{ mt: 3 }}>
                  Puedes crear órdenes adicionales para esta cita si es necesario.
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

         <Card
   elevation={0}
   sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 3,
   }}
>
   <CardContent>
      {/* HEADER */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
         <Avatar sx={{ bgcolor: 'primary.main' }}>
            <OrderIcon />
         </Avatar>

         <Box>
            <Typography variant="h6" fontWeight="bold">
               {existingOrders.length > 0
                  ? 'Nueva Orden Adicional'
                  : 'Nueva Orden Médica'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
               Completa la información requerida
            </Typography>
         </Box>
      </Box>

      <form onSubmit={handleSubmit}>
         <Grid container spacing={3}>
            
            {/* 🔹 SECCIÓN: INFORMACIÓN GENERAL */}
            <Grid item xs={12}>
               <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Información General
               </Typography>
               <Divider />
            </Grid>

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
                        ? 'Asignado automáticamente'
                        : 'Ingrese el ID de la cita'
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
                  disabled={loadingSpecialties}
               >
                  {specialties.map((esp) => (
                     <MenuItem key={esp.id} value={esp.id.toString()}>
                        {esp.nombre}
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
               >
                  {ESTADOS_ORDEN.map((estado) => (
                     <MenuItem key={estado.value} value={estado.value}>
                        {estado.label}
                     </MenuItem>
                  ))}
               </TextField>
            </Grid>

            {/* 🔹 SECCIÓN: DETALLES */}
            <Grid item xs={12} mt={2}>
               <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Detalles de la Orden
               </Typography>
               <Divider />
            </Grid>

            <Grid item xs={12}>
               <TextField
                  fullWidth
                  label="Entidad de Destino"
                  name="entidadDestino"
                  value={formData.entidadDestino}
                  onChange={handleChange}
                  required
               />
            </Grid>

            <Grid item xs={12} sm={6}>
               <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Vencimiento"
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                     min: new Date().toISOString().split('T')[0],
                  }}
               />
            </Grid>

            <Grid item xs={12}>
               <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
               />
            </Grid>

            {/* BOTONES */}
            <Grid item xs={12}>
               <Box
                  display="flex"
                  justifyContent="flex-end"
                  gap = {2}
                  alignItems="center"
                  mt={2}
               >
                  <Button variant="outlined" color="secondary" startIcon={<CancelIcon />} onClick={handleCancel} disabled={loading} > Cancelar </Button>

                  <Button
                     type="submit"
                     variant="contained"
                     startIcon={
                        loading ? (
                           <CircularProgress size={20} color="inherit" />
                        ) : (
                           <SaveIcon />
                        )
                     }
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

         {/* Diálogo de Edición de Orden */}
         <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
            <DialogTitle>
               <Box display="flex" alignItems="center" gap={2}>
                  <EditIcon color="primary" />
                  <Typography variant="h6">
                     Editar Orden #{editingOrder?.id}
                  </Typography>
               </Box>
            </DialogTitle>
            <DialogContent>
               <Box sx={{ pt: 2 }}>
                  {editingOrder && (
                     <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                           <strong>Estado actual:</strong> {editingOrder.estado}
                        </Typography>
                        <Typography variant="body2">
                           <strong>Cita asociada:</strong> #{editingOrder.idCita}
                        </Typography>
                     </Alert>
                  )}

                  <Grid container spacing={3}>
                     <Grid item xs={12}>
                        <TextField
                           fullWidth
                           select
                           label="Especialidad"
                           name="especialidad"
                           value={editFormData.especialidad}
                           onChange={handleEditChange}
                           required
                           disabled={loadingSpecialties}
                           helperText={
                              loadingSpecialties 
                                 ? 'Cargando especialidades...' 
                                 : 'Seleccione la especialidad requerida'
                           }
                        >
                           {specialties.map((especialidad) => (
                              <MenuItem key={especialidad.id} value={especialidad.id.toString()}>
                                 {especialidad.nombre}
                              </MenuItem>
                           ))}
                        </TextField>
                     </Grid>

                     <Grid item xs={12}>
                        <TextField
                           fullWidth
                           label="Entidad de Destino"
                           name="entidadDestino"
                           value={editFormData.entidadDestino}
                           onChange={handleEditChange}
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
                           value={editFormData.fechaVencimiento}
                           onChange={handleEditChange}
                           InputLabelProps={{
                              shrink: true,
                           }}
                           inputProps={{
                              min: new Date().toISOString().split('T')[0],
                           }}
                           helperText="Fecha límite para realizar la orden (opcional)"
                           error={!!fechaInvalida}
                        />
                     </Grid>

                     <Grid item xs={12}>
                        <TextField
                           fullWidth
                           multiline
                           rows={4}
                           label="Descripción de la Orden"
                           name="descripcion"
                           value={editFormData.descripcion}
                           onChange={handleEditChange}
                           required
                           helperText="Detalle los procedimientos, exámenes o tratamientos solicitados"
                           placeholder="Ej: Examen de sangre completo, radiografía de tórax, ecografía abdominal..."
                        />
                     </Grid>
                  </Grid>
               </Box>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseEditDialog} disabled={loading}>
                  Cancelar
               </Button>
               <Button
                  onClick={handleSaveEdit}
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
               >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
               </Button>
            </DialogActions>
         </Dialog>
      </Container>
   );
};

export default CrearOrdenPage;