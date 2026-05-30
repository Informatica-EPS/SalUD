const appointmentService = require("../../services/appointment.service");
const Appointment = require("../../models/appointments.model");
const DoctorModel = require("../../models/doctor.model");
const SpecialtyModel = require("../../models/specialty.model");
const TimeSlotService = require("../../services/time-slot.service");
const orderService = require("../../services/order.service");
const { functions } = require("../../utils");
const { getDateFormatUTC } = require("../../utils/functions");

jest.mock("../../models/appointments.model");
jest.mock("../../models/doctor.model");
jest.mock("../../models/user.model");
jest.mock("../../models/appointment-details.model");
jest.mock("../../models/patient.model");
jest.mock("../../models/time-slot.model");
jest.mock("../../models/specialty.model");
jest.mock("../../services/time-slot.service");
jest.mock("../../services/order.service");

jest.mock("../../utils/appointment-detail-crypto", () => ({
  decryptSensitiveFields: jest.fn((fields) => fields),
}));

jest.mock("../../utils/functions", () => ({
  getDateFormatUTC: jest.fn(),
}));

jest.mock("../../utils", () => ({
  appointmentsStatus: {
    PROGRAMADO: "programado",
    REALIZADO: "realizado",
    CANCELADO: "cancelado",
  },
  timeSlotStatus: {
    SCHEDULED: "scheduled",
    AVAILABLE: "available",
  },
  functions: {
    paginate: jest.fn(),
  },
}));

describe("appointment service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("success - general specialty appointment", async () => {
      const data = { idDoctor: 1, idFranjaHoraria: 2, idPaciente: 3 };

      DoctorModel.findByPk.mockResolvedValue({ id: 1, especialidad: null });
      SpecialtyModel.findByPk.mockResolvedValue(null);

      TimeSlotService.findById.mockResolvedValue({
        id: 2,
        fecha: "2026-05-20",
        horaInicio: "10:00",
        horaFin: "10:30",
        idDoctor: 1,
        estado: "available",
      });

      getDateFormatUTC.mockReturnValue(new Date(Date.now() + 1000000));
      TimeSlotService.validateOverlappingSlotsForPatient.mockResolvedValue(undefined);
      TimeSlotService.markAsScheduled.mockResolvedValue(undefined);

      const mockAppointment = { id: 10, ...data };
      Appointment.create.mockResolvedValue(mockAppointment);

      const result = await appointmentService.create(data);

      expect(DoctorModel.findByPk).toHaveBeenCalledWith(1);
      expect(SpecialtyModel.findByPk).toHaveBeenCalledWith(null);
      expect(TimeSlotService.markAsScheduled).toHaveBeenCalledWith(2);
      expect(Appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...data,
          tipoCita: "general",
          estado: "programado",
        })
      );
      expect(result).toEqual(mockAppointment);
    });

    test("failure - general specialty appointment with specialist doctor", async () => {
      const data = { idDoctor: 1, idFranjaHoraria: 2, idPaciente: 3 };

      DoctorModel.findByPk.mockResolvedValue({ id: 1, especialidad: 5 });
      SpecialtyModel.findByPk.mockResolvedValue({ id: 5, nombre: "Cardiología" });

      await expect(appointmentService.create(data)).rejects.toThrow(
        "El paciente no puede agendar una cita general con un médico especialista"
      );
      expect(Appointment.create).not.toHaveBeenCalled();
    });

    test("failure - past date", async () => {
      const data = { idDoctor: 1, idFranjaHoraria: 2, idPaciente: 3 };

      DoctorModel.findByPk.mockResolvedValue({ id: 1, especialidad: null });
      SpecialtyModel.findByPk.mockResolvedValue(null);

      TimeSlotService.findById.mockResolvedValue({
        id: 2,
        fecha: "2026-05-19",
        horaInicio: "10:00",
        horaFin: "10:30",
      });

      getDateFormatUTC.mockReturnValue(new Date(Date.now() - 1000000));

      await expect(appointmentService.create(data)).rejects.toThrow(
        "La fecha del horario debe ser futura"
      );
      expect(Appointment.create).not.toHaveBeenCalled();
    });

    test("failure - doctor slot mismatch", async () => {
      const data = { idDoctor: 1, idFranjaHoraria: 2, idPaciente: 3 };

      DoctorModel.findByPk.mockResolvedValue({ id: 1, especialidad: null });
      SpecialtyModel.findByPk.mockResolvedValue(null);

      TimeSlotService.findById.mockResolvedValue({
        id: 2,
        fecha: "2026-05-20",
        horaInicio: "10:00",
        idDoctor: 999, // different doctor
        estado: "available",
      });

      getDateFormatUTC.mockReturnValue(new Date(Date.now() + 1000000));
      TimeSlotService.validateOverlappingSlotsForPatient.mockResolvedValue(undefined);

      await expect(appointmentService.create(data)).rejects.toThrow(
        "El médico no tiene horario disponible para esa franja horaria"
      );
    });

    test("failure - slot already scheduled", async () => {
      const data = { idDoctor: 1, idFranjaHoraria: 2, idPaciente: 3 };

      DoctorModel.findByPk.mockResolvedValue({ id: 1, especialidad: null });
      SpecialtyModel.findByPk.mockResolvedValue(null);

      TimeSlotService.findById.mockResolvedValue({
        id: 2,
        fecha: "2026-05-20",
        horaInicio: "10:00",
        idDoctor: 1,
        estado: "scheduled", // already scheduled
      });

      getDateFormatUTC.mockReturnValue(new Date(Date.now() + 1000000));
      TimeSlotService.validateOverlappingSlotsForPatient.mockResolvedValue(undefined);

      await expect(appointmentService.create(data)).rejects.toThrow(
        "El horario ya está reservado"
      );
    });
  });

  describe("findAll", () => {
    test("success", async () => {
      const mockAppointments = [{ id: 1 }, { id: 2 }];
      Appointment.findAll.mockResolvedValue(mockAppointments);

      const result = await appointmentService.findAll();

      expect(Appointment.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockAppointments);
    });
  });

  describe("findAllPaginated", () => {
    test("success", async () => {
      const mockRows = [
        {
          id: 1,
          AppointmentDetail: { motivo: "Consulta" },
          toJSON: function () { return this; },
        },
      ];
      functions.paginate.mockResolvedValue({
        rows: mockRows,
        count: 1,
        page: 1,
        totalPages: 1,
      });

      const result = await appointmentService.findAllPaginated({ page: 1 });

      expect(functions.paginate).toHaveBeenCalledWith(
        Appointment,
        { page: 1 },
        expect.any(Object)
      );
      expect(result).toEqual({
        totalPages: 1,
        totalItems: 1,
        currentPage: 1,
        citas: mockRows,
      });
    });
  });

  describe("findByPatient", () => {
    test("success", async () => {
      const mockRows = [
        {
          id: 1,
          idPaciente: 3,
          toJSON: function () { return this; },
        },
      ];
      functions.paginate.mockResolvedValue({
        rows: mockRows,
        count: 1,
        page: 1,
        totalPages: 1,
      });

      const result = await appointmentService.findByPatient(3, { page: 1 });

      expect(functions.paginate).toHaveBeenCalledWith(
        Appointment,
        { page: 1 },
        expect.objectContaining({ where: { idPaciente: 3 } })
      );
      expect(result.citas).toEqual(mockRows);
    });
  });

  describe("findByDoctor", () => {
    test("success", async () => {
      const mockRows = [
        {
          id: 1,
          idDoctor: 2,
          toJSON: function () { return this; },
        },
      ];
      functions.paginate.mockResolvedValue({
        rows: mockRows,
        count: 1,
        page: 1,
        totalPages: 1,
      });

      const result = await appointmentService.findByDoctor(2, { page: 1 });

      expect(functions.paginate).toHaveBeenCalledWith(
        Appointment,
        { page: 1 },
        expect.objectContaining({ where: { idDoctor: 2 } })
      );
      expect(result.citas).toEqual(mockRows);
    });
  });

  describe("findById", () => {
    test("success found", async () => {
      const mockRow = {
        id: 1,
        AppointmentDetail: { motivo: "Fiebre" },
        toJSON: function () { return this; },
      };
      Appointment.findByPk.mockResolvedValue(mockRow);

      const result = await appointmentService.findById(1);

      expect(Appointment.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(result).toEqual(mockRow);
    });

    test("not found", async () => {
      Appointment.findByPk.mockResolvedValue(null);

      const result = await appointmentService.findById(999);

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    test("success", async () => {
      const mockAppointment = {
        id: 1,
        update: jest.fn().mockResolvedValue(undefined),
      };
      Appointment.findByPk.mockResolvedValue(mockAppointment);

      const result = await appointmentService.update(1, { estado: "realizado" }, 99);

      expect(Appointment.findByPk).toHaveBeenCalledWith(1);
      expect(mockAppointment.update).toHaveBeenCalledWith({
        estado: "realizado",
        updatedBy: 99,
      });
      expect(result).toBe(mockAppointment);
    });

    test("not found", async () => {
      Appointment.findByPk.mockResolvedValue(null);

      const result = await appointmentService.update(999, {}, 99);

      expect(result).toBeNull();
    });
  });

  describe("deleteById", () => {
    test("success with time slot available", async () => {
      const mockAppointment = {
        id: 1,
        idFranjaHoraria: 2,
        estado: "pendiente",
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      Appointment.findByPk.mockResolvedValue(mockAppointment);
      TimeSlotService.findById.mockResolvedValue({ id: 2 });
      TimeSlotService.markAsAvailable.mockResolvedValue(undefined);

      const result = await appointmentService.deleteById(1);

      expect(mockAppointment.destroy).toHaveBeenCalled();
      expect(TimeSlotService.markAsAvailable).toHaveBeenCalledWith(2);
      expect(result).toBe(true);
    });

    test("failure - completed appointment cannot be deleted", async () => {
      const mockAppointment = {
        id: 1,
        estado: "realizado",
      };
      Appointment.findByPk.mockResolvedValue(mockAppointment);

      await expect(appointmentService.deleteById(1)).rejects.toThrow(
        "No se pueden modificar citas ya realizadas"
      );
    });

    test("not found", async () => {
      Appointment.findByPk.mockResolvedValue(null);

      const result = await appointmentService.deleteById(999);

      expect(result).toBe(false);
    });
  });

  describe("updateRescheduledAppointment", () => {
    test("success", async () => {
      const mockAppointment = {
        id: 1,
        idFranjaHoraria: 2,
        update: jest.fn().mockResolvedValue(undefined),
      };
      Appointment.findByPk.mockResolvedValue(mockAppointment);
      TimeSlotService.findById.mockResolvedValue({ id: 2 });
      TimeSlotService.markAsAvailable.mockResolvedValue(undefined);
      TimeSlotService.markAsScheduled.mockResolvedValue(undefined);

      const result = await appointmentService.updateRescheduledAppointment(1, { idFranjaHoraria: 3 }, 99);

      expect(TimeSlotService.markAsAvailable).toHaveBeenCalledWith(2, 99);
      expect(TimeSlotService.markAsScheduled).toHaveBeenCalledWith(3);
      expect(mockAppointment.update).toHaveBeenCalledWith({
        idFranjaHoraria: 3,
        updatedBy: 99,
      });
      expect(result).toBe(mockAppointment);
    });
  });

  describe("updateAppointmentCompleted", () => {
    test("success", async () => {
      const mockAppointment = {
        id: 1,
        TimeSlot: { fecha: "2026-05-20", horaInicio: "08:00", horaFin: "08:30" },
        update: jest.fn().mockResolvedValue(undefined),
      };
      Appointment.findByPk.mockResolvedValue(mockAppointment);

      getDateFormatUTC.mockReturnValueOnce(new Date(Date.now() - 100000)); // past start
      getDateFormatUTC.mockReturnValueOnce(new Date(Date.now() + 100000)); // future end

      const result = await appointmentService.updateAppointmentCompleted(1, 99);

      expect(mockAppointment.update).toHaveBeenCalledWith({
        estado: "realizado",
        updatedBy: 99,
      });
      expect(result).toBe(mockAppointment);
    });

    test("failure - not in slot time", async () => {
      const mockAppointment = {
        id: 1,
        TimeSlot: { fecha: "2026-05-20", horaInicio: "08:00", horaFin: "08:30" },
      };
      Appointment.findByPk.mockResolvedValue(mockAppointment);

      getDateFormatUTC.mockReturnValueOnce(new Date(Date.now() + 100000)); // future start

      await expect(appointmentService.updateAppointmentCompleted(1, 99)).rejects.toThrow(
        "La cita no está en curso, no se puede marcar como realizada"
      );
    });
  });

  describe("cancelAppointment", () => {
    test("success", async () => {
      const mockAppointment = {
        id: 1,
        estado: "pendiente",
        update: jest.fn().mockResolvedValue(undefined),
      };
      Appointment.findByPk.mockResolvedValue(mockAppointment);

      const result = await appointmentService.cancelAppointment(1, 99);

      expect(mockAppointment.update).toHaveBeenCalledWith({
        estado: "cancelado",
        updatedBy: 99,
      });
      expect(result).toBe(mockAppointment);
    });

    test("failure - already canceled", async () => {
      const mockAppointment = {
        id: 1,
        estado: "cancelado",
      };
      Appointment.findByPk.mockResolvedValue(mockAppointment);

      await expect(appointmentService.cancelAppointment(1, 99)).rejects.toThrow(
        "Appointment is already canceled"
      );
    });
  });

  describe("getClinicalHistory", () => {
    test("success", async () => {
      const mockAppointments = [
        {
          id: 1,
          tipoCita: "general",
          estado: "realizado",
          idPaciente: 3,
          idDoctor: 4,
          idFranjaHoraria: 5,
          createdAt: "2026-05-20T10:00:00Z",
          TimeSlot: { fecha: "2026-05-20", horaInicio: "10:00", horaFin: "10:30" },
          AppointmentDetail: { motivo: "Fiebre" },
          Doctor: {
            licenciaMedica: "LIC-123",
            User: { primer_nombre: "Juan", primer_apellido: "Pérez", email: "juan@med.com" },
            Specialty: { nombre: "Pediatría" },
          },
          Patient: {
            id: 3,
            ocupacion: "Estudiante",
            User: { primer_nombre: "Andrés", primer_apellido: "Gómez", email: "andres@pat.com", direccion: "Calle 1" },
          },
        },
      ];
      Appointment.findAll.mockResolvedValue(mockAppointments);

      const result = await appointmentService.getClinicalHistory(3);

      expect(Appointment.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { idPaciente: 3 } }));
      expect(result.citas).toHaveLength(1);
      expect(result.citas[0].id).toBe(1);
      expect(result.citas[0].doctor.doctorLicencia).toBe("LIC-123");
      expect(result.datosPaciente.nombreCompleto).toContain("Andrés");
    });
  });

  describe("createBySpecialty", () => {
    test("success - specialty appointment with authorized order", async () => {
      const data = { idDoctor: 1, idFranjaHoraria: 2, idPaciente: 3 };

      DoctorModel.findByPk.mockResolvedValue({ id: 1, especialidad: 5 });

      TimeSlotService.findById.mockResolvedValue({
        id: 2,
        fecha: "2026-05-20",
        horaInicio: "10:00",
        idDoctor: 1,
        estado: "available",
      });

      getDateFormatUTC.mockReturnValue(new Date(Date.now() + 1000000));
      TimeSlotService.validateOverlappingSlotsForPatient.mockResolvedValue(undefined);

      orderService.validatePatientHasAuthorizedOrders.mockResolvedValue({
        dataValues: { id: 100, fechaVencimiento: new Date(Date.now() + 10000000) },
      });

      orderService.setCompletedOrder.mockResolvedValue(undefined);
      TimeSlotService.markAsScheduled.mockResolvedValue(undefined);

      const mockAppointment = { id: 50, ...data };
      Appointment.create.mockResolvedValue(mockAppointment);

      const result = await appointmentService.createBySpecialty(5, data, 99);

      expect(DoctorModel.findByPk).toHaveBeenCalledWith(1);
      expect(orderService.validatePatientHasAuthorizedOrders).toHaveBeenCalledWith(3, 5);
      expect(orderService.setCompletedOrder).toHaveBeenCalledWith(100);
      expect(TimeSlotService.markAsScheduled).toHaveBeenCalledWith(2);
      expect(Appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...data,
          tipoCita: "general",
          estado: "programado",
        })
      );
      expect(result).toEqual(mockAppointment);
    });

    test("failure - specialty mismatch", async () => {
      const data = { idDoctor: 1, idFranjaHoraria: 2, idPaciente: 3 };

      DoctorModel.findByPk.mockResolvedValue({ id: 1, especialidad: 4 }); // doctor has specialty 4, expected 5

      await expect(appointmentService.createBySpecialty(5, data, 99)).rejects.toThrow(
        "El médico no pertenece a la especialidad seleccionada"
      );
    });

    test("failure - no authorized order", async () => {
      const data = { idDoctor: 1, idFranjaHoraria: 2, idPaciente: 3 };

      DoctorModel.findByPk.mockResolvedValue({ id: 1, especialidad: 5 });

      TimeSlotService.findById.mockResolvedValue({
        id: 2,
        fecha: "2026-05-20",
        horaInicio: "10:00",
        idDoctor: 1,
        estado: "available",
      });

      getDateFormatUTC.mockReturnValue(new Date(Date.now() + 1000000));
      TimeSlotService.validateOverlappingSlotsForPatient.mockResolvedValue(undefined);

      orderService.validatePatientHasAuthorizedOrders.mockResolvedValue(null);

      await expect(appointmentService.createBySpecialty(5, data, 99)).rejects.toThrow(
        "El paciente no tiene órdenes autorizadas asociadas para esa especialidad"
      );
    });

    test("failure - expired order", async () => {
      const data = { idDoctor: 1, idFranjaHoraria: 2, idPaciente: 3 };

      DoctorModel.findByPk.mockResolvedValue({ id: 1, especialidad: 5 });

      TimeSlotService.findById.mockResolvedValue({
        id: 2,
        fecha: "2026-05-20",
        horaInicio: "10:00",
        idDoctor: 1,
        estado: "available",
      });

      getDateFormatUTC.mockReturnValue(new Date(Date.now() + 1000000));
      TimeSlotService.validateOverlappingSlotsForPatient.mockResolvedValue(undefined);

      orderService.validatePatientHasAuthorizedOrders.mockResolvedValue({
        dataValues: { id: 100, fechaVencimiento: new Date(Date.now() - 10000) }, // expired
      });

      await expect(appointmentService.createBySpecialty(5, data, 99)).rejects.toThrow(
        "La orden ha vencido y no se puede usar para crear una cita"
      );
    });
  });
});
