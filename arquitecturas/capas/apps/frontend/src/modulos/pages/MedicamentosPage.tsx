import React, { useState } from 'react';
import {
   Box,
   Button,
   Container,
   Typography,
   Paper,
   TextField,
   Alert,
   Card,
   CardContent,
   Grid,
   Chip,
   Divider,
   Avatar,
   CircularProgress,
} from '@mui/material';
import {
   Search as SearchIcon,
   LocalHospital as HospitalIcon,
   Assignment as OrderIcon,
   CheckCircle as CheckIcon,
   Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../../components';

export default function MedicamentosPage() {
   const navigate = useNavigate();
   const [documentoSearch, setDocumentoSearch] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
   const [results, setResults] = useState<any[]>([]);

   // Datos de prueba (Mocks)
   const mockOrders = [
      {
         id: 1,
         especialidad: 'Cardiología',
         descripcion: 'Medicamento Corazón 1 50mg - 1 tableta cada 12 horas por 30 días',
         estado: 'AUTORIZADA',
         fecha: '2026-05-15',
         doctor: 'Dr. Carlos Ramírez',
      },
      {
         id: 2,
         especialidad: 'Inmunología',
         descripcion: 'Loratadina 10mg - 1 tableta diaria por 10 días',
         estado: 'PENDIENTE',
         fecha: '2026-05-20',
         doctor: 'Dra. Laura Torres',
      }
   ];

   const handleSearch = () => {
      if (!documentoSearch.trim()) {
         setError('Por favor ingrese un número de documento');
         setResults([]);
         return;
      }
      
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Simulamos la búsqueda
      setTimeout(() => {
         setResults(mockOrders);
         setLoading(false);
         setSuccess(`Se encontraron ${mockOrders.length} órdenes para el paciente con documento: ${documentoSearch}`);
      }, 800);
   };

   const getStatusColor = (estado: string) => {
      switch (estado.toUpperCase()) {
         case 'AUTORIZADA': return 'success';
         case 'PENDIENTE': return 'warning';
         case 'ENTREGADA': return 'info';
         default: return 'default';
      }
   };

   return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
         {/* Header */}
         <Box mb={2}>
            <BackButton to="/home" />
         </Box>
         <Box mb={4}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
               💊 Entrega de Medicamentos
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
               Consulte y gestione la entrega de medicamentos por paciente
            </Typography>
         </Box>

         {/* Buscador */}
         <Paper
            sx={{
               p: 4,
               mb: 4,
               borderRadius: 3,
               boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
               background: 'linear-gradient(135deg, #ffffff, #f1f8f9)',
            }}
         >
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
               Consultar órdenes pendientes
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
               <TextField
                  fullWidth
                  variant="outlined"
                  label="Consultar orden por documento"
                  placeholder="Ingrese el número de documento del paciente"
                  value={documentoSearch}
                  onChange={(e) => {
                     setDocumentoSearch(e.target.value);
                     setError(null);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                     startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  sx={{ 
                     bgcolor: 'white',
                     '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                     }
                  }}
               />
               <Button
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
                  size="large"
                  sx={{ 
                     px: 4, 
                     height: '56px', 
                     borderRadius: 2,
                     textTransform: 'none',
                     fontSize: '1.1rem',
                     boxShadow: '0 4px 12px rgba(14, 143, 154, 0.3)'
                  }}
                  onClick={handleSearch}
               >
                  {loading ? 'Buscando...' : 'Buscar'}
               </Button>
            </Box>
         </Paper>

         {/* Alerts */}
         {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
         {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

         {/* Resultados */}
         {loading ? (
            <Box textAlign="center" py={10}>
               <CircularProgress size={50} thickness={4} />
               <Typography sx={{ mt: 2 }} color="text.secondary">Buscando en la base de datos...</Typography>
            </Box>
         ) : results.length > 0 ? (
            <Grid container spacing={3}>
               <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                     <OrderIcon color="primary" /> Órdenes Encontradas
                  </Typography>
               </Grid>
               {results.map((order) => (
                  <Grid item xs={12} key={order.id}>
                     <Card sx={{ 
                        borderRadius: 3, 
                        overflow: 'hidden', 
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.01)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }
                     }}>
                        <Box sx={{ p: 0.5, bgcolor: getStatusColor(order.estado) + '.main' }} />
                        <CardContent sx={{ p: 3 }}>
                           <Grid container spacing={2}>
                              <Grid item xs={12} md={8}>
                                 <Box display="flex" alignItems="center" gap={2} mb={2}>
                                    <Avatar sx={{ bgcolor: 'rgba(14, 143, 154, 0.1)', color: '#0e8f9a' }}>
                                       <HospitalIcon />
                                    </Avatar>
                                    <Box>
                                       <Typography variant="h6" fontWeight="bold">{order.especialidad}</Typography>
                                       <Typography variant="body2" color="text.secondary">Fecha de emisión: {order.fecha}</Typography>
                                    </Box>
                                    <Chip 
                                       label={order.estado} 
                                       color={getStatusColor(order.estado) as any} 
                                       variant="outlined" 
                                       size="small" 
                                       sx={{ fontWeight: 'bold' }}
                                    />
                                 </Box>
                                 <Typography variant="body1" sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, borderLeft: '4px solid #0e8f9a' }}>
                                    {order.descripcion}
                                 </Typography>
                                 <Box display="flex" alignItems="center" gap={1}>
                                    <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">Prescrito por: <strong>{order.doctor}</strong></Typography>
                                 </Box>
                              </Grid>
                              <Grid item xs={12} md={4} display="flex" flexDirection="column" justifyContent="center" alignItems={{ xs: 'stretch', md: 'flex-end' }}>
                                 <Button 
                                    variant="contained" 
                                    color="success" 
                                    size="large"
                                    startIcon={<CheckIcon />}
                                    sx={{ borderRadius: 2, px: 4 }}
                                    onClick={() => alert(`Entregando medicamento de la orden #${order.id}`)}
                                 >
                                    Entregar Medicamento
                                 </Button>
                              </Grid>
                           </Grid>
                        </CardContent>
                     </Card>
                  </Grid>
               ))}
            </Grid>
         ) : !loading && !success && (
            <Box sx={{ 
               textAlign: 'center', 
               py: 10, 
               color: 'text.disabled',
               border: '2px dashed',
               borderColor: 'grey.300',
               borderRadius: 4
            }}>
               <SearchIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
               <Typography variant="h6">
                  Ingrese un documento para ver las órdenes disponibles
               </Typography>
            </Box>
         )}
      </Container>
   );
}
