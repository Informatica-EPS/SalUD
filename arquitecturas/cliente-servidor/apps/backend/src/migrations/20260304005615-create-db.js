"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rol", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      descripcion: { type: Sequelize.STRING(200) },
      creado_por: { type: Sequelize.STRING(100) },
      fecha_creacion: { type: Sequelize.DATE },
      ultima_actualizacion: { type: Sequelize.DATE },
      actualizado_por: { type: Sequelize.STRING(100) },
    });

    await queryInterface.createTable("usuarios", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      primer_nombre: { type: Sequelize.STRING(100) },
      segundo_nombre: { type: Sequelize.STRING(100) },
      primer_apellido: { type: Sequelize.STRING(100) },
      segundo_apellido: { type: Sequelize.STRING(100) },
      fecha_nacimiento: { type: Sequelize.DATEONLY },
      lugar_nacimiento: { type: Sequelize.STRING(150) },
      direccion: { type: Sequelize.STRING(200) },
      documento: { type: Sequelize.STRING(64), unique: true },
      tipo_documento: { type: Sequelize.STRING(30) },
      usuario: { type: Sequelize.STRING(80), unique: true },
      email: { type: Sequelize.STRING(150), unique: true },
      password: { type: Sequelize.STRING(64) },
      creado_por: { type: Sequelize.STRING(100) },
      fecha_creacion: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      ultima_actualizacion: { type: Sequelize.DATE },
      actualizado_por: { type: Sequelize.STRING(100) },
    });

    await queryInterface.createTable("roles_usuario", {
      id_usuario: {
        type: Sequelize.BIGINT,
        references: { model: "usuarios", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_rol: {
        type: Sequelize.BIGINT,
        references: { model: "rol", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable("doctores", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      licencia_medica: { type: Sequelize.STRING, allowNull: false },
      id_usuario: {
        type: Sequelize.BIGINT,
        references: { model: "usuarios", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      creado_por: { type: Sequelize.INTEGER },
      actualizado_por: { type: Sequelize.INTEGER },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("pacientes", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      ocupacion: { type: Sequelize.STRING },
      discapacidad: { type: Sequelize.STRING },
      religion: { type: Sequelize.STRING },
      etnia: { type: Sequelize.STRING },
      identidad_genero: { type: Sequelize.STRING },
      sexo: { type: Sequelize.STRING },
      id_usuario: {
        type: Sequelize.BIGINT,
        references: { model: "usuarios", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      creado_por: { type: Sequelize.INTEGER },
      actualizado_por: { type: Sequelize.INTEGER },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("horarios", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      fecha: { type: Sequelize.DATEONLY },
      hora_inicio: { type: Sequelize.TIME },
      hora_fin: { type: Sequelize.TIME },
      estado: { type: Sequelize.STRING },
      id_doctor: {
        type: Sequelize.INTEGER,
        references: { model: "doctores", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      creado_por: { type: Sequelize.INTEGER },
      actualizado_por: { type: Sequelize.INTEGER },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("citas", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      tipo_cita: { type: Sequelize.STRING },
      estado: { type: Sequelize.STRING },
      id_paciente: {
        type: Sequelize.INTEGER,
        references: { model: "pacientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_doctor: {
        type: Sequelize.INTEGER,
        references: { model: "doctores", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_horario: {
        type: Sequelize.INTEGER,
        references: { model: "horarios", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      creado_por: { type: Sequelize.INTEGER },
      actualizado_por: { type: Sequelize.INTEGER },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("detalles_cita", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      motivo: { type: Sequelize.TEXT },
      antecedentes: { type: Sequelize.TEXT },
      anamnesis: { type: Sequelize.TEXT },
      revision_sistemas: { type: Sequelize.TEXT },
      examen_fisico: { type: Sequelize.TEXT },
      diagnostico: { type: Sequelize.TEXT },
      plan_manejo: { type: Sequelize.TEXT },
      evolucion: { type: Sequelize.TEXT },
      id_cita: {
        type: Sequelize.INTEGER,
        references: { model: "citas", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("detalles_cita");
    await queryInterface.dropTable("citas");
    await queryInterface.dropTable("horarios");
    await queryInterface.dropTable("pacientes");
    await queryInterface.dropTable("doctores");
    await queryInterface.dropTable("roles_usuario");
    await queryInterface.dropTable("usuarios");
    await queryInterface.dropTable("rol");
  },
};
