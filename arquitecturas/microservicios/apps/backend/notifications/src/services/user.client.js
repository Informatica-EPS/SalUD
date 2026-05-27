const axios = require("axios");

class UsersClient {
  constructor() {
    this.baseURL = process.env.USERS_API_URL || "http://backend:5000";

    this.axiosClient = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
    });
  }

  async getUserById(userId) {
    try {
      console.log(`Buscando usuario ${userId} en ${this.baseURL}...`);

      const response = await this.axiosClient.get(`/api/users/${userId}`);

      return response.data;
    } catch (error) {
      if (error.response) {
        console.error(
          `Error del servicio de usuarios: ${error.response.status}`,
        );
        throw new Error(
          `Usuario no encontrado: ${error.response.data.message}`,
        );
      } else if (error.request) {
        console.error(
          "El servicio de usuarios no está disponible en este momento.",
        );
        throw new Error("Servicio de usuarios no disponible");
      } else {
        console.error("Error al configurar la petición:", error.message);
        throw error;
      }
    }
  }
}

module.exports = new UsersClient();
