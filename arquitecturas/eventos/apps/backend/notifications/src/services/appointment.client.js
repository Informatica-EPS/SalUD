const axios = require("axios");

class AppointmentClient {
  constructor() {
    this.baseURL = process.env.USERS_API_URL || "http://backend:5000";

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
    });
  }

  async getAppointmentById(appointmentId) {
    try {
      console.log(`Buscando cita ${appointmentId} en ${this.baseURL}...`);

      const response = await this.client.get(
        `/api/appointments/${appointmentId}`,
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        console.error(`Error del servicio de citas: ${error.response.status}`);
        throw new Error(`Cita no encontrada: ${error.response.data.message}`);
      } else if (error.request) {
        console.error(
          "El servicio de citas no está disponible en este momento.",
        );
        throw new Error("Servicio de citas no disponible");
      } else {
        console.error("Error al configurar la petición:", error.message);
        throw error;
      }
    }
  }
}

module.exports = new AppointmentClient();
