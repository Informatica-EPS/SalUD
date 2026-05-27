import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  LocalPharmacy as PharmacyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { medicamentsService } from '../services/medicamentsService';
import { Medicament } from '../types/medicament.types';

export const MedicamentsList: React.FC = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadMedicaments();
  }, []);

  const loadMedicaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicamentsService.getAll();
      setMedicaments(data);
    } catch (err) {
      setError('Error al cargar los medicamentos');
      console.error('Error loading medicaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      loadMedicaments();
      return;
    }

    try {
      setLoading(true);
      const data = await medicamentsService.search(query);
      setMedicaments(data);
    } catch (err) {
      setError('Error al buscar medicamentos');
      console.error('Error searching medicaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este medicamento?')) {
      try {
        await medicamentsService.delete(id);
        loadMedicaments();
      } catch (err) {
        setError('Error al eliminar el medicamento');
        console.error('Error deleting medicament:', err);
      }
    }
  };

  const getStockColor = (inventario: number): 'success' | 'warning' | 'error' => {
    if (inventario >= 100) return 'success';
    if (inventario > 50) return 'warning';
    return 'error';
  };

  const handleOpenDetails = (medicament: Medicament) => {
    setSelectedMedicament(medicament);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedMedicament(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PharmacyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Gestión de Medicamentos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Agregar medicamento')}
        >
          Nuevo Medicamento
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Buscar medicamentos..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {medicaments.map((medicament) => (
          <Grid item xs={12} sm={6} md={4} key={medicament.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {medicament.nombre}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`Inventario: ${medicament.inventario?.total ?? 0}`}
                    size="medium"
                    color={getStockColor(medicament.inventario?.total ?? 0)}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total de movimientos:
                  </Typography>
                  <Typography variant="body2">
                    {medicament.movimientos.length} registros
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleOpenDetails(medicament)}>
                  Ver Detalles
                </Button>
                <Button size="small" onClick={() => console.log('Editar', medicament.id)}>
                  Editar
                </Button>
                <Button size="small" color="error" onClick={() => handleDelete(medicament.id)}>
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {medicaments.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PharmacyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No se encontraron medicamentos
          </Typography>
        </Box>
      )}

      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PharmacyIcon color="primary" />
            <Box>
              <Typography variant="h6">{selectedMedicament?.nombre}</Typography>
              <Typography variant="body2" color="text.secondary">
                Inventario actual: {selectedMedicament?.inventario?.total ?? 0} unidades
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMedicament && selectedMedicament.movimientos.length > 0 ? (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedMedicament.movimientos
                    .slice()
                    .reverse()
                    .map((movimiento) => (
                      <TableRow key={movimiento.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {movimiento.tipo_movimiento === 'entrada' ? (
                              <TrendingUpIcon color="success" />
                            ) : (
                              <TrendingDownIcon color="error" />
                            )}
                            <Chip
                              label={movimiento.tipo_movimiento.toUpperCase()}
                              size="small"
                              color={movimiento.tipo_movimiento === 'entrada' ? 'success' : 'error'}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {movimiento.tipo_movimiento === 'entrada' ? '+' : '-'}
                            {movimiento.cantidad}
                          </Typography>
                        </TableCell>
                        <TableCell>{movimiento.created_by}</TableCell>
                        <TableCell>{formatDate(movimiento.created_at)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No hay movimientos registrados para este medicamento
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
