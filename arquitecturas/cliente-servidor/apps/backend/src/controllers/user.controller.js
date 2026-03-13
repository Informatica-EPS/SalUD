const userService = require('../services/user.service');

const login = async (req, res, next) => {
  try {
    const { documento, password } = req.body;
    console.log('Login attempt:', documento);
    console.log('Password provided:',password);

    const user = await userService.getUserByDocument(documento);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const response = {
      id: user.id,
      primer_nombre: user.primer_nombre,
      primer_apellido: user.primer_apellido,
      documento: user.documento,
      email: user.email,
      roles: user.Roles.map(r => r.nombre) // lista de roles
    };

    // Agregar ID de paciente si existe
    if (user.Patients && user.Patients.length > 0) {
      response.idPaciente = user.Patients[0].id;
    }

    // Agregar ID de doctor si existe
    if (user.Doctors && user.Doctors.length > 0) {
      response.idDoctor = user.Doctors[0].id;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login
};
