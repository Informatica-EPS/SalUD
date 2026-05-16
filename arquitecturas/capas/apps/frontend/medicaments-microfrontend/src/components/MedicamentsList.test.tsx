import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MedicamentsList } from './MedicamentsList';

// Hacemos un "mock" del servicio para que no llame a la API real durante la prueba
vi.mock('../services/medicamentsService', () => ({
  medicamentsService: {
    getAll: vi.fn().mockResolvedValue([]), // Simula que la API devuelve una lista vacía
    search: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('Pruebas sobre MedicamentsList', () => {
  
  it('Prueba 1: Debe mostrar el spinner de carga inicial', () => {
    render(<MedicamentsList />);
    // Verifica que el CircularProgress de Material UI esté en pantalla (tiene rol "progressbar")
    const loader = screen.getByRole('progressbar');
    expect(loader).toBeDefined();
  });

  it('Prueba 2: Debe cargar y mostrar el título de la vista correctamente', async () => {
    render(<MedicamentsList />);
    // Espera a que el componente deje de cargar y busque el título
    const titulo = await screen.findByText('Gestión de Medicamentos');
    expect(titulo).toBeDefined();
  });

});