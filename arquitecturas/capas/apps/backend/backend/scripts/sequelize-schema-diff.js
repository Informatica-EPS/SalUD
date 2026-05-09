#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const [key, inlineValue] = token.slice(2).split("=", 2);
    const next = argv[i + 1];
    const value =
      inlineValue !== undefined
        ? inlineValue
        : next && !next.startsWith("--")
          ? next
          : true;
    args[key] = value;
    if (inlineValue === undefined && value !== true) i += 1;
  }
  return args;
}

function getTimestamp() {
  return new Date().toISOString().replace(/[-:.TZ]/g, "");
}

function normalizeSqlType(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/charactervarying/g, "varchar")
    .replace(/timestampwithouttimezone/g, "timestamp")
    .replace(/timestampwithtimezone/g, "timestamptz");
}

function normalizeRule(value) {
  return String(value || "").toUpperCase();
}

function singularizeTableName(name) {
  const value = String(name || "");
  if (value.endsWith("es")) return value.slice(0, -2);
  if (value.endsWith("s")) return value.slice(0, -1);
  return value;
}

function resolveReferenceTableName(refModel) {
  if (!refModel) return null;
  if (typeof refModel === "string") return refModel;
  if (typeof refModel === "function") {
    if (refModel.tableName) return refModel.tableName;
    if (refModel.name) return singularizeTableName(refModel.name).toLowerCase();
  }
  if (typeof refModel === "object") {
    if (refModel.tableName) return refModel.tableName;
    if (refModel.name) return singularizeTableName(refModel.name).toLowerCase();
  }
  return null;
}

function resolveConfig(configPath, envName) {
  const loaded = require(configPath);
  return loaded[envName] || loaded;
}

function buildSequelize(configPath, envName) {
  const envConfig = resolveConfig(configPath, envName);
  const options = { ...envConfig, logging: false };
  delete options.use_env_variable;

  if (envConfig.use_env_variable) {
    const variableName = envConfig.use_env_variable;
    const url = process.env[variableName];
    if (!url) {
      throw new Error(`Falta variable de entorno ${variableName}`);
    }
    return new Sequelize(url, options);
  }

  return new Sequelize(
    envConfig.database,
    envConfig.username,
    envConfig.password,
    options,
  );
}

function toTypeExpression(attrType) {
  const key = attrType && attrType.key ? attrType.key : "STRING";
  const options = attrType && attrType.options ? attrType.options : {};
  let expression = `Sequelize.${key}`;

  if (Array.isArray(options.values) && options.values.length > 0) {
    expression += `(${options.values.map((v) => JSON.stringify(v)).join(", ")})`;
  } else if (options.length !== undefined && options.length !== null) {
    expression += `(${options.length})`;
  }

  if (options.unsigned) expression += ".UNSIGNED";
  return expression;
}

function toLiteral(value) {
  if (value === undefined) return null;
  if (value === null) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  return JSON.stringify(value);
}

function normalizeAttribute(attributeName, attr) {
  const normalized = { ...attr };
  normalized.field = attr.field || attr.fieldName || attributeName;

  if (normalized.references && normalized.references.model) {
    const tableName = resolveReferenceTableName(normalized.references.model);
    if (tableName) normalized.references = { ...normalized.references, model: tableName };
  }

  return normalized;
}

function toColumnDefinitionObject(attr) {
  const definition = {
    type: { __raw: toTypeExpression(attr.type) },
  };

  [
    "allowNull",
    "autoIncrement",
    "primaryKey",
    "unique",
    "onDelete",
    "onUpdate",
    "comment",
  ].forEach((key) => {
    if (attr[key] !== undefined && attr[key] !== null) definition[key] = attr[key];
  });

  if (attr.defaultValue !== undefined && attr.defaultValue !== null) {
    if (typeof attr.defaultValue === "object" && attr.defaultValue.key === "NOW") {
      definition.defaultValue = { __raw: "Sequelize.NOW" };
    } else if (typeof attr.defaultValue !== "function") {
      definition.defaultValue = attr.defaultValue;
    }
  }

  if (attr.references && attr.references.model) {
    definition.references = {
      model: attr.references.model,
      key: attr.references.key || "id",
    };
  }

  return definition;
}

function objectToJs(value, indent = 0) {
  const space = " ".repeat(indent);
  if (value && typeof value === "object" && value.__raw) return value.__raw;
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${space}  ${objectToJs(v, indent + 2)}`).join(",\n");
    return `[\n${items}\n${space}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    const body = entries
      .map(([k, v]) => `${space}  ${k}: ${objectToJs(v, indent + 2)}`)
      .join(",\n");
    return `{\n${body}\n${space}}`;
  }
  return toLiteral(value);
}

function compareColumn(dbColumn, modelAttr) {
  const issues = [];
  if (!dbColumn) return issues;

  const desiredAllowNull = modelAttr.allowNull;
  if (desiredAllowNull !== undefined && dbColumn.allowNull !== desiredAllowNull) {
    issues.push("allowNull");
  }

  const dbType = normalizeSqlType(dbColumn.type);
  const modelType = normalizeSqlType(
    modelAttr.type && modelAttr.type.toSql ? modelAttr.type.toSql() : modelAttr.type,
  );
  if (dbType && modelType && dbType !== modelType) {
    issues.push("type");
  }

  return issues;
}

async function loadModels(sequelize, modelsDir) {
  const databaseModulePath = path.resolve(modelsDir, "..", "config", "database.js");
  const fallbackDatabaseModulePath = path.resolve("./src/config/database.js");
  const modulePathToOverride = fs.existsSync(databaseModulePath)
    ? databaseModulePath
    : fallbackDatabaseModulePath;
  require.cache[modulePathToOverride] = {
    id: modulePathToOverride,
    filename: modulePathToOverride,
    loaded: true,
    exports: sequelize,
  };

  fs.readdirSync(modelsDir)
    .filter((file) => file.endsWith(".model.js"))
    .forEach((file) => {
      const modelPath = path.join(modelsDir, file);
      delete require.cache[modelPath];
      require(modelPath);
    });

  const associationsPath = path.join(modelsDir, "associations.js");
  if (fs.existsSync(associationsPath)) {
    delete require.cache[associationsPath];
    require(associationsPath);
  }

  return sequelize.models;
}

function collectDesiredIndexes(model) {
  const byName = new Map();

  Object.entries(model.uniqueKeys || {}).forEach(([name, spec]) => {
    if (!Array.isArray(spec.fields) || spec.fields.length === 0) return;
    byName.set(name, { name, unique: true, fields: spec.fields });
  });

  (model.options.indexes || []).forEach((idx) => {
    const fields = (idx.fields || []).map((f) => (typeof f === "string" ? f : f.name)).filter(Boolean);
    if (!fields.length) return;
    const name = idx.name || `${model.tableName}_${fields.join("_")}_${idx.unique ? "unique" : "idx"}`;
    byName.set(name, { name, unique: Boolean(idx.unique), fields });
  });

  return Array.from(byName.values());
}

function makeCreateTableOperation(tableName, attrsByField) {
  const lines = [`    await queryInterface.createTable('${tableName}', {`];
  const entries = Object.entries(attrsByField);
  entries.forEach(([field, attr], i) => {
    const def = toColumnDefinitionObject(attr);
    lines.push(`      ${field}: ${objectToJs(def, 6)}${i === entries.length - 1 ? "" : ","}`);
  });
  lines.push("    });");
  return lines.join("\n");
}

function makeAddColumnOperation(tableName, field, attr) {
  const def = toColumnDefinitionObject(attr);
  return `    await queryInterface.addColumn('${tableName}', '${field}', ${objectToJs(def, 4)});`;
}

function makeChangeColumnOperation(tableName, field, attr) {
  const def = toColumnDefinitionObject(attr);
  return `    await queryInterface.changeColumn('${tableName}', '${field}', ${objectToJs(def, 4)});`;
}

function makeCreateIndexOperation(tableName, index) {
  const safeTable = tableName.replace(/"/g, '""');
  const safeIndexName = String(index.name).replace(/"/g, '""');
  const safeColumns = index.fields.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(", ");
  const unique = index.unique ? "UNIQUE " : "";
  return `    await queryInterface.sequelize.query('CREATE ${unique}INDEX IF NOT EXISTS "${safeIndexName}" ON "${safeTable}" (${safeColumns});');`;
}

function makeRemoveConstraintOperation(tableName, constraintName) {
  return `    await queryInterface.removeConstraint('${tableName}', '${constraintName}').catch(() => {});`;
}

function makeAddForeignKeyOperation(spec) {
  return `    await queryInterface.addConstraint('${spec.table}', {
      fields: ['${spec.column}'],
      type: 'foreign key',
      name: '${spec.name}',
      references: { table: '${spec.refTable}', field: '${spec.refColumn}' },
      onDelete: '${spec.onDelete}',
      onUpdate: '${spec.onUpdate}'
    });`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const envName = args.env || process.env.NODE_ENV || "development";
  process.env.NODE_ENV = envName;
  const dropMissingColumns =
    args["drop-missing-columns"] === true ||
    String(args["drop-missing-columns"] || "").toLowerCase() === "true";

  const modelsDir = path.resolve(args["models-path"] || "./src/models");
  const migrationsDir = path.resolve(args["migrations-path"] || "./src/migrations");
  const configPath = path.resolve(args.config || "./src/config/database/config.js");
  const name = args.name ? String(args.name) : "schema_diff";

  if (!fs.existsSync(modelsDir)) throw new Error(`No existe models path: ${modelsDir}`);
  if (!fs.existsSync(migrationsDir)) fs.mkdirSync(migrationsDir, { recursive: true });

  const sequelize = buildSequelize(configPath, envName);
  await sequelize.authenticate();
  const models = await loadModels(sequelize, modelsDir);
  const queryInterface = sequelize.getQueryInterface();

  const upOps = [];
  const downOps = [];
  const touched = [];

  for (const modelName of Object.keys(models)) {
    const model = models[modelName];
    const tableName = model.tableName;
    const attrsByField = {};

    Object.entries(model.rawAttributes || {}).forEach(([attrName, rawAttr]) => {
      const attr = normalizeAttribute(attrName, rawAttr);
      attrsByField[attr.field] = attr;
    });

    let dbColumns = null;
    try {
      dbColumns = await queryInterface.describeTable(tableName);
    } catch {
      dbColumns = null;
    }

    if (!dbColumns) {
      upOps.push(makeCreateTableOperation(tableName, attrsByField));
      downOps.unshift(`    await queryInterface.dropTable('${tableName}');`);
      touched.push(`create table ${tableName}`);

      const indexes = collectDesiredIndexes(model);
      indexes.forEach((idx) => {
        upOps.push(makeCreateIndexOperation(tableName, idx));
        downOps.unshift(`    await queryInterface.removeIndex('${tableName}', '${idx.name}').catch(() => {});`);
      });
      continue;
    }

    for (const [field, attr] of Object.entries(attrsByField)) {
      const dbColumn = dbColumns[field];
      if (!dbColumn) {
        upOps.push(makeAddColumnOperation(tableName, field, attr));
        downOps.unshift(`    await queryInterface.removeColumn('${tableName}', '${field}').catch(() => {});`);
        touched.push(`add column ${tableName}.${field}`);
      } else {
        const issues = compareColumn(dbColumn, attr);
        if (issues.length > 0) {
          upOps.push(makeChangeColumnOperation(tableName, field, attr));
          touched.push(`change column ${tableName}.${field} [${issues.join(", ")}]`);
        }
      }
    }

    if (dropMissingColumns) {
      for (const dbField of Object.keys(dbColumns)) {
        if (attrsByField[dbField]) continue;
        upOps.push(`    await queryInterface.removeColumn('${tableName}', '${dbField}');`);
        touched.push(`remove column ${tableName}.${dbField}`);
      }
    }

    const currentIndexes = await queryInterface.showIndex(tableName);
    const currentByName = new Set(currentIndexes.map((i) => i.name));
    const desiredIndexes = collectDesiredIndexes(model);

    desiredIndexes.forEach((idx) => {
      if (!idx.name || currentByName.has(idx.name)) return;
      upOps.push(makeCreateIndexOperation(tableName, idx));
      downOps.unshift(`    await queryInterface.removeIndex('${tableName}', '${idx.name}').catch(() => {});`);
      touched.push(`add index ${tableName}.${idx.name}`);
    });

    const dbForeignKeys = await queryInterface
      .getForeignKeyReferencesForTable(tableName)
      .catch(() => []);
    const dbByColumn = new Map();
    dbForeignKeys.forEach((fk) => {
      const column = fk.columnName || fk.column_name;
      const constraintName = fk.constraintName || fk.constraint_name;
      const referencedTable = fk.referencedTableName || fk.referenced_table_name;
      const referencedColumn = fk.referencedColumnName || fk.referenced_column_name;
      const onDelete = fk.deleteAction || fk.onDelete || fk.delete_rule;
      const onUpdate = fk.updateAction || fk.onUpdate || fk.update_rule;
      if (!column || !constraintName) return;
      dbByColumn.set(column, {
        name: constraintName,
        column,
        refTable: referencedTable,
        refColumn: referencedColumn || "id",
        onDelete: normalizeRule(onDelete),
        onUpdate: normalizeRule(onUpdate),
      });
    });

    for (const [field, attr] of Object.entries(attrsByField)) {
      if (!attr.references || !attr.references.model) continue;

      const desired = {
        table: tableName,
        column: field,
        refTable: resolveReferenceTableName(attr.references.model),
        refColumn: attr.references.key || "id",
        onDelete: normalizeRule(attr.onDelete || "SET NULL"),
        onUpdate: normalizeRule(attr.onUpdate || "CASCADE"),
      };
      desired.name = `${tableName}_${field}_fkey`;

      if (!desired.refTable) continue;

      const current = dbByColumn.get(field);
      if (!current) {
        upOps.push(makeAddForeignKeyOperation(desired));
        downOps.unshift(makeRemoveConstraintOperation(tableName, desired.name));
        touched.push(`add fk ${tableName}.${field} -> ${desired.refTable}.${desired.refColumn}`);
        continue;
      }

      const sameRef =
        String(current.refTable || "") === String(desired.refTable) &&
        String(current.refColumn || "") === String(desired.refColumn);
      const sameRules =
        normalizeRule(current.onDelete) === normalizeRule(desired.onDelete) &&
        normalizeRule(current.onUpdate) === normalizeRule(desired.onUpdate);

      if (!sameRef || !sameRules || current.name !== desired.name) {
        upOps.push(makeRemoveConstraintOperation(tableName, current.name));
        upOps.push(makeAddForeignKeyOperation(desired));
        touched.push(
          `change fk ${tableName}.${field} (${current.onDelete}/${current.onUpdate} -> ${desired.onDelete}/${desired.onUpdate})`,
        );
      }
    }
  }

  if (upOps.length === 0) {
    console.log("schema-diff: sin cambios detectados.");
    await sequelize.close();
    return;
  }

  const fileName = `${getTimestamp()}-${name}.js`;
  const content = `/* Auto-generated by sequelize-schema-diff.js */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
${upOps.join("\n\n")}
  },

  down: async (queryInterface, Sequelize) => {
${downOps.length ? downOps.join("\n") : "    // No automatic rollback available for this migration."}
  }
};
`;

  fs.writeFileSync(path.join(migrationsDir, fileName), content);
  console.log(`schema-diff: generado ${fileName}`);
  touched.forEach((line) => console.log(` - ${line}`));
  await sequelize.close();
}

main().catch((error) => {
  console.error(`schema-diff error: ${error.message}`);
  process.exit(1);
});
