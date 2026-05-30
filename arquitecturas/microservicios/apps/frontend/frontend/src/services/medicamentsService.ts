import axios from 'axios';

const API_URL = import.meta.env.VITE_MEDICAMENTS_API_URL || 'http://localhost:5010';

const medicamentsClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface Medicament {
  id: number;
  nombre: string; // ajusta si el campo se llama diferente
}

export const medicamentsService = {
  getAll: async (): Promise<Medicament[]> => {
    const response = await medicamentsClient.get<Medicament[]>('/apiiiiiiiii/medicaments');
    return response.data;
  },
};