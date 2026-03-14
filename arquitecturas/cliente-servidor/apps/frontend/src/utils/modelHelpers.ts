/**
 * Utilidades para trabajar con modelos de Sequelize que pueden venir con diferentes nombres
 * de asociaciones (camelCase o PascalCase)
 */

import { IUser, IDoctor, IPatient, ITimeSlot, IAppointment, IAppointmentDetail } from '../interface';

/**
 * Obtiene el doctor asociado de un TimeSlot o Appointment, manejando ambos formatos de Sequelize
 */
export const getDoctor = (
   entity: ITimeSlot | IAppointment | { Doctor?: IDoctor; doctor?: IDoctor }
): IDoctor | undefined => {
   return entity.Doctor || entity.doctor;
};

/**
 * Obtiene el horario asociado de un Appointment, manejando ambos formatos de Sequelize
 */
export const getTimeSlot = (
   appointment: IAppointment | { TimeSlot?: ITimeSlot; horario?: ITimeSlot }
): ITimeSlot | undefined => {
   return appointment.TimeSlot || appointment.horario;
};

/**
 * Obtiene los detalles asociados de un Appointment, manejando ambos formatos de Sequelize
 */
export const getAppointmentDetail = (
   appointment: IAppointment | { AppointmentDetail?: IAppointmentDetail; detalles?: IAppointmentDetail }
): IAppointmentDetail | undefined => {
   return appointment.AppointmentDetail || appointment.detalles;
};

/**
 * Obtiene el usuario asociado de un Doctor o Patient, manejando ambos formatos de Sequelize
 */
export const getUser = (entity: IDoctor | IPatient | { User?: IUser; usuario?: IUser }): IUser | undefined => {
   return entity.User || entity.usuario;
};

/**
 * Obtiene el usuario de un doctor directamente
 */
export const getDoctorUser = (doctor: IDoctor | undefined): IUser | undefined => {
   if (!doctor) return undefined;
   return getUser(doctor);
};

/**
 * Obtiene el nombre completo de un usuario (primer_nombre + primer_apellido)
 */
export const getUserFullName = (user: IUser | undefined): string => {
   if (!user) return '';
   const firstName = user.primer_nombre || user.primerNombre || '';
   const lastName = user.primer_apellido || user.primerApellido || '';
   return `${firstName} ${lastName}`.trim();
};

/**
 * Obtiene el nombre completo extendido de un usuario (incluye segundo nombre y segundo apellido)
 */
export const getUserFullNameExtended = (user: IUser | undefined): string => {
   if (!user) return '';
   const firstName = user.primer_nombre || user.primerNombre || '';
   const secondName = user.segundo_nombre || user.segundoNombre || '';
   const firstLastName = user.primer_apellido || user.primerApellido || '';
   const secondLastName = user.segundo_apellido || user.segundoApellido || '';
   return `${firstName} ${secondName} ${firstLastName} ${secondLastName}`.replace(/\s+/g, ' ').trim();
};

/**
 * Obtiene las iniciales de un usuario
 */
export const getUserInitials = (user: IUser | undefined): string => {
   if (!user) return '';
   const firstName = user.primer_nombre || user.primerNombre || '';
   const lastName = user.primer_apellido || user.primerApellido || '';
   return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Obtiene el email del usuario
 */
export const getUserEmail = (user: IUser | undefined): string => {
   if (!user) return '';
   return user.email || user.correo || '';
};

/**
 * Obtiene el documento del usuario
 */
export const getUserDocument = (user: IUser | undefined): string => {
   if (!user) return '';
   return user.documento || user.numeroIdentificacion || '';
};

/**
 * Obtiene el nombre completo de un doctor con el prefijo "Dr."
 */
export const getDoctorFullName = (doctor: IDoctor | undefined): string => {
   if (!doctor) return '';
   const user = getUser(doctor);
   const fullName = getUserFullName(user);
   return fullName ? `Dr. ${fullName}` : '';
};

/**
 * Obtiene el nombre completo del doctor de un TimeSlot con el prefijo "Dr."
 */
export const getTimeSlotDoctorFullName = (timeSlot: ITimeSlot | undefined): string => {
   if (!timeSlot) return '';
   const doctor = getDoctor(timeSlot);
   return getDoctorFullName(doctor);
};

/**
 * Obtiene el nombre completo del doctor de un Appointment con el prefijo "Dr."
 */
export const getAppointmentDoctorFullName = (appointment: IAppointment | undefined): string => {
   if (!appointment) return '';
   const doctor = getDoctor(appointment);
   return getDoctorFullName(doctor);
};

/**
 * Obtiene el paciente asociado de un Appointment, manejando ambos formatos de Sequelize
 */
export const getPatient = (
   entity: IAppointment | { Patient?: IPatient; Paciente?: IPatient; paciente?: IPatient } | any
): IPatient | undefined => {
   if (!entity) return undefined;
   return (entity as any).Patient || (entity as any).Paciente || (entity as any).paciente;
};

/**
 * Obtiene el usuario de un paciente directamente
 */
export const getPatientUser = (patient: IPatient | undefined): IUser | undefined => {
   if (!patient) return undefined;
   return getUser(patient);
};

/**
 * Obtiene el nombre completo de un paciente
 */
export const getPatientFullName = (patient: IPatient | undefined): string => {
   if (!patient) return '';
   const user = getUser(patient);
   return getUserFullNameExtended(user);
};

/**
 * Obtiene el nombre completo del paciente de un Appointment
 */
export const getAppointmentPatientFullName = (appointment: IAppointment | undefined): string => {
   if (!appointment) return '';
   const patient = getPatient(appointment);
   return getPatientFullName(patient);
};

