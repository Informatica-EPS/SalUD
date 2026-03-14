import { useNavigate } from 'react-router-dom';
import './AdminHomePage.css';

export default function AdminHomePage() {
   const navigate = useNavigate();

   return (
      <div className="admin-home">
         <div className="admin-card">
            <h2>Panel de Administración</h2>
            <div className="admin-options">
               <button onClick={() => navigate('/admin/doctors')}>Ver Doctores</button>
               <button onClick={() => navigate('/admin/patients')}>Ver Pacientes</button>
            </div>
         </div>
      </div>
   );
}
