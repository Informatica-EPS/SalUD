import { useState } from 'react';
import { api } from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './RegisterPage.css';

export default function RegisterPage() {
   const [role, setRole] = useState('Paciente');
   const [userData, setUserData] = useState({
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      documento: '',
      tipo_documento: 'CC',
      usuario: '',
      email: '',
      password: '',
      fecha_nacimiento: '',
      lugar_nacimiento: '',
      direccion: '',
   });

   const [patientData, setPatientData] = useState({
      ocupacion: '',
      discapacidad: '',
      religion: '',
      etnia: '',
      identidadGenero: '',
      sexo: '',
   });

   const [doctorData, setDoctorData] = useState({
      licenciaMedica: '',
   });

   const navigate = useNavigate();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         let res;
         if (role === 'Paciente') {
            res = await api.post('/patients/register', { userData, patientData });
            Swal.fire({
               icon: 'success',
               title: 'Registro exitoso',
               text: 'El paciente fue registrado correctamente',
               confirmButtonColor: '#1aa3a8',
            });
            navigate('/paciente');
         } else {
            res = await api.post('/doctors/register', { userData, doctorData });
            Swal.fire({
               icon: 'success',
               title: 'Registro exitoso',
               text: 'El doctor fue registrado correctamente',
               confirmButtonColor: '#1aa3a8',
            });
            navigate('/medico');
         }
      } catch (err: any) {
         console.error('Error en registro:', err.response?.data || err.message);
         Swal.fire({
            icon: 'error',
            title: 'Error en registro',
            text: err.response?.data?.message || 'No se pudo registrar, intenta de nuevo',
            confirmButtonColor: '#c0392b',
         });
      }
   };

   return (
      <div className="register-page">
         <div className="register-card">
            <h2>Crear cuenta</h2>
            <form className="register-form" onSubmit={handleSubmit}>
               <h3>Datos Usuario</h3>
               <input
                  placeholder="Primer Nombre"
                  value={userData.primer_nombre}
                  onChange={e => setUserData({ ...userData, primer_nombre: e.target.value })}
               />
               <input
                  placeholder="Segundo Nombre"
                  value={userData.segundo_nombre}
                  onChange={e => setUserData({ ...userData, segundo_nombre: e.target.value })}
               />
               <input
                  placeholder="Primer Apellido"
                  value={userData.primer_apellido}
                  onChange={e => setUserData({ ...userData, primer_apellido: e.target.value })}
               />
               <input
                  placeholder="Segundo Apellido"
                  value={userData.segundo_apellido}
                  onChange={e => setUserData({ ...userData, segundo_apellido: e.target.value })}
               />
               <input
                  placeholder="Documento"
                  value={userData.documento}
                  onChange={e => setUserData({ ...userData, documento: e.target.value })}
               />
               <input
                  placeholder="Tipo Documento"
                  value={userData.tipo_documento}
                  onChange={e => setUserData({ ...userData, tipo_documento: e.target.value })}
               />
               <input
                  placeholder="Usuario"
                  value={userData.usuario}
                  onChange={e => setUserData({ ...userData, usuario: e.target.value })}
               />
               <input
                  placeholder="Email"
                  value={userData.email}
                  onChange={e => setUserData({ ...userData, email: e.target.value })}
               />
               <input
                  type="password"
                  placeholder="Contraseña"
                  value={userData.password}
                  onChange={e => setUserData({ ...userData, password: e.target.value })}
               />
               <input
                  type="date"
                  placeholder="Fecha Nacimiento"
                  value={userData.fecha_nacimiento}
                  onChange={e => setUserData({ ...userData, fecha_nacimiento: e.target.value })}
               />
               <input
                  placeholder="Lugar Nacimiento"
                  value={userData.lugar_nacimiento}
                  onChange={e => setUserData({ ...userData, lugar_nacimiento: e.target.value })}
               />
               <input
                  placeholder="Dirección"
                  value={userData.direccion}
                  onChange={e => setUserData({ ...userData, direccion: e.target.value })}
               />

               <h3>Selecciona Rol</h3>
               <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="Paciente">Paciente</option>
                  <option value="Doctor">Doctor</option>
               </select>

               {role === 'Paciente' && (
                  <>
                     <h3>Datos Paciente</h3>
                     <input
                        placeholder="Ocupación"
                        value={patientData.ocupacion}
                        onChange={e =>
                           setPatientData({ ...patientData, ocupacion: e.target.value })
                        }
                     />
                     <input
                        placeholder="Discapacidad"
                        value={patientData.discapacidad}
                        onChange={e =>
                           setPatientData({ ...patientData, discapacidad: e.target.value })
                        }
                     />
                     <input
                        placeholder="Religión"
                        value={patientData.religion}
                        onChange={e => setPatientData({ ...patientData, religion: e.target.value })}
                     />
                     <input
                        placeholder="Etnia"
                        value={patientData.etnia}
                        onChange={e => setPatientData({ ...patientData, etnia: e.target.value })}
                     />
                     <input
                        placeholder="Identidad de Género"
                        value={patientData.identidadGenero}
                        onChange={e =>
                           setPatientData({ ...patientData, identidadGenero: e.target.value })
                        }
                     />
                     <input
                        placeholder="Sexo"
                        value={patientData.sexo}
                        onChange={e => setPatientData({ ...patientData, sexo: e.target.value })}
                     />
                  </>
               )}

               {role === 'Doctor' && (
                  <>
                     <h3>Datos Doctor</h3>
                     <input
                        placeholder="Licencia Médica"
                        value={doctorData.licenciaMedica}
                        onChange={e =>
                           setDoctorData({ ...doctorData, licenciaMedica: e.target.value })
                        }
                     />
                  </>
               )}

               <button type="submit" className="register-button-submit">
                  Registrarse
               </button>
            </form>
         </div>
      </div>
   );
}
