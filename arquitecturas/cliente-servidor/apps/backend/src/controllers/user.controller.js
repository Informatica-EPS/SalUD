const userService = require('../services/user.service');
const crypto = require('crypto');

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

    // Construir array de roles basándose en los registros de la tabla de relaciones
    const rolesFromTable = user.Roles ? user.Roles.map(r => r.nombre) : [];
    
    // Inferir roles basándose en la existencia de registros de Paciente/Doctor
    const rolesInferred = [];
    
    // Agregar ID de paciente si existe e inferir rol
    let idPaciente = null;
    if (user.Patients && user.Patients.length > 0) {
      idPaciente = user.Patients[0].id;
      // Solo agregar rol si no está ya en la tabla de roles
      if (!rolesFromTable.includes('Paciente')) {
        rolesInferred.push('Paciente');
      }
    }

    // Agregar ID de doctor si existe e inferir rol
    let idDoctor = null;
    if (user.Doctors && user.Doctors.length > 0) {
      idDoctor = user.Doctors[0].id;
      // Solo agregar rol si no está ya en la tabla de roles
      if (!rolesFromTable.includes('Medico') && !rolesFromTable.includes('Doctor')) {
        rolesInferred.push('Medico');
      }
    }

    // Combinar roles de la tabla con roles inferidos
    const allRoles = [...rolesFromTable, ...rolesInferred];

    const response = {
      id: user.id,
      primer_nombre: user.primer_nombre,
      primer_apellido: user.primer_apellido,
      documento: user.documento,
      email: user.email,
      roles: allRoles
    };

    // Agregar IDs si existen
    if (idPaciente) {
      response.idPaciente = idPaciente;
    }
    if (idDoctor) {
      response.idDoctor = idDoctor;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { documento, password, ...rest } = req.body;

    // Hash documento y password
    const hashedDocumento = crypto.createHash('sha256').update(documento).digest('hex');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const user = await userService.createUser({
      ...rest,
      documento: hashedDocumento,
      password: hashedPassword
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  createUser,
  getUsers
};
