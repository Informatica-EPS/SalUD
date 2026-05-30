'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        CREATE DOMAIN dom_tipo_documento AS VARCHAR(30)
          CHECK (VALUE IN ('CC', 'CE', 'PAS', 'PE', 'TI', 'RC'));
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;

      DO $$
      BEGIN
        CREATE DOMAIN dom_sexo AS VARCHAR(1)
          CHECK (VALUE IN ('M', 'F'));
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS usuarios (
        id BIGSERIAL PRIMARY KEY,
        primer_nombre VARCHAR(100) NOT NULL,
        segundo_nombre VARCHAR(100) NOT NULL,
        primer_apellido VARCHAR(100) NOT NULL,
        segundo_apellido VARCHAR(100) NOT NULL,
        fecha_nacimiento DATE NOT NULL,
        lugar_nacimiento VARCHAR(150),
        direccion VARCHAR(200),
        documento VARCHAR(64) NOT NULL UNIQUE,
        tipo_documento dom_tipo_documento NOT NULL,
        usuario VARCHAR(80) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(64) NOT NULL,
        creado_por VARCHAR(100),
        fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
        ultima_actualizacion TIMESTAMPTZ,
        actualizado_por VARCHAR(100),
        CONSTRAINT usuarios_tipo_documento_documento_uq UNIQUE (tipo_documento, documento)
      );

      CREATE TABLE IF NOT EXISTS roles (
        id BIGSERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion VARCHAR(200),
        creado_por VARCHAR(100),
        fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
        ultima_actualizacion TIMESTAMPTZ,
        actualizado_por VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS especialidades (
        id BIGSERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        descripcion VARCHAR(200)
      );

      CREATE TABLE IF NOT EXISTS medicos (
        id BIGSERIAL PRIMARY KEY,
        registro_medico VARCHAR NOT NULL,
        especialidad BIGINT,
        creado_por VARCHAR(100),
        fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
        ultima_actualizacion TIMESTAMPTZ,
        actualizado_por VARCHAR(100),
        id_usuario BIGINT UNIQUE,
        CONSTRAINT medicos_especialidad_fkey
          FOREIGN KEY (especialidad) REFERENCES especialidades(id)
          ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT medicos_id_usuario_fkey
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pacientes (
        id BIGSERIAL PRIMARY KEY,
        ocupacion VARCHAR(50),
        discapacidad VARCHAR(50),
        religion VARCHAR(50),
        etnia VARCHAR(50),
        identidad_genero VARCHAR(50) NOT NULL,
        sexo dom_sexo NOT NULL,
        creado_por VARCHAR(100),
        fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
        ultima_actualizacion TIMESTAMPTZ,
        actualizado_por VARCHAR(100),
        id_usuario BIGINT UNIQUE,
        CONSTRAINT pacientes_id_usuario_fkey
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS franja_horaria (
        id BIGSERIAL PRIMARY KEY,
        fecha DATE,
        hora_inicio TIME,
        hora_fin TIME,
        estado VARCHAR(20),
        creado_por VARCHAR(100),
        fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
        ultima_actualizacion TIMESTAMPTZ,
        actualizado_por VARCHAR(100),
        id_medico BIGINT NOT NULL,
        CONSTRAINT franja_horaria_rango_hora_ck CHECK (hora_inicio < hora_fin),
        CONSTRAINT franja_horaria_medico_fecha_hora_uq UNIQUE (id_medico, fecha, hora_inicio, hora_fin),
        CONSTRAINT franja_horaria_id_medico_fkey
          FOREIGN KEY (id_medico) REFERENCES medicos(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS citas (
        id BIGSERIAL PRIMARY KEY,
        tipo_cita VARCHAR(20) NOT NULL,
        estado VARCHAR(20) NOT NULL,
        creado_por VARCHAR(100),
        fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
        ultima_actualizacion TIMESTAMPTZ,
        actualizado_por VARCHAR(100),
        id_paciente BIGINT NOT NULL,
        id_medico BIGINT NOT NULL,
        id_franja_horaria BIGINT NOT NULL,
        CONSTRAINT citas_id_paciente_fkey
          FOREIGN KEY (id_paciente) REFERENCES pacientes(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT citas_id_medico_fkey
          FOREIGN KEY (id_medico) REFERENCES medicos(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT citas_id_franja_horaria_fkey
          FOREIGN KEY (id_franja_horaria) REFERENCES franja_horaria(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS detalle_cita (
        id_cita BIGINT PRIMARY KEY,
        motivo TEXT,
        antecedentes TEXT,
        anamnesis TEXT,
        revision_sistemas TEXT,
        examen_fisico TEXT,
        diagnostico TEXT,
        plan_manejo TEXT,
        evolucion TEXT,
        CONSTRAINT detalle_cita_id_cita_fkey
          FOREIGN KEY (id_cita) REFERENCES citas(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ordenes (
        id BIGSERIAL PRIMARY KEY,
        tipo VARCHAR(20) NOT NULL,
        id_medicamento BIGINT,
        id_cita BIGINT NOT NULL,
        fecha_vencimiento TIMESTAMPTZ NOT NULL,
        estado VARCHAR(50),
        entidad_destino VARCHAR(100),
        especialidad BIGINT,
        descripcion VARCHAR(200),
        fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
        fecha_actualizacion TIMESTAMPTZ,
        creado_por VARCHAR(100),
        actualizado_por VARCHAR(100),
        CONSTRAINT ordenes_id_cita_fkey
          FOREIGN KEY (id_cita) REFERENCES citas(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT ordenes_especialidad_fkey
          FOREIGN KEY (especialidad) REFERENCES especialidades(id)
          ON DELETE SET NULL ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS roles_usuario (
        id_rol BIGINT NOT NULL,
        id_usuario BIGINT NOT NULL,
        PRIMARY KEY (id_rol, id_usuario),
        CONSTRAINT roles_usuario_id_rol_fkey
          FOREIGN KEY (id_rol) REFERENCES roles(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT roles_usuario_id_usuario_fkey
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS roles_usuario;
      DROP TABLE IF EXISTS ordenes;
      DROP TABLE IF EXISTS detalle_cita;
      DROP TABLE IF EXISTS citas;
      DROP TABLE IF EXISTS franja_horaria;
      DROP TABLE IF EXISTS pacientes;
      DROP TABLE IF EXISTS medicos;
      DROP TABLE IF EXISTS especialidades;
      DROP TABLE IF EXISTS roles;
      DROP TABLE IF EXISTS usuarios;
      DROP DOMAIN IF EXISTS dom_sexo;
      DROP DOMAIN IF EXISTS dom_tipo_documento;
    `);
  },
};
