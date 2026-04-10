/* eslint-disable camelcase */
"use strict";

const crypto = require("crypto");

const hashSha256 = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("usuarios", [
      {
        id: 1,
        primer_nombre: "Ana",
        segundo_nombre: "Maria",
        primer_apellido: "Lopez",
        segundo_apellido: "Gomez",
        fecha_nacimiento: "1985-03-12",
        lugar_nacimiento: "Bogota",
        direccion: "Calle 10 # 20-30",
        documento: hashSha256("1001"),
        tipo_documento: "CC",
        usuario: "ana.lopez",
        email: "ana.lopez@example.com",
        password: hashSha256("secret123"),
        creado_por: "seed",
        fecha_creacion: now,
        ultima_actualizacion: now,
        actualizado_por: "seed",
      },
      {
        id: 2,
        primer_nombre: "Juan",
        segundo_nombre: "Carlos",
        primer_apellido: "Perez",
        segundo_apellido: "Ruiz",
        fecha_nacimiento: "1990-07-22",
        lugar_nacimiento: "Medellin",
        direccion: "Cra 50 # 12-45",
        documento: hashSha256("2002"),
        tipo_documento: "CC",
        usuario: "juan.perez",
        email: "juan.perez@example.com",
        password: hashSha256("secret123"),
        creado_por: "seed",
        fecha_creacion: now,
        ultima_actualizacion: now,
        actualizado_por: "seed",
      },
    ]);

    await queryInterface.bulkInsert("rol", [
      {
        id: 1,
        nombre: "ADMIN",
        descripcion: "Administrador del sistema",
        creado_por: "seed",
        fecha_creacion: now,
        ultima_actualizacion: now,
        actualizado_por: "seed",
      },
      {
        id: 2,
        nombre: "DOCTOR",
        descripcion: "Profesional de salud",
        creado_por: "seed",
        fecha_creacion: now,
        ultima_actualizacion: now,
        actualizado_por: "seed",
      },
      {
        id: 3,
        nombre: "PATIENT",
        descripcion: "Paciente",
        creado_por: "seed",
        fecha_creacion: now,
        ultima_actualizacion: now,
        actualizado_por: "seed",
      },
    ]);

    await queryInterface.bulkInsert("roles_usuario", [
      { id_rol: 1, id_usuario: 1 },
      { id_rol: 2, id_usuario: 1 },
      { id_rol: 3, id_usuario: 2 },
    ]);

    await queryInterface.bulkInsert("doctores", [
      {
        id: 1,
        licencia_medica: "MED-12345",
        id_usuario: 1,
        creado_por: 1,
        actualizado_por: 1,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("pacientes", [
      {
        id: 1,
        ocupacion: "Ingeniero",
        discapacidad: "Ninguna",
        religion: "Ninguna",
        etnia: "Mestizo",
        identidad_genero: "Masculino",
        sexo: "M",
        id_usuario: 2,
        creado_por: 1,
        actualizado_por: 1,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("horarios", [
      {
        id: 1,
        fecha: "2026-04-11",
        hora_inicio: "09:00:00",
        hora_fin: "09:30:00",
        estado: "DISPONIBLE",
        id_doctor: 1,
        creado_por: 1,
        actualizado_por: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        fecha: "2026-04-11",
        hora_inicio: "10:00:00",
        hora_fin: "10:30:00",
        estado: "OCUPADO",
        id_doctor: 1,
        creado_por: 1,
        actualizado_por: 1,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("citas", [
      {
        id: 1,
        tipo_cita: "GENERAL",
        estado: "PROGRAMADA",
        id_paciente: 1,
        id_doctor: 1,
        id_horario: 2,
        creado_por: 1,
        actualizado_por: 1,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("detalles_cita", [
      {
        id: 1,
        motivo: "Consulta general",
        antecedentes: "Ninguno",
        anamnesis: "Dolor leve",
        revision_sistemas: "Sin hallazgos",
        examen_fisico: "Normal",
        diagnostico: "Sin diagnostico",
        plan_manejo: "Observacion",
        evolucion: "Estable",
        id_cita: 1,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.sequelize.query(
      'SELECT setval(\'usuarios_id_seq\', (SELECT MAX(id) FROM usuarios));',
    );
    await queryInterface.sequelize.query(
      'SELECT setval(\'rol_id_seq\', (SELECT MAX(id) FROM rol));',
    );
    await queryInterface.sequelize.query(
      'SELECT setval(\'doctores_id_seq\', (SELECT MAX(id) FROM doctores));',
    );
    await queryInterface.sequelize.query(
      'SELECT setval(\'pacientes_id_seq\', (SELECT MAX(id) FROM pacientes));',
    );
    await queryInterface.sequelize.query(
      'SELECT setval(\'horarios_id_seq\', (SELECT MAX(id) FROM horarios));',
    );
    await queryInterface.sequelize.query(
      'SELECT setval(\'citas_id_seq\', (SELECT MAX(id) FROM citas));',
    );
    await queryInterface.sequelize.query(
      'SELECT setval(\'detalles_cita_id_seq\', (SELECT MAX(id) FROM detalles_cita));',
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("detalles_cita", null, {});
    await queryInterface.bulkDelete("citas", null, {});
    await queryInterface.bulkDelete("horarios", null, {});
    await queryInterface.bulkDelete("pacientes", null, {});
    await queryInterface.bulkDelete("doctores", null, {});
    await queryInterface.bulkDelete("roles_usuario", null, {});
    await queryInterface.bulkDelete("rol", null, {});
    await queryInterface.bulkDelete("usuarios", null, {});
  },
};
