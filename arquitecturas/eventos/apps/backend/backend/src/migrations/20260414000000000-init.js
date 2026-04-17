'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ── 1. usuarios ────────────────────────────────────────────────
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      primer_nombre:       { type: Sequelize.STRING(100) },
      segundo_nombre:      { type: Sequelize.STRING(100) },
      primer_apellido:     { type: Sequelize.STRING(100) },
      segundo_apellido:    { type: Sequelize.STRING(100) },
      fecha_nacimiento:    { type: Sequelize.DATEONLY },
      lugar_nacimiento:    { type: Sequelize.STRING(150) },
      direccion:           { type: Sequelize.STRING(200) },
      documento:           { type: Sequelize.STRING(64), unique: true },
      tipo_documento:      { type: Sequelize.STRING(30) },
      usuario:             { type: Sequelize.STRING(80), unique: true },
      email:               { type: Sequelize.STRING(150), unique: true },
      password:            { type: Sequelize.STRING(64) },
      creado_por:          { type: Sequelize.STRING(100) },
      fecha_creacion:      { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      ultima_actualizacion:{ type: Sequelize.DATE },
      actualizado_por:     { type: Sequelize.STRING(100) },
    });

    await queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_documento_unique" ON "usuarios" ("documento");');
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_usuario_unique"   ON "usuarios" ("usuario");');
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_email_unique"     ON "usuarios" ("email");');

    // ── 2. rol ─────────────────────────────────────────────────────
    await queryInterface.createTable('rol', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre:              { type: Sequelize.STRING(100), allowNull: false },
      descripcion:         { type: Sequelize.STRING(200) },
      creado_por:          { type: Sequelize.STRING(100) },
      fecha_creacion:      { type: Sequelize.DATE },
      ultima_actualizacion:{ type: Sequelize.DATE },
      actualizado_por:     { type: Sequelize.STRING(100) },
    });

    // ── 3. especialidades ──────────────────────────────────────────
    await queryInterface.createTable('especialidades', {
      id:          { type: Sequelize.STRING, primaryKey: true },
      nombre:      { type: Sequelize.STRING(50), allowNull: false },
      descripcion: { type: Sequelize.STRING(200) },
    });

    // ── 4. doctores ────────────────────────────────────────────────
    await queryInterface.createTable('doctores', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      licencia_medica: { type: Sequelize.STRING, allowNull: false },
      especialidad: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: 'especialidades', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      id_usuario: {
        type: Sequelize.BIGINT,
        unique: true,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      creado_por:      { type: Sequelize.INTEGER },
      actualizado_por: { type: Sequelize.INTEGER },
      created_at:      { type: Sequelize.DATE, allowNull: false },
      updated_at:      { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS "doctores_id_usuario_unique" ON "doctores" ("id_usuario");');

    // ── 5. pacientes ───────────────────────────────────────────────
    await queryInterface.createTable('pacientes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ocupacion:        { type: Sequelize.STRING },
      discapacidad:     { type: Sequelize.STRING },
      religion:         { type: Sequelize.STRING },
      etnia:            { type: Sequelize.STRING },
      identidad_genero: { type: Sequelize.STRING },
      sexo:             { type: Sequelize.STRING },
      id_usuario: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      creado_por:      { type: Sequelize.INTEGER },
      actualizado_por: { type: Sequelize.INTEGER },
      created_at:      { type: Sequelize.DATE, allowNull: false },
      updated_at:      { type: Sequelize.DATE, allowNull: false },
    });

    // ── 6. horarios ────────────────────────────────────────────────
    await queryInterface.createTable('horarios', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fecha:       { type: Sequelize.DATEONLY },
      hora_inicio: { type: Sequelize.TIME },
      hora_fin:    { type: Sequelize.TIME },
      estado:      { type: Sequelize.STRING },
      id_doctor: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'doctores', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      creado_por:      { type: Sequelize.INTEGER },
      actualizado_por: { type: Sequelize.INTEGER },
      created_at:      { type: Sequelize.DATE, allowNull: false },
      updated_at:      { type: Sequelize.DATE, allowNull: false },
    });

    // ── 7. citas ───────────────────────────────────────────────────
    await queryInterface.createTable('citas', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tipo_cita: { type: Sequelize.STRING },
      estado:    { type: Sequelize.STRING },
      id_paciente: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'pacientes', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      id_doctor: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'doctores', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      id_horario: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'horarios', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      creado_por:      { type: Sequelize.INTEGER },
      actualizado_por: { type: Sequelize.INTEGER },
      created_at:      { type: Sequelize.DATE, allowNull: false },
      updated_at:      { type: Sequelize.DATE, allowNull: false },
    });

    // ── 8. detalles_cita ───────────────────────────────────────────
    await queryInterface.createTable('detalles_cita', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      motivo:            { type: Sequelize.TEXT },
      antecedentes:      { type: Sequelize.TEXT },
      anamnesis:         { type: Sequelize.TEXT },
      revision_sistemas: { type: Sequelize.TEXT },
      examen_fisico:     { type: Sequelize.TEXT },
      diagnostico:       { type: Sequelize.TEXT },
      plan_manejo:       { type: Sequelize.TEXT },
      evolucion:         { type: Sequelize.TEXT },
      id_cita: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'citas', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    // ── 9. ordenes ─────────────────────────────────────────────────
    await queryInterface.createTable('ordenes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_cita: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'citas', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      fecha_vencimiento: { type: Sequelize.DATE },
      estado:            { type: Sequelize.STRING(50) },
      entidad_destino:   { type: Sequelize.STRING(100) },
      especialidad: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: 'especialidades', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      descripcion: { type: Sequelize.STRING(200) },
      created_at:  { type: Sequelize.DATE, allowNull: false },
      updated_at:  { type: Sequelize.DATE, allowNull: false },
    });

    // ── 10. roles_usuario ──────────────────────────────────────────
    await queryInterface.createTable('roles_usuario', {
      id_rol: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: { model: 'rol', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_usuario: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    });

    await queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS "roles_usuario_id_rol_id_usuario_unique" ON "roles_usuario" ("id_rol", "id_usuario");');
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('roles_usuario');
    await queryInterface.dropTable('ordenes');
    await queryInterface.dropTable('detalles_cita');
    await queryInterface.dropTable('citas');
    await queryInterface.dropTable('horarios');
    await queryInterface.dropTable('pacientes');
    await queryInterface.dropTable('doctores');
    await queryInterface.dropTable('especialidades');
    await queryInterface.dropTable('rol');
    await queryInterface.dropTable('usuarios');
  },
};
