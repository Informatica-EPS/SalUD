import React, { useState, useEffect } from 'react';
import { DispatchDialog } from './DispatchDialog';
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
  useMediaQuery,
  Menu, 
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Swal from 'sweetalert2';
import {
  Search as SearchIcon,
  Add as AddIcon,
  LocalPharmacy as PharmacyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalShipping as LocalShippingIcon,
  MoreVert as MoreVertIcon,
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // const handleDelete = async (id: number) => {
  //   if (window.confirm('¿Está seguro de eliminar este medicamento?')) {
  //     try {
  //       await medicamentsService.delete(id);
  //       loadMedicaments();
  //     } catch (err) {
  //       setError('Error al eliminar el medicamento');
  //       console.error('Error deleting medicament:', err);
  //     }
  //   }
  // };

  const getStockColor = (inventario: Inventario): 'success' | 'warning' | 'error' => {
    if (inventario.total >= 100) return 'success';
    if (inventario.total > 50) return 'warning';
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [dispatchOpen, setDispatchOpen] = useState(false);

  const visibleMedicaments = medicaments.filter(
    (medicament) => medicament.id !== 1
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

   const handleEdit = async (medicamentId: number) => {
    const medicament = medicaments.find(m => m.id === medicamentId);
    if (!medicament) return;

    const { value: formValues } = await Swal.fire({
      title: 'Editar Medicamento',
      html: `
        <label style="display:block; text-align:left; margin-bottom:4px; font-weight:600;">Nombre</label>
        <input id="nombre" class="swal2-input" value="${medicament.nombre}">
        <label style="display:block; text-align:left; margin-bottom:4px; font-weight:600; margin-top:12px;">Inventario</label>
        <input id="inventario" class="swal2-input" type="number" min="0" value="${medicament.inventario.total}">
      `,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const inventario = Number((document.getElementById('inventario') as HTMLInputElement).value);
        if (!nombre.trim()) {
          Swal.showValidationMessage('El nombre es requerido');
          return false;
        }
        if (inventario < 0) {
          Swal.showValidationMessage('El inventario no puede ser negativo');
          return false;
        }
        return { nombre, inventario };
      },
    });

    if (!formValues) return;

    try {
      const [updated] = await Promise.all([
        medicamentsService.update(medicamentId, { nombre: formValues.nombre }),
        medicamentsService.updateInventory(medicamentId, formValues.inventario),
      ]);
      setMedicaments(prev => prev.map(m =>
        m.id === medicamentId ? { ...updated, inventario: { total: formValues.inventario } } : m
      ));
      Swal.fire('Éxito', 'Medicamento actualizado correctamente', 'success');
      await loadMedicaments(); 
    } catch {
      Swal.fire('Error', 'No se pudo actualizar el medicamento', 'error');
    }
  };

  const handleCreate = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Medicamento',
      html: `
        <label style="display:block; text-align:left; margin-bottom:4px; font-weight:600;">Nombre del medicamento</label>
        <input id="nombre" class="swal2-input" placeholder="Ej: Ibuprofeno 400mg">
        
        <label style="display:block; text-align:left; margin-bottom:4px; font-weight:600; margin-top:12px;">Inventario inicial</label>
        <input id="inventario" class="swal2-input" placeholder="0" type="number" min="0" value="0">
      `,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Crear',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const inventario = (document.getElementById('inventario') as HTMLInputElement).value;
        if (!nombre.trim()) {
          Swal.showValidationMessage('El nombre es requerido');
          return false;
        }
        return { nombre, inventario_inicial: Number(inventario) };
      },
    });

    if (!formValues) return;

    try {
      const created = await medicamentsService.create(formValues);
      setMedicaments(prev => [...prev, created]);
      Swal.fire('Éxito', 'Medicamento creado correctamente', 'success');
      await loadMedicaments();
    } catch {
      Swal.fire('Error', 'No se pudo crear el medicamento', 'error');
    }
  };

  return (
    <Box
  sx={{
    p: {
      xs: 2,
      md: 4,
    },
    background:
      'linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)',
    minHeight: '100vh',
  }}
>
      <Box
  sx={{
    mb: 4,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: {
      xs: 'flex-start',
      sm: 'center',
    },
    flexDirection: {
      xs: 'column',
      sm: 'row',
    },
    gap: 2,
  }}
>
  {/* Título */}
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
        borderRadius: '16px',
        p: 1.2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(25, 118, 210, 0.25)',
      }}
    >
      <PharmacyIcon sx={{ fontSize: 32, color: '#fff' }} />
    </Box>

    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          fontSize: {
            xs: '1.6rem',
            sm: '2rem',
          },
        }}
      >
        Gestión de Medicamentos
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Administra inventario y movimientos
      </Typography>
    </Box>
  </Box>

  {/* Desktop */}
  {!isMobile ? (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        variant="outlined"
        startIcon={<LocalShippingIcon />}
        onClick={() => setDispatchOpen(true)}
        sx={{
          borderRadius: '14px',
          px: 3,
          py: 1.2,
          textTransform: 'none',
          fontWeight: 600,
          borderWidth: '2px',
          transition: 'all .2s ease',
          '&:hover': {
            borderWidth: '2px',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
          },
        }}
      >
        Despachar
      </Button>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleCreate}
        sx={{
          borderRadius: '14px',
          px: 3,
          py: 1.2,
          textTransform: 'none',
          fontWeight: 700,
          boxShadow: '0 8px 20px rgba(25,118,210,0.25)',
          background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
          transition: 'all .2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 24px rgba(25,118,210,0.35)',
            background: 'linear-gradient(135deg, #1565c0, #1e88e5)',
          },
        }}
      >
        Nuevo Medicamento
      </Button>
      <DispatchDialog
        open={dispatchOpen}
        onClose={() => setDispatchOpen(false)}
        medicaments={medicaments}
        onSuccess={loadMedicaments}
      />
    </Box>
  ) : (
    <>
      {/* Mobile */}
      <IconButton
        onClick={handleMenuOpen}
        sx={{
          alignSelf: 'flex-end',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
          backgroundColor: 'background.paper',
          boxShadow: 1,
        }}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            mt: 1,
            minWidth: 220,
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleCreate();
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <LocalShippingIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Despachar</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCreate();
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Nuevo Medicamento</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )}
</Box>

<Grid container spacing={2} sx={{ mb: 4 }}>
  <Grid item xs={12} md={4}>
    <Paper
      sx={{
        p: 3,
        borderRadius: '20px',
      }}
    >
      <Typography color="text.secondary">
        Total medicamentos
      </Typography>

      <Typography variant="h4" fontWeight={700}>
        {visibleMedicaments.length}
      </Typography>
    </Paper>
  </Grid>

  <Grid item xs={12} md={4}>
    <Paper
      sx={{
        p: 3,
        borderRadius: '20px',
      }}
    >
      <Typography color="text.secondary">
        Inventario bajo
      </Typography>

      <Typography variant="h4" fontWeight={700}>
        {
          visibleMedicaments.filter(
            (m) => m.inventario.total <= 50
          ).length
        }
      </Typography>
    </Paper>
  </Grid>

  <Grid item xs={12} md={4}>
    <Paper
      sx={{
        p: 3,
        borderRadius: '20px',
      }}
    >
      <Typography color="text.secondary">
        Movimientos
      </Typography>

      <Typography variant="h4" fontWeight={700}>
        {
          visibleMedicaments.reduce(
            (acc, m) => acc + m.movimientos.length,
            0
          )
        }
      </Typography>
    </Paper>
  </Grid>
</Grid>

      <Paper
  elevation={0}
  sx={{
    p: 1,
    px: 2,
    mb: 4,
    borderRadius: '20px',
    border: '1px solid #e3edf7',
    background: 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
  }}
>
  <TextField
    fullWidth
    placeholder="Buscar medicamentos..."
    value={searchQuery}
    onChange={(e) => handleSearch(e.target.value)}
    variant="standard"
    InputProps={{
      disableUnderline: true,
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon sx={{ color: '#1976d2' }} />
        </InputAdornment>
      ),
    }}
  />
</Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
  {medicaments
    .filter((medicament) => medicament.id !== 1)
    .filter((medicament) =>
          medicament.nombre.toLowerCase().includes(searchQuery.toLowerCase())
        )
    .map((medicament) => (
      <Grid item xs={12} sm={6} md={4} key={medicament.id}>
        <Card
  sx={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.7)',
    boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
    transition: 'all .25s ease',
    overflow: 'hidden',

    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: '0 18px 40px rgba(15,23,42,0.14)',
    },
  }}
>
          <CardContent
  sx={{
    flexGrow: 1,
    p: 3,
  }}
>
            <Typography
  variant="h6"
  component="h2"
  sx={{
    fontWeight: 700,
    color: '#16324f',
    mb: 2,
    lineHeight: 1.3,
  }}
>
              {medicament.nombre}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Chip
  label={`Unidades: ${medicament.inventario.total}`}
color={getStockColor(medicament.inventario)}
  sx={{
    fontWeight: 700,
    borderRadius: '10px',
    px: 1,
    fontSize: '0.82rem',
  }}
/>
{/* <Box sx={{ mt: 2 }}>
  <Box
    sx={{
      height: 8,
      borderRadius: 999,
      background: '#edf2f7',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        width: `${Math.min(medicament.inventario, 100)}%`,
        height: '100%',
        borderRadius: 999,
        background:
          medicament.inventario >= 100
            ? 'linear-gradient(90deg,#22c55e,#4ade80)'
            : medicament.inventario > 50
            ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
            : 'linear-gradient(90deg,#ef4444,#f87171)',
      }}
    />
  </Box>
</Box> */}
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
          <CardActions
  sx={{
    px: 3,
    pb: 3,
    pt: 0,
    gap: 1.5,
  }}
>
  <Button
    fullWidth
    variant="outlined"
    onClick={() => handleOpenDetails(medicament)}
    sx={{
      borderRadius: '12px',
      textTransform: 'none',
      fontWeight: 600,
    }}
  >
    Ver detalles
  </Button>

  <Button
    fullWidth
    variant="contained"
    onClick={() => handleEdit(medicament.id)}
    sx={{
      borderRadius: '12px',
      textTransform: 'none',
      fontWeight: 700,
      background:
        'linear-gradient(135deg,#1976d2,#42a5f5)',
    }}
  >
    Editar
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
        PaperProps={{
  sx: {
    borderRadius: '24px',
    overflow: 'hidden',
  },
}}
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
            <TableContainer component={Paper} elevation={0} sx={{
  borderRadius: '18px',
  border: '1px solid #edf2f7',
}}>
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
            <Button
    variant="outlined"
    onClick={handleCloseDetails}
    sx={{
      borderRadius: '12px',
      textTransform: 'none',
      fontWeight: 600,
    }}
  >Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
