const crypto = require("crypto");

const SENSITIVE_FIELDS = [
  "anamnesis",
  "antecedentes",
  "diagnostico",
  "evolucion",
  "examenFisico",
  "motivo",
  "planManejo",
  "revisionSistemas",
];

function getEncryptionKey() {
  const keyHex = process.env.APPOINTMENT_DETAIL_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error("APPOINTMENT_DETAIL_KEY debe ser hex de 64 caracteres");
  }
  return Buffer.from(keyHex, "hex");
}

function encryptField(plainText) {
  if (plainText === null || plainText === undefined) return plainText;
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(plainText), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptField(cipherText) {
  if (cipherText === null || cipherText === undefined) return cipherText;
  const key = getEncryptionKey();
  const parts = String(cipherText).split(":");
  if (parts.length !== 3) {
    return cipherText;
  }
  const [ivHex, tagHex, dataHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

function encryptSensitiveFields(data) {
  if (!data) return data;
  const out = { ...data };
  for (const field of SENSITIVE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(out, field)) {
      out[field] = encryptField(out[field]);
    }
  }
  return out;
}

function decryptSensitiveFields(record) {
  if (!record) return record;
  const out = record.toJSON ? record.toJSON() : { ...record };
  for (const field of SENSITIVE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(out, field)) {
      out[field] = decryptField(out[field]);
    }
  }
  return out;
}

module.exports = {
  SENSITIVE_FIELDS,
  encryptField,
  decryptField,
  encryptSensitiveFields,
  decryptSensitiveFields,
};
