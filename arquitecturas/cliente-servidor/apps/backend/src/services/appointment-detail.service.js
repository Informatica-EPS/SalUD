const AppointmentDetail = require("../models/appointment-details.model");
const AppointmentService = require("./appointmet.service");
const { functions } = require("../utils");

class AppointmentDetailService {
  async create(data, auditUserId) {
    await this.validateDetail(data, false); // false = no requiere diagnóstico
    return await AppointmentDetail.create({
      ...data,
      createdBy: auditUserId,
      updatedBy: auditUserId,
    });
  }

  async validateDetail(data, requireDiagnostico = true) {
    const { motivo, diagnostico, idCita } = data;
    
    // Motivo e idCita siempre son requeridos
    if (!motivo || !idCita) {
      throw new Error("motivo e idCita son requeridos");
    }
    
    // Diagnóstico solo es requerido si se especifica (ej: al actualizar después de la consulta)
    if (requireDiagnostico && !diagnostico) {
      throw new Error("diagnostico es requerido");
    }

    const appointmentExists =
      await AppointmentService.appointmentExists(idCita);
    if (!appointmentExists) {
      throw new Error("La cita no existe");
    }

    const appointmentHasDetails = await AppointmentDetail.findOne({
      where: { idCita },
    });
    if (appointmentHasDetails) {
      throw new Error("La cita ya tiene detalles registrados");
    }
  }

  async findAll() {
    return await AppointmentDetail.findAll();
  }

  async findAllPaginated(queryParams) {
    const { rows, count, page, totalPages } = await functions.paginate(
      AppointmentDetail,
      queryParams,
    );

    return {
      totalPages,
      totalItems: count,
      currentPage: page,
      detallesCitas: rows,
    };
  }

  async findByAppointmentId(appointmentId) {
    return await AppointmentDetail.findOne({
      where: { idCita: appointmentId },
    });
  }

  async findById(id) {
    return await AppointmentDetail.findByPk(id);
  }

  async update(id, data, auditUserId) {
    const detail = await AppointmentDetail.findByPk(id);
    if (!detail) return null;

    // No validar duplicados al actualizar (solo al crear)
    const { motivo, idCita } = data;
    if (!motivo || !idCita) {
      throw new Error("motivo e idCita son requeridos");
    }

    await detail.update({
      ...data,
      idCita: detail.idCita,
      updatedBy: auditUserId,
    });
    return detail;
  }

  async delete(id) {
    const detail = await AppointmentDetail.findByPk(id);
    if (!detail) return false;

    await detail.destroy();
    return true;
  }
}

module.exports = new AppointmentDetailService();
