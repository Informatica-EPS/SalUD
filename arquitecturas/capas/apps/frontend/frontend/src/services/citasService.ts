import { ICitaMedica, ICitaDisponible } from '../interface';

// Mock data - Médicos
const mockMedicos = [
   {
      id: 1,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      especialidad: 'Cardiología',
      email: 'carlos.rodriguez@salud.com',
      telefono: '3001234567',
   },
   {
      id: 2,
      nombre: 'María',
      apellido: 'González',
      especialidad: 'Pediatría',
      email: 'maria.gonzalez@salud.com',
      telefono: '3007654321',
   },
   {
      id: 3,
      nombre: 'Juan',
      apellido: 'Martínez',
      especialidad: 'Medicina General',
      email: 'juan.martinez@salud.com',
      telefono: '3009876543',
   },
   {
      id: 4,
      nombre: 'Ana',
      apellido: 'López',
      especialidad: 'Dermatología',
      email: 'ana.lopez@salud.com',
      telefono: '3005551234',
   },
   {
      id: 5,
      nombre: 'Pedro',
      apellido: 'Ramírez',
      especialidad: 'Traumatología',
      email: 'pedro.ramirez@salud.com',
      telefono: '3004445555',
   },
];

// Mock data - Citas Médicas del Usuario
const mockCitasPaciente: ICitaMedica[] = [
   {
      id: 1,
      paciente: {
         id: 1,
         nombre: 'Usuario',
         apellido: 'Demo',
         email: 'usuario@demo.com',
      },
      medico: mockMedicos[0],
      fecha: '2026-03-10',
      hora: '10:00',
      motivo: 'Control de presión arterial',
      estado: 'programada',
      consultorio: '201',
   },
   {
      id: 2,
      paciente: {
         id: 1,
         nombre: 'Usuario',
         apellido: 'Demo',
         email: 'usuario@demo.com',
      },
      medico: mockMedicos[2],
      fecha: '2026-03-05',
      hora: '14:30',
      motivo: 'Chequeo general',
      estado: 'completada',
      consultorio: '105',
   },
   {
      id: 3,
      paciente: {
         id: 1,
         nombre: 'Usuario',
         apellido: 'Demo',
         email: 'usuario@demo.com',
      },
      medico: mockMedicos[3],
      fecha: '2026-03-15',
      hora: '09:00',
      motivo: 'Consulta por dermatitis',
      estado: 'programada',
      consultorio: '303',
   },
];

// Mock data - Citas Disponibles
const generarCitasDisponibles = (): ICitaDisponible[] => {
   const citas: ICitaDisponible[] = [];
   let id = 1;

   // Generar citas para los próximos 7 días
   for (let dia = 0; dia < 7; dia++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + dia);
      const fechaStr = fecha.toISOString().split('T')[0];

      // Para cada médico
      mockMedicos.forEach(medico => {
         // Horarios de mañana: 8:00 - 12:00
         for (let hora = 8; hora < 12; hora++) {
            citas.push({
               id: id++,
               medico,
               fecha: fechaStr,
               horaInicio: `${hora.toString().padStart(2, '0')}:00`,
               horaFin: `${(hora + 1).toString().padStart(2, '0')}:00`,
               disponible: Math.random() > 0.3, // 70% disponibles
            });
         }

         // Horarios de tarde: 14:00 - 18:00
         for (let hora = 14; hora < 18; hora++) {
            citas.push({
               id: id++,
               medico,
               fecha: fechaStr,
               horaInicio: `${hora.toString().padStart(2, '0')}:00`,
               horaFin: `${(hora + 1).toString().padStart(2, '0')}:00`,
               disponible: Math.random() > 0.3,
            });
         }
      });
   }

   return citas;
};

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Servicios Mock
export const citasService = {
   // Obtener citas disponibles
   getCitasDisponibles: async (): Promise<ICitaDisponible[]> => {
      await delay(800); // Simular latencia de red
      console.log('📅 Mock: Obteniendo citas disponibles...');
      return generarCitasDisponibles();
   },

   // Obtener citas del paciente
   getMisCitas: async (): Promise<ICitaMedica[]> => {
      await delay(600);
      console.log('📋 Mock: Obteniendo mis citas...');
      return mockCitasPaciente;
   },

   // Agendar nueva cita
   agendarCita: async (citaId: number, motivo: string): Promise<ICitaMedica> => {
      await delay(1000);
      console.log('✅ Mock: Agendando cita...', { citaId, motivo });
      
      const citasDisponibles = generarCitasDisponibles();
      const citaSeleccionada = citasDisponibles.find(c => c.id === citaId);

      if (!citaSeleccionada) {
         throw new Error('Cita no encontrada');
      }

      const nuevaCita: ICitaMedica = {
         id: Math.floor(Math.random() * 10000),
         paciente: {
            id: 1,
            nombre: 'Usuario',
            apellido: 'Demo',
            email: 'usuario@demo.com',
         },
         medico: citaSeleccionada.medico,
         fecha: citaSeleccionada.fecha,
         hora: citaSeleccionada.horaInicio,
         motivo,
         estado: 'programada',
         consultorio: `${Math.floor(Math.random() * 400) + 100}`,
      };

      return nuevaCita;
   },

   // Cancelar cita
   cancelarCita: async (citaId: number): Promise<void> => {
      await delay(700);
      console.log('❌ Mock: Cancelando cita...', citaId);
   },

   // Obtener médicos
   getMedicos: async () => {
      await delay(500);
      console.log('👨‍⚕️ Mock: Obteniendo médicos...');
      return mockMedicos;
   },
};
