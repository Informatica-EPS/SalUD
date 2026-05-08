export interface Medicament {
  id: string;
  name: string;
  description: string;
  dosage: string;
  sideEffects?: string;
  contraindications?: string;
  manufacturer?: string;
  price?: number;
  stock?: number;
  requiresPrescription: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicamentCreate {
  name: string;
  description: string;
  dosage: string;
  sideEffects?: string;
  contraindications?: string;
  manufacturer?: string;
  price?: number;
  stock?: number;
  requiresPrescription: boolean;
}

export interface MedicamentUpdate extends Partial<MedicamentCreate> {}
