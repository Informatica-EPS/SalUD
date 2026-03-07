const userService = require('../services/user.service');

const login = async (req, res, next) => {
  try {
    const { documento, password } = req.body;

    const user = await userService.getUserByDocument(documento);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    res.status(200).json({
      id: user.id,
      primer_nombre: user.primer_nombre,
      primer_apellido: user.primer_apellido,
      documento: user.documento,
      email: user.email,
      roles: user.Roles.map(r => r.nombre) // lista de roles
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login
};
