import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, CircularProgress,
  Card, CardActionArea, CardContent, Chip, Alert,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  MedicationOutlined as PillIcon,
} from '@mui/icons-material';
import { ordersService } from '../services/ordersService';
import { medicamentsService } from '../services/medicamentsService';
import { OrdenMedicamento } from '../types/medicament.types';
import { Medicament } from '../types/medicament.types';
import Swal from 'sweetalert2';

interface Props {
  open: boolean;
  onClose: () => void;
  medicaments: Medicament[];
  onSuccess: () => Promise<void>;
}

export const DispatchDialog: React.FC<Props> = ({ open, onClose, medicaments, onSuccess }) => {
  const [documento, setDocumento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pacienteNombre, setPacienteNombre] = useState<string | null>(null);
  const [ordenes, setOrdenes] = useState<OrdenMedicamento[]>([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenMedicamento | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [dispatching, setDispatching] = useState(false);

  
  
  const handleClose = () => {
    setDocumento('');
    setError(null);
    setPacienteNombre(null);
    setOrdenes([]);
    setOrdenSeleccionada(null);
    setCantidad(1);
    onClose();
  };

  const handleBuscar = async () => {
    if (!documento.trim()) return;
    setLoading(true);
    setError(null);
    setOrdenes([]);
    setOrdenSeleccionada(null);
    setPacienteNombre(null);

    try {
      const res = await ordersService.getByPatientDocument(Number(documento));
      const ordenes = res.message.ordenes;

      if (ordenes.length === 0) {
        setError('No se encontraron órdenes para este documento.');
        return;
      }

      const p = ordenes[0].Appointment.Patient.User;
      setPacienteNombre(`${p.primer_nombre} ${p.segundo_nombre} ${p.primer_apellido} ${p.segundo_apellido}`);
      setOrdenes(ordenes);
    } catch {
      setError('No se pudo consultar el paciente. Verifica el documento.');
    } finally {
      setLoading(false);
    }
  };

  const medicamentoDeOrden = (orden: OrdenMedicamento) =>
    medicaments.find(m => m.id === orden.idMedicamento);

  const handleConfirmar = async () => {
    if (!ordenSeleccionada) return;

    const med = medicamentoDeOrden(ordenSeleccionada);
    if (!med) return;

    if (cantidad > med.inventario) {
      setError(`Stock insuficiente. Solo hay ${med.inventario} unidades disponibles.`);
      return;
    }

    setDispatching(true);
      try {
        await medicamentsService.dispatch({
          idMedicamento: ordenSeleccionada.idMedicamento,
          idOrden: ordenSeleccionada.id,
          idPaciente: ordenSeleccionada.Appointment.Patient.id,
          cantidad,
        });
        await onSuccess();
        handleClose();
        Swal.fire('Éxito', 'Medicamento despachado correctamente', 'success');
      } catch (e: any) {
        const msg = e?.response?.data?.detail || 'No se pudo despachar el medicamento.';
        setError(msg);
      } finally {
        setDispatching(false);
      }
    };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShippingIcon color="primary" />
        Despacho de medicamentos
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Consulta las órdenes del paciente por número de documento
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            label="Número de documento"
            value={documento}
            onChange={e => setDocumento(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBuscar()}
            size="small"
          />
          <Button variant="contained" onClick={handleBuscar} disabled={loading} sx={{ whiteSpace: 'nowrap' }}>
            {loading ? <CircularProgress size={20} /> : 'Buscar'}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {pacienteNombre && (
          <Box sx={{ bgcolor: 'background.default', borderRadius: 1, p: 1.5, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Paciente encontrado</Typography>
            <Typography variant="body1" fontWeight={500}>{pacienteNombre}</Typography>
          </Box>
        )}

        {ordenes.length > 0 && (
  <>
    <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
      Órdenes del paciente
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
      {ordenes.map(orden => {
        const med = medicamentoDeOrden(orden);
        const isAutorizada = orden.estado === 'autorizada';
        const isSelected = ordenSeleccionada?.id === orden.id;

        const chipColor: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
          autorizada: 'success',
          pendiente: 'info',
          completada: 'default',
          cancelada: 'error',
        };

        return (
          <Card
            key={orden.id}
            variant="outlined"
            sx={{
              border: isSelected ? '2px solid' : '1px solid',
              borderColor: isSelected ? 'primary.main' : 'divider',
              opacity: isAutorizada ? 1 : 0.45,
            }}
          >
            <CardActionArea
              disabled={!isAutorizada}
              onClick={() => { setOrdenSeleccionada(orden); setCantidad(orden.cantidad_medicamento || 1); setError(null); }}
            >
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Orden #{orden.id} — {med?.nombre ?? `Medicamento #${orden.idMedicamento}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cita: {orden.Appointment.TimeSlot.fecha} · {orden.Appointment.tipoCita.replace('_', ' ')}
                    </Typography>
                    {orden.descripcion && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {orden.descripcion}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={orden.estado}
                    size="small"
                    color={chipColor[orden.estado] ?? 'default'}
                  />
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  </>
)}

        {ordenSeleccionada && (() => {
          const med = medicamentoDeOrden(ordenSeleccionada);
          return med ? (
            <>
              <Box sx={{ bgcolor: 'info.lighter', borderRadius: 1, p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PillIcon color="info" />
                <Box>
                  <Typography variant="body2" fontWeight={500} color="info.main">{med.nombre}</Typography>
                  <Typography variant="caption" color="info.main">Inventario disponible: {med.inventario} unidades</Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Cantidad a despachar"
                type="number"
                value={cantidad}
                onChange={e => setCantidad(Math.max(1, Math.min(med.inventario, Number(e.target.value))))}
                inputProps={{ min: 1 }}
                size="small"
                helperText={`Cantidad autorizada en la orden`}
                InputProps={{ readOnly: true }}
              />
            </>
          ) : null;
        })()}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!ordenSeleccionada || dispatching}
          onClick={handleConfirmar}
        >
          {dispatching ? <CircularProgress size={20} /> : 'Confirmar despacho'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};