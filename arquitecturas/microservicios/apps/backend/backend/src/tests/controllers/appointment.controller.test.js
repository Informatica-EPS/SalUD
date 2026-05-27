const {
  createAppointment,
  getAppointmentById,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  getAppointmentsBySpecialty,
  getAppointments,
  updateAppointment,
  updateRescheduledAppointment,
  cancelAppointment,
  updateAppointmentCompleted,
  deleteAppointment,
  getClinicalHistory,
  createAppointmentBySpecialty,
} = require("../../controllers/appointment.controller");
const appointmentService = require("../../services/appointment.service");

jest.mock("../../services/appointment.service");

describe("appointment controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createAppointment", () => {
    test("success", async () => {
      const mockAppointment = { idCita: 1 };
      appointmentService.create.mockResolvedValue(mockAppointment);

      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { body: { fecha: "2026-05-20" }, user: { id: 1 } };
      const res = { status: statusMock };
      const next = jest.fn();

      await createAppointment(req, res, next);

      expect(appointmentService.create).toHaveBeenCalledWith(req.body, 1);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockAppointment);
      expect(next).not.toHaveBeenCalled();
    });

    test("success without user id", async () => {
      const mockAppointment = { idCita: 1 };
      appointmentService.create.mockResolvedValue(mockAppointment);

      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { body: { fecha: "2026-05-20" } };
      const res = { status: statusMock };
      const next = jest.fn();

      await createAppointment(req, res, next);

      expect(appointmentService.create).toHaveBeenCalledWith(req.body, null);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockAppointment);
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.create.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { body: {} };
      const res = { status: statusMock };
      const nextMock = jest.fn();

      await createAppointment(req, res, nextMock);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getAppointments", () => {
    test("success", async () => {
      const mockAppointments = [{ idCita: 1 }, { idCita: 2 }];
      appointmentService.findAllPaginated.mockResolvedValue(mockAppointments);

      const jsonMock = jest.fn();
      const req = { query: { page: 1, limit: 10 } };
      const res = { json: jsonMock };
      const next = jest.fn();

      await getAppointments(req, res, next);

      expect(appointmentService.findAllPaginated).toHaveBeenCalledWith(req.query);
      expect(jsonMock).toHaveBeenCalledWith(mockAppointments);
      expect(next).not.toHaveBeenCalled();
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.findAllPaginated.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const req = { query: {} };
      const res = { json: jsonMock };
      const nextMock = jest.fn();

      await getAppointments(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getAppointmentById", () => {
    test("success found", async () => {
      const mockAppointment = { idCita: 1 };
      appointmentService.findById.mockResolvedValue(mockAppointment);

      const jsonMock = jest.fn();
      const req = { params: { idAppointment: 1 } };
      const res = { json: jsonMock };
      const next = jest.fn();

      await getAppointmentById(req, res, next);

      expect(appointmentService.findById).toHaveBeenCalledWith(1);
      expect(jsonMock).toHaveBeenCalledWith(mockAppointment);
      expect(next).not.toHaveBeenCalled();
    });

    test("Not found", async () => {
      appointmentService.findById.mockResolvedValue(null);

      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { params: { idAppointment: 1 } };
      const res = { status: statusMock };
      const next = jest.fn();

      await getAppointmentById(req, res, next);

      expect(appointmentService.findById).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Appointment not found" });
      expect(next).not.toHaveBeenCalled();
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.findById.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const req = { params: { idAppointment: 1 } };
      const res = { json: jsonMock };
      const nextMock = jest.fn();

      await getAppointmentById(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getAppointmentsByDoctor", () => {
    test("success", async () => {
      const mockAppointments = [{ idCita: 1 }];
      appointmentService.findByDoctor.mockResolvedValue(mockAppointments);

      const jsonMock = jest.fn();
      const req = { params: { idDoctor: 2 }, query: { page: 1 } };
      const res = { json: jsonMock };
      const next = jest.fn();

      await getAppointmentsByDoctor(req, res, next);

      expect(appointmentService.findByDoctor).toHaveBeenCalledWith(2, req.query);
      expect(jsonMock).toHaveBeenCalledWith(mockAppointments);
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.findByDoctor.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const req = { params: { idDoctor: 2 }, query: {} };
      const res = { json: jsonMock };
      const nextMock = jest.fn();

      await getAppointmentsByDoctor(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getAppointmentsByPatient", () => {
    test("success", async () => {
      const mockAppointments = [{ idCita: 3 }];
      appointmentService.findByPatient.mockResolvedValue(mockAppointments);

      const jsonMock = jest.fn();
      const req = { params: { idPaciente: 3 }, query: { page: 1 } };
      const res = { json: jsonMock };
      const next = jest.fn();

      await getAppointmentsByPatient(req, res, next);

      expect(appointmentService.findByPatient).toHaveBeenCalledWith(3, req.query);
      expect(jsonMock).toHaveBeenCalledWith(mockAppointments);
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.findByPatient.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const req = { params: { idPaciente: 3 }, query: {} };
      const res = { json: jsonMock };
      const nextMock = jest.fn();

      await getAppointmentsByPatient(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("updateAppointment", () => {
    test("success", async () => {
      const mockAppointment = { idCita: 1, estado: "confirmada" };
      appointmentService.update.mockResolvedValue(mockAppointment);

      const jsonMock = jest.fn();
      const req = { params: { idAppointment: 1 }, body: { estado: "confirmada" } };
      const res = { json: jsonMock };
      const next = jest.fn();

      await updateAppointment(req, res, next);

      expect(appointmentService.update).toHaveBeenCalledWith(1, req.body);
      expect(jsonMock).toHaveBeenCalledWith(mockAppointment);
    });

    test("Not found", async () => {
      appointmentService.update.mockResolvedValue(null);

      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { params: { idAppointment: 1 }, body: {} };
      const res = { status: statusMock };
      const next = jest.fn();

      await updateAppointment(req, res, next);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Appointment not found" });
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.update.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const req = { params: { idAppointment: 1 }, body: {} };
      const res = { json: jsonMock };
      const nextMock = jest.fn();

      await updateAppointment(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("updateRescheduledAppointment", () => {
    test("success", async () => {
      const mockAppointment = { idCita: 1, rescheduled: true };
      appointmentService.updateRescheduledAppointment.mockResolvedValue(mockAppointment);

      const jsonMock = jest.fn();
      const req = { params: { idAppointment: 1 }, body: { fecha: "2026-06-01" } };
      const res = { json: jsonMock };
      const next = jest.fn();

      await updateRescheduledAppointment(req, res, next);

      expect(appointmentService.updateRescheduledAppointment).toHaveBeenCalledWith(1, req.body);
      expect(jsonMock).toHaveBeenCalledWith(mockAppointment);
    });

    test("Not found", async () => {
      appointmentService.updateRescheduledAppointment.mockResolvedValue(null);

      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { params: { idAppointment: 1 }, body: {} };
      const res = { status: statusMock };
      const next = jest.fn();

      await updateRescheduledAppointment(req, res, next);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Appointment not found" });
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.updateRescheduledAppointment.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const req = { params: { idAppointment: 1 }, body: {} };
      const res = { json: jsonMock };
      const nextMock = jest.fn();

      await updateRescheduledAppointment(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("cancelAppointment", () => {
    test("success", async () => {
      const mockAppointment = { idCita: 1, estado: "cancelada" };
      appointmentService.cancelAppointment.mockResolvedValue(mockAppointment);

      const jsonMock = jest.fn();
      const req = { params: { idAppointment: 1 }, user: { id: 1 } };
      const res = { json: jsonMock };
      const next = jest.fn();

      await cancelAppointment(req, res, next);

      expect(appointmentService.cancelAppointment).toHaveBeenCalledWith(1, 1);
      expect(jsonMock).toHaveBeenCalledWith(mockAppointment);
    });

    test("Not found", async () => {
      appointmentService.cancelAppointment.mockResolvedValue(null);

      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { params: { idAppointment: 1 } };
      const res = { status: statusMock };
      const next = jest.fn();

      await cancelAppointment(req, res, next);

      expect(appointmentService.cancelAppointment).toHaveBeenCalledWith(1, null);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Appointment not found" });
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.cancelAppointment.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const req = { params: { idAppointment: 1 } };
      const res = { json: jsonMock };
      const nextMock = jest.fn();

      await cancelAppointment(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("updateAppointmentCompleted", () => {
    test("success", async () => {
      const mockAppointment = { idCita: 1, estado: "completada" };
      appointmentService.updateAppointmentCompleted.mockResolvedValue(mockAppointment);

      const jsonMock = jest.fn();
      const req = { params: { idAppointment: 1 }, user: { id: 2 } };
      const res = { json: jsonMock };
      const next = jest.fn();

      await updateAppointmentCompleted(req, res, next);

      expect(appointmentService.updateAppointmentCompleted).toHaveBeenCalledWith(1, 2);
      expect(jsonMock).toHaveBeenCalledWith(mockAppointment);
    });

    test("Not found", async () => {
      appointmentService.updateAppointmentCompleted.mockResolvedValue(null);

      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { params: { idAppointment: 1 } };
      const res = { status: statusMock };
      const next = jest.fn();

      await updateAppointmentCompleted(req, res, next);

      expect(appointmentService.updateAppointmentCompleted).toHaveBeenCalledWith(1, null);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Appointment not found" });
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.updateAppointmentCompleted.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const req = { params: { idAppointment: 1 } };
      const res = { json: jsonMock };
      const nextMock = jest.fn();

      await updateAppointmentCompleted(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("deleteAppointment", () => {
    test("success", async () => {
      appointmentService.deleteById.mockResolvedValue(true);

      const jsonMock = jest.fn();
      const req = { params: { idAppointment: 1 } };
      const res = { json: jsonMock };
      const next = jest.fn();

      await deleteAppointment(req, res, next);

      expect(appointmentService.deleteById).toHaveBeenCalledWith(1);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Appointment deleted successfully" });
    });

    test("Not found", async () => {
      appointmentService.deleteById.mockResolvedValue(false);

      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { params: { idAppointment: 1 } };
      const res = { status: statusMock };
      const next = jest.fn();

      await deleteAppointment(req, res, next);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Appointment not found" });
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.deleteById.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const req = { params: { idAppointment: 1 } };
      const res = { json: jsonMock };
      const nextMock = jest.fn();

      await deleteAppointment(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getClinicalHistory", () => {
    test("success", async () => {
      const mockHistory = [{ idCita: 1, diagnostico: "Gripe" }];
      appointmentService.getClinicalHistory.mockResolvedValue(mockHistory);

      const jsonMock = jest.fn();
      const req = { params: { idPaciente: 1 } };
      const res = { json: jsonMock };
      const next = jest.fn();

      await getClinicalHistory(req, res, next);

      expect(appointmentService.getClinicalHistory).toHaveBeenCalledWith(1);
      expect(jsonMock).toHaveBeenCalledWith(mockHistory);
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.getClinicalHistory.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const req = { params: { idPaciente: 1 } };
      const res = { json: jsonMock };
      const nextMock = jest.fn();

      await getClinicalHistory(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getAppointmentsBySpecialty", () => {
    test("success", async () => {
      const mockAppointments = [{ idCita: 1 }];
      appointmentService.findBySpecialty.mockResolvedValue(mockAppointments);

      const jsonMock = jest.fn();
      const req = { params: { idSpecialty: 4 }, query: { page: 1 } };
      const res = { json: jsonMock };
      const next = jest.fn();

      await getAppointmentsBySpecialty(req, res, next);

      expect(appointmentService.findBySpecialty).toHaveBeenCalledWith(4, req.query);
      expect(jsonMock).toHaveBeenCalledWith(mockAppointments);
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.findBySpecialty.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const req = { params: { idSpecialty: 4 }, query: {} };
      const res = { json: jsonMock };
      const nextMock = jest.fn();

      await getAppointmentsBySpecialty(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("createAppointmentBySpecialty", () => {
    test("success", async () => {
      const mockAppointment = { idCita: 2 };
      appointmentService.createBySpecialty.mockResolvedValue(mockAppointment);

      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { params: { idSpecialty: 5 }, body: { fecha: "2026-05-20" }, user: { id: 3 } };
      const res = { status: statusMock };
      const next = jest.fn();

      await createAppointmentBySpecialty(req, res, next);

      expect(appointmentService.createBySpecialty).toHaveBeenCalledWith(5, req.body, 3);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockAppointment);
    });

    test("failure", async () => {
      const mockError = new Error("Database error");
      appointmentService.createBySpecialty.mockRejectedValue(mockError);

      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { params: { idSpecialty: 5 }, body: {} };
      const res = { status: statusMock };
      const nextMock = jest.fn();

      await createAppointmentBySpecialty(req, res, nextMock);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });
});
