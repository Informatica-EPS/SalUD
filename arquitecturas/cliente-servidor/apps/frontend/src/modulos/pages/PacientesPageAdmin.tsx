import { useEffect, useState } from 'react';
import { api } from '../../services/apiClient';
import Swal from 'sweetalert2';
import './PacientesPageAdmin.css';
import { useNavigate } from 'react-router-dom';

export default function PacientesPageAdmin() {
   const [patients, setPatients] = useState<any[]>([]);
   const navigate = useNavigate();

   useEffect(() => {
      const fetchPatients = async () => {
         try {
            const res = await api.get('/patients');
            setPatients(Array.isArray(res) ? res : []);
         } catch (err) {
            console.error('Error cargando pacientes:', err);
            setPatients([]);
         }
      };
      fetchPatients();
   }, []);

   const handleView = async (pat: any) => {
      try {
         const res = await api.get(`/patients/${pat.id}`);
         const paciente = res;

         Swal.fire({
            title: 'Detalle Paciente',
            html: `
          <div style="text-align:left; font-size:14px; line-height:1.6;">
            <strong>Nombre:</strong> ${paciente.User?.primer_nombre || ''} ${paciente.User?.primer_apellido || ''}<br>
            <strong>Documento:</strong> ${paciente.User?.documento || ''}<br>
            <strong>Email:</strong> ${paciente.User?.email || ''}<br>
            <strong>Dirección:</strong> ${paciente.User?.direccion || ''}<br>
            <hr>
            <strong>Ocupación:</strong> ${paciente.ocupacion || ''}<br>
            <strong>Discapacidad:</strong> ${paciente.discapacidad || ''}<br>
            <strong>Religión:</strong> ${paciente.religion || ''}<br>
            <strong>Etnia:</strong> ${paciente.etnia || ''}<br>
            <strong>Identidad de Género:</strong> ${paciente.identidadGenero || ''}<br>
            <strong>Sexo:</strong> ${paciente.sexo || ''}
          </div>
        `,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#0e8f9a',
         });
      } catch (err) {
         Swal.fire('Error', 'No se pudo cargar el detalle del paciente', 'error');
      }
   };

   const handleDelete = async (id: number) => {
      try {
         await api.delete(`/patients/${id}`);
         setPatients(patients.filter(p => p.id !== id));
         Swal.fire('Éxito', 'Paciente eliminado correctamente', 'success');
      } catch (err) {
         Swal.fire('Error', 'No se pudo eliminar el paciente', 'error');
      }
   };

   const handleCreatePatient = async () => {
      const { value: formValues } = await Swal.fire({
         title: 'Registrar Paciente',
         html: `
        <input id="primer_nombre" class="swal2-input" placeholder="Primer Nombre">
        <input id="primer_apellido" class="swal2-input" placeholder="Primer Apellido">
        <input id="documento" class="swal2-input" placeholder="Documento">
        <input id="usuario" class="swal2-input" placeholder="Usuario">
        <input id="email" class="swal2-input" placeholder="Email">
        <input id="password" type="password" class="swal2-input" placeholder="Contraseña">
        <input id="ocupacion" class="swal2-input" placeholder="Ocupación">
        <input id="discapacidad" class="swal2-input" placeholder="Discapacidad">
        <input id="religion" class="swal2-input" placeholder="Religión">
        <input id="etnia" class="swal2-input" placeholder="Etnia">
        <input id="identidadGenero" class="swal2-input" placeholder="Identidad de Género">
        <input id="sexo" class="swal2-input" placeholder="Sexo">
      `,
         focusConfirm: false,
         preConfirm: () => {
            const documento = (document.getElementById('documento') as HTMLInputElement).value;
            if (!documento) {
               Swal.showValidationMessage('El documento es obligatorio');
               return null;
            }
            return {
               userData: {
                  primer_nombre: (document.getElementById('primer_nombre') as HTMLInputElement)
                     .value,
                  primer_apellido: (document.getElementById('primer_apellido') as HTMLInputElement)
                     .value,
                  documento,
                  tipo_documento: 'CC',
                  usuario: (document.getElementById('usuario') as HTMLInputElement).value,
                  email: (document.getElementById('email') as HTMLInputElement).value,
                  password: (document.getElementById('password') as HTMLInputElement).value,
               },
               patientData: {
                  ocupacion: (document.getElementById('ocupacion') as HTMLInputElement).value,
                  discapacidad: (document.getElementById('discapacidad') as HTMLInputElement).value,
                  religion: (document.getElementById('religion') as HTMLInputElement).value,
                  etnia: (document.getElementById('etnia') as HTMLInputElement).value,
                  identidadGenero: (document.getElementById('identidadGenero') as HTMLInputElement)
                     .value,
                  sexo: (document.getElementById('sexo') as HTMLInputElement).value,
               },
            };
         },
      });

      if (!formValues) return;

      try {
         console.log('Payload enviado al backend:', formValues);

         await api.post('/patients/register', formValues);

         // 👇 Recargar lista desde el backend
         const res = await api.get('/patients');
         setPatients(Array.isArray(res) ? res : []);

         Swal.fire('Éxito', 'Paciente creado correctamente', 'success');
      } catch (err: any) {
         if (err.response?.status === 409) {
            Swal.fire('Error', 'Usuario, email o documento ya existen', 'error');
         } else {
            Swal.fire('Error', 'No se pudo crear el paciente', 'error');
         }
      }
   };

   // Editar paciente
   const handleEdit = async (pat: any) => {
      const { value: formValues } = await Swal.fire({
         title: 'Editar Paciente',
         html: `
        <input id="ocupacion" class="swal2-input" placeholder="Ocupación" value="${pat.ocupacion || ''}">
        <input id="discapacidad" class="swal2-input" placeholder="Discapacidad" value="${pat.discapacidad || ''}">
        <input id="religion" class="swal2-input" placeholder="Religión" value="${pat.religion || ''}">
        <input id="etnia" class="swal2-input" placeholder="Etnia" value="${pat.etnia || ''}">
        <input id="identidadGenero" class="swal2-input" placeholder="Identidad de Género" value="${pat.identidadGenero || ''}">
        <input id="sexo" class="swal2-input" placeholder="Sexo" value="${pat.sexo || ''}">
      `,
         focusConfirm: false,
         preConfirm: () => {
            return {
               patientData: {
                  ocupacion: (document.getElementById('ocupacion') as HTMLInputElement).value,
                  discapacidad: (document.getElementById('discapacidad') as HTMLInputElement).value,
                  religion: (document.getElementById('religion') as HTMLInputElement).value,
                  etnia: (document.getElementById('etnia') as HTMLInputElement).value,
                  identidadGenero: (document.getElementById('identidadGenero') as HTMLInputElement)
                     .value,
                  sexo: (document.getElementById('sexo') as HTMLInputElement).value,
               },
            };
         },
      });

      if (!formValues) return;

      try {
         const res = await api.put(`/patients/${pat.id}`, formValues);
         setPatients(patients.map(p => (p.id === pat.id ? res : p)));
         Swal.fire('Éxito', 'Paciente actualizado correctamente', 'success');
      } catch (err) {
         Swal.fire('Error', 'No se pudo actualizar el paciente', 'error');
      }
   };

   return (
      <div className="admin-page">
         <div className="header">
            <h2>Pacientes Registrados</h2>
            <button className="home-btn" onClick={() => navigate('/')}>
               🏠 Home
            </button>
            <button className="create-btn" onClick={handleCreatePatient}>
               ➕ Crear Paciente
            </button>
         </div>

         {patients && patients.length > 0 ? (
            <table className="styled-table">
               <thead>
                  <tr>
                     <th>ID</th>
                     <th>Nombre</th>
                     <th>Email</th>
                     <th>Ocupación</th>
                     <th>Acciones</th>
                  </tr>
               </thead>
               <tbody>
                  {patients.map(pat => (
                     <tr key={pat.id}>
                        <td>{pat.id}</td>
                        <td>
                           {pat.User ? `${pat.User.primer_nombre} ${pat.User.primer_apellido}` : ''}
                        </td>
                        <td>{pat.User?.email}</td>
                        <td>{pat.ocupacion}</td>
                        <td>
                           <button className="view-btn" onClick={() => handleView(pat)}>
                              Ver
                           </button>
                           <button className="edit-btn" onClick={() => handleEdit(pat)}>
                              Editar
                           </button>
                           <button className="delete-btn" onClick={() => handleDelete(pat.id)}>
                              Eliminar
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         ) : (
            <p>No hay pacientes registrados.</p>
         )}
      </div>
   );
}
