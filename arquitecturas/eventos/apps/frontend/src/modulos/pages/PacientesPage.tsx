import { useState, useEffect } from 'react';
import {
   Box,
   Button,
   Card,
   CardContent,
   Container,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grid,
   IconButton,
   Paper,
   TextField,
   Typography,
   Alert,
   CircularProgress,
   Chip,
   FormControl,
   InputLabel,
   Select,
   MenuItem,
} from '@mui/material';
import {
   Add as AddIcon,
   Edit as EditIcon,
   Delete as DeleteIcon,
   Person as PersonIcon,
   Phone as PhoneIcon,
   Email as EmailIcon,
   Home as HomeIcon,
} from '@mui/icons-material';
import { patientsService } from '../../services';
import { IPatient, ICreatePatientRequest } from '../../interface';
import { BackButton } from '../../components';

export const PacientesPage = () => {
   const [patients, setPatients] = useState<IPatient[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [openDialog, setOpenDialog] = useState(false);
   const [editingPatient, setEditingPatient] = useState<IPatient | null>(null);
   const [success, setSuccess] = useState<string | null>(null);

   // Form state
   const [formData, setFormData] = useState<ICreatePatientRequest>({
      ocupacion: '',
      discapacidad: 'Ninguna',
      religion: '',
      etnicidad: '',
      identidadGenero: '',
      sexo: 'M',
      idUsuario: 1, // TODO: Obtener del contexto de autenticación
      creadoPor: 1,
      actualizadoPor: 1,
   });

   useEffect(() => {
      loadPatients();
   }, []);

   const loadPatients = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await patientsService.getAll();
         setPatients(data);
      } catch (err) {
         setError('Error al cargar pacientes');
         console.error('Error:', err);
      } finally {
         setLoading(false);
      }
   };

   const handleOpenDialog = (patient?: IPatient) => {
      if (patient) {
         setEditingPatient(patient);
         setFormData({
            ocupacion: patient.ocupacion,
            discapacidad: patient.discapacidad,
            religion: patient.religion,
            etnicidad: patient.etnicidad,
            identidadGenero: patient.identidadGenero,
            sexo: patient.sexo,
            idUsuario: patient.idUsuario,
            creadoPor: patient.creadoPor,
            actualizadoPor: 1,
         });
      } else {
         setEditingPatient(null);
         setFormData({
            ocupacion: '',
            discapacidad: 'Ninguna',
            religion: '',
            etnicidad: '',
            identidadGenero: '',
            sexo: 'M',
            idUsuario: 1,
            creadoPor: 1,
            actualizadoPor: 1,
         });
      }
      setOpenDialog(true);
   };

   const handleCloseDialog = () => {
      setOpenDialog(false);
      setEditingPatient(null);
   };

   const handleSubmit = async () => {
      try {
         if (editingPatient) {
            await patientsService.update(editingPatient.id, formData);
            setSuccess('Paciente actualizado exitosamente');
         } else {
            await patientsService.create(formData);
            setSuccess('Paciente creado exitosamente');
         }
         handleCloseDialog();
         await loadPatients();
         setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
         setError('Error al guardar paciente');
         console.error('Error:', err);
      }
   };

   const handleDelete = async (id: number) => {
      if (window.confirm('¿Está seguro de eliminar este paciente?')) {
         try {
            await patientsService.delete(id);
            setSuccess('Paciente eliminado exitosamente');
            await loadPatients();
            setTimeout(() => setSuccess(null), 3000);
         } catch (err) {
            setError('Error al eliminar paciente');
            console.error('Error:', err);
         }
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
            <BackButton to="/home" />
         </Box>
         <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
               <Typography variant="h4" gutterBottom fontWeight="bold">
                  Gestión de Pacientes
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Total: {patients.length} pacientes registrados
               </Typography>
            </Box>
            <Button
               variant="contained"
               startIcon={<AddIcon />}
               onClick={() => handleOpenDialog()}
               size="large"
            >
               Nuevo Paciente
            </Button>
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

         {/* Lista de Pacientes */}
         <Grid container spacing={3}>
            {patients.map((patient) => (
               <Grid item xs={12} md={6} key={patient.id}>
                  <Card elevation={2}>
                     <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start">
                           <Box display="flex" gap={2} flex={1}>
                              <Box
                                 sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.light',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                 }}
                              >
                                 <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                              </Box>
                              <Box flex={1}>
                                 <Typography variant="h6" gutterBottom>
                                    {(patient.User || patient.usuario)?.primer_nombre || (patient.User || patient.usuario)?.primerNombre}{' '}
                                    {(patient.User || patient.usuario)?.primer_apellido || (patient.User || patient.usuario)?.primerApellido}
                                 </Typography>
                                 <Box display="flex" flexDirection="column" gap={0.5}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                       <EmailIcon fontSize="small" color="action" />
                                       <Typography variant="body2" color="text.secondary">
                                          {patient.usuario?.correo}
                                       </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                       <PhoneIcon fontSize="small" color="action" />
                                       <Typography variant="body2" color="text.secondary">
                                          {patient.usuario?.telefono}
                                       </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                       <HomeIcon fontSize="small" color="action" />
                                       <Typography variant="body2" color="text.secondary">
                                          {patient.usuario?.direccion}
                                       </Typography>
                                    </Box>
                                 </Box>
                                 <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                                    <Chip
                                       label={patient.ocupacion}
                                       size="small"
                                       color="primary"
                                       variant="outlined"
                                    />
                                    <Chip
                                       label={patient.sexo === 'M' ? 'Masculino' : 'Femenino'}
                                       size="small"
                                       variant="outlined"
                                    />
                                 </Box>
                              </Box>
                           </Box>
                           <Box display="flex" gap={1}>
                              <IconButton
                                 size="small"
                                 color="primary"
                                 onClick={() => handleOpenDialog(patient)}
                              >
                                 <EditIcon />
                              </IconButton>
                              <IconButton
                                 size="small"
                                 color="error"
                                 onClick={() => handleDelete(patient.id)}
                              >
                                 <DeleteIcon />
                              </IconButton>
                           </Box>
                        </Box>
                     </CardContent>
                  </Card>
               </Grid>
            ))}
         </Grid>

         {patients.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
               <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
               <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay pacientes registrados
               </Typography>
               <Typography variant="body2" color="text.secondary" mb={3}>
                  Comienza agregando el primer paciente
               </Typography>
               <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                  Agregar Paciente
               </Button>
            </Paper>
         )}

         {/* Dialog Crear/Editar */}
         <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
               {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
            </DialogTitle>
            <DialogContent>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField
                     fullWidth
                     label="Ocupación"
                     value={formData.ocupacion}
                     onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
                     required
                  />
                  <TextField
                     fullWidth
                     label="Religión"
                     value={formData.religion}
                     onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  />
                  <TextField
                     fullWidth
                     label="Etnicidad"
                     value={formData.etnicidad}
                     onChange={(e) => setFormData({ ...formData, etnicidad: e.target.value })}
                  />
                  <TextField
                     fullWidth
                     label="Identidad de Género"
                     value={formData.identidadGenero}
                     onChange={(e) => setFormData({ ...formData, identidadGenero: e.target.value })}
                  />
                  <FormControl fullWidth>
                     <InputLabel>Sexo</InputLabel>
                     <Select
                        value={formData.sexo}
                        label="Sexo"
                        onChange={(e) => setFormData({ ...formData, sexo: e.target.value as 'M' | 'F' | 'O' })}
                     >
                        <MenuItem value="M">Masculino</MenuItem>
                        <MenuItem value="F">Femenino</MenuItem>
                        <MenuItem value="O">Otro</MenuItem>
                     </Select>
                  </FormControl>
                  <TextField
                     fullWidth
                     label="Discapacidad"
                     value={formData.discapacidad}
                     onChange={(e) => setFormData({ ...formData, discapacidad: e.target.value })}
                  />
               </Box>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseDialog}>Cancelar</Button>
               <Button onClick={handleSubmit} variant="contained">
                  {editingPatient ? 'Actualizar' : 'Crear'}
               </Button>
            </DialogActions>
         </Dialog>
      </Container>
   );
};

export default PacientesPage;
