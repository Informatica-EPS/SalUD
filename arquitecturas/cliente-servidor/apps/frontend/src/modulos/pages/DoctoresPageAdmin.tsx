import { useEffect, useState } from 'react';
import { api } from '../../services/apiClient';
import Swal from 'sweetalert2';
import './DoctoresPageAdmin.css';
import { useNavigate } from 'react-router-dom';

export default function DoctorsPageAdmin() {
   const [doctors, setDoctors] = useState<any[]>([]);
   const navigate = useNavigate();

   useEffect(() => {
      const fetchDoctors = async () => {
         try {
            const res = await api.get('/doctors');
            setDoctors(Array.isArray(res) ? res : []);
         } catch (err) {
            console.error('Error cargando doctores:', err);
            setDoctors([]);
         }
      };
      fetchDoctors();
   }, []);

   const handleView = async (doc: any) => {
      try {
         const res = await api.get(`/doctors/${doc.id}`);
         const doctor = res;

         Swal.fire({
            title: 'Detalle Doctor',
            html: `
        <div style="text-align:left; font-size:14px; line-height:1.6;">
          <strong>Nombre:</strong> ${doctor.User?.primer_nombre || ''} ${doctor.User?.primer_apellido || ''}<br>
          <strong>Documento:</strong> ${doctor.User?.documento || ''}<br>
          <strong>Email:</strong> ${doctor.User?.email || ''}<br>
          <strong>Dirección:</strong> ${doctor.User?.direccion || ''}<br>
          <hr>
          <strong>Licencia Médica:</strong> ${doctor.licenciaMedica || ''}<br>
          <strong>Especialidad:</strong> ${doctor.especialidad || ''}
        </div>
      `,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#0e8f9a',
         });
      } catch (err) {
         Swal.fire('Error', 'No se pudo cargar el detalle del doctor', 'error');
      }
   };

   const handleCreateDoctor = async () => {
      const { value: formValues } = await Swal.fire({
         title: 'Registrar Doctor',
         html: `
      <input id="primer_nombre" class="swal2-input" placeholder="Primer Nombre">
      <input id="primer_apellido" class="swal2-input" placeholder="Primer Apellido">
      <input id="documento" class="swal2-input" placeholder="Documento">
      <input id="usuario" class="swal2-input" placeholder="Usuario">
      <input id="email" class="swal2-input" placeholder="Email">
      <input id="password" type="password" class="swal2-input" placeholder="Contraseña">
      <input id="licencia" class="swal2-input" placeholder="Licencia Médica">
      <input id="especialidad" class="swal2-input" placeholder="Especialidad">
    `,
         focusConfirm: false,
         preConfirm: () => {
            const licencia = (document.getElementById('licencia') as HTMLInputElement).value;
            if (!licencia) {
               Swal.showValidationMessage('La licencia médica es obligatoria');
               return null;
            }
            return {
               userData: {
                  primer_nombre: (document.getElementById('primer_nombre') as HTMLInputElement)
                     .value,
                  primer_apellido: (document.getElementById('primer_apellido') as HTMLInputElement)
                     .value,
                  documento: (document.getElementById('documento') as HTMLInputElement).value,
                  tipo_documento: 'CC',
                  usuario: (document.getElementById('usuario') as HTMLInputElement).value,
                  email: (document.getElementById('email') as HTMLInputElement).value,
                  password: (document.getElementById('password') as HTMLInputElement).value,
               },
               doctorData: {
                  licenciaMedica: licencia,
                  especialidad: (document.getElementById('especialidad') as HTMLInputElement).value,
               },
            };
         },
      });

      if (!formValues) return;

      try {
         await api.post('/doctors/register', formValues);
         const res = await api.get('/doctors');
         setDoctors(Array.isArray(res) ? res : []);
         Swal.fire('Éxito', 'Doctor creado correctamente', 'success');
      } catch (err) {
         Swal.fire('Error', 'No se pudo crear el doctor', 'error');
      }
   };

   const handleEdit = async (doc: any) => {
      const { value: formValues } = await Swal.fire({
         title: 'Editar Doctor',
         html: `
        <input id="licencia" class="swal2-input" placeholder="Licencia Médica" value="${doc.licenciaMedica}">
        <input id="especialidad" class="swal2-input" placeholder="Especialidad" value="${doc.especialidad || ''}">
        <input id="nombre" class="swal2-input" placeholder="Primer Nombre" value="${doc.User?.primer_nombre || ''}">
        <input id="apellido" class="swal2-input" placeholder="Primer Apellido" value="${doc.User?.primer_apellido || ''}">
        <input id="email" class="swal2-input" placeholder="Email" value="${doc.User?.email || ''}">
        <input id="direccion" class="swal2-input" placeholder="Dirección" value="${doc.User?.direccion || ''}">
      `,
         focusConfirm: false,
         preConfirm: () => {
            return {
               doctorData: {
                  licenciaMedica: (document.getElementById('licencia') as HTMLInputElement).value,
                  especialidad: (document.getElementById('especialidad') as HTMLInputElement).value,
               },
               userData: {
                  primer_nombre: (document.getElementById('nombre') as HTMLInputElement).value,
                  primer_apellido: (document.getElementById('apellido') as HTMLInputElement).value,
                  email: (document.getElementById('email') as HTMLInputElement).value,
                  direccion: (document.getElementById('direccion') as HTMLInputElement).value,
               },
            };
         },
      });

      if (!formValues) return;

      try {
         const res = await api.put(`/doctors/${doc.id}`, formValues);
         setDoctors(doctors.map(d => (d.id === doc.id ? res : d)));
         Swal.fire('Éxito', 'Doctor actualizado correctamente', 'success');
      } catch (err) {
         Swal.fire('Error', 'No se pudo actualizar el doctor', 'error');
      }
   };

   const handleDelete = async (id: number) => {
      try {
         await api.delete(`/doctors/${id}`);
         setDoctors(doctors.filter(d => d.id !== id));
         Swal.fire('Éxito', 'Doctor eliminado correctamente', 'success');
      } catch (err) {
         Swal.fire('Error', 'No se pudo eliminar el doctor', 'error');
      }
   };

   return (
      <div className="admin-page">
         <div className="header">
            <h2>Doctores Registrados</h2>
            <button className="home-btn" onClick={() => navigate('/')}>
               🏠 Home
            </button>
            <button className="create-btn" onClick={handleCreateDoctor}>
               ➕ Crear Doctor
            </button>
         </div>

         {doctors && doctors.length > 0 ? (
            <table className="styled-table">
               <thead>
                  <tr>
                     <th>ID</th>
                     <th>Nombre</th>
                     <th>Licencia Médica</th>
                     <th>Acciones</th>
                  </tr>
               </thead>
               <tbody>
                  {doctors.map(doc => (
                     <tr key={doc.id}>
                        <td>{doc.id}</td>
                        <td>
                           {doc.User ? `${doc.User.primer_nombre} ${doc.User.primer_apellido}` : ''}
                        </td>
                        <td>{doc.licenciaMedica}</td>
                        <td>
                           <button className="view-btn" onClick={() => handleView(doc)}>
                              Ver
                           </button>
                           <button className="edit-btn" onClick={() => handleEdit(doc)}>
                              Editar
                           </button>
                           <button className="delete-btn" onClick={() => handleDelete(doc.id)}>
                              Eliminar
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         ) : (
            <p>No hay doctores registrados.</p>
         )}
      </div>
   );
}
