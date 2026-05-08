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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  LocalPharmacy as PharmacyIcon,
} from '@mui/icons-material';
import { medicamentsService } from '../services/medicamentsService';
import { Medicament } from '../types/medicament.types';

export const MedicamentsList: React.FC = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleDelete = async (id: string) => {
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
                  {medicament.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {medicament.description}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Dosificación:
                  </Typography>
                  <Typography variant="body2">{medicament.dosage}</Typography>
                </Box>
                {medicament.manufacturer && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Fabricante:
                    </Typography>
                    <Typography variant="body2">{medicament.manufacturer}</Typography>
                  </Box>
                )}
                {medicament.price !== undefined && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Precio:
                    </Typography>
                    <Typography variant="body2">${medicament.price.toFixed(2)}</Typography>
                  </Box>
                )}
                {medicament.stock !== undefined && (
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={`Stock: ${medicament.stock}`}
                      size="small"
                      color={medicament.stock > 10 ? 'success' : 'warning'}
                    />
                  </Box>
                )}
                {medicament.requiresPrescription && (
                  <Chip label="Requiere Prescripción" size="small" color="error" />
                )}
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => console.log('Ver', medicament.id)}>
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
    </Box>
  );
};
