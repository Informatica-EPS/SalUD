import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MedicamentsList } from './components/MedicamentsList';

export const MedicamentsModule: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MedicamentsList />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default MedicamentsModule;
