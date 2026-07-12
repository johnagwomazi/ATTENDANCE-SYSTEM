import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

/*
Database Reliability Audit Summary
- Schema execution previously ran on every startup and could re-trigger index errors.
- Index creation inside the SQL bootstrap was not idempotent and could fail with ER_DUP_KEYNAME.
- Partially created InnoDB tables could survive CREATE TABLE IF NOT EXISTS and leave the engine corrupted.
- Startup retries were unbounded, which could hide the real failure and spam logs forever.

Fix strategy
- Keep schema.sql table-only and idempotent.
- Validate tables, engines, and auth columns through information_schema before marking readiness.
- Create indexes only after checking whether they already exist.
- Limit startup retries to avoid infinite failure loops.
- Add DB_RECOVERY_MODE=true for dev-only destructive repair of corrupted local databases.
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '../../database/schema.sql');

const databaseName = process.env.DB_NAME || 'new_horizons_attendance_v2';
const dbRecoveryMode = String(process.env.DB_RECOVERY_MODE || '').toLowerCase() === 'true';
const maxStartupAttempts = Number(process.env.DB_BOOTSTRAP_MAX_RETRIES || 3);

const requiredTables = ['users', 'courses', 'enrollments', 'schedules', 'attendance_sessions', 'attendance', 'entry_attempts'];
const authRequiredColumns = ['id', 'full_name', 'email', 'phone', 'password', 'role', 'is_active'];
const requiredIndexes = [
  { table: 'enrollments', name: 'idx_enrollments_student_status', columns: 'student_id, enrollment_status' },
  { table: 'enrollments', name: 'idx_enrollments_course_status', columns: 'course_id, enrollment_status' },
  { table: 'schedules', name: 'idx_schedules_course_day', columns: 'course_id, day_of_week' },
  { table: 'attendance', name: 'idx_attendance_date_status', columns: 'attendance_date, status' },
  { table: 'entry_attempts', name: 'idx_entry_attempts_time', columns: 'attempt_time' }
];

let pool = null;
let databaseReady = false;
let bootstrapStarted = false;

const baseConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? ''
};

const logStep = (message) => {
  console.log(`[DB] ${message}`);
};

const logError = (step, error, action) => {
  console.error('[DB ERROR]');
  console.error(`Step: ${step}`);
  console.error(`Code: ${error?.code || 'UNKNOWN'}`);
  console.error(`Message: ${error?.message || 'Unknown database error'}`);
  console.error(`Action: ${action}`);
};

const createPool = () => {
  pool = mysql.createPool({
    ...baseConfig,
    database: databaseName,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
    multipleStatements: false
  });
};

const getRootConnection = () => {
  return mysql.createConnection({
    ...baseConfig,
    multipleStatements: true
  });
};

const getDatabaseConnection = () => {
  return mysql.createConnection({
    ...baseConfig,
    database: databaseName,
    multipleStatements: true
  });
};

const runSchemaFile = async (connection) => {
  const schemaSql = await readFile(schemaPath, 'utf8');
  const cleanedSchema = schemaSql
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim().toUpperCase();
      return !trimmed.startsWith('CREATE DATABASE') && !trimmed.startsWith('USE ');
    })
    .join('\n');

  await connection.query(cleanedSchema);
};

const ensureDatabaseExists = async () => {
  const connection = await getRootConnection();

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }
};

const getTableRows = async (connection) => {
  const [rows] = await connection.query(
    `SELECT TABLE_NAME, ENGINE
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN (${requiredTables.map(() => '?').join(', ')})`,
    [databaseName, ...requiredTables]
  );
  return rows;
};

const hasAllRequiredTables = async (connection) => {
  const rows = await getTableRows(connection);
  return rows.length === requiredTables.length;
};

const validateRequiredTables = async (connection) => {
  logStep('Validating tables...');
  const rows = await getTableRows(connection);
  const tableMap = new Map(rows.map((row) => [row.TABLE_NAME, row.ENGINE]));
  const missingTables = requiredTables.filter((tableName) => !tableMap.has(tableName));
  const invalidEngineTables = requiredTables.filter((tableName) => tableMap.get(tableName) !== 'InnoDB');

  if (missingTables.length || invalidEngineTables.length) {
    const error = new Error(
      `Schema validation failed. Missing tables: ${missingTables.join(', ') || 'none'}. Invalid engine tables: ${invalidEngineTables.join(', ') || 'none'}.`
    );
    error.code = 'ER_SCHEMA_VALIDATION_FAILED';
    error.step = 'validate-tables';
    error.location = 'database/schema.sql';
    error.action = dbRecoveryMode
      ? 'Recovery mode is enabled. Rebuild the database to repair invalid tables.'
      : 'Enable DB_RECOVERY_MODE=true for local repair, or manually drop and recreate the database.';
    throw error;
  }

  for (const tableName of requiredTables) {
    try {
      await connection.query(`SELECT 1 FROM \`${tableName}\` LIMIT 1`);
    } catch (error) {
      error.step = 'validate-tables';
      error.location = 'database/schema.sql';
      error.action = dbRecoveryMode
        ? 'Recovery mode is enabled. Rebuild the database to repair corrupted metadata.'
        : 'Enable DB_RECOVERY_MODE=true for local repair, or manually drop and recreate the database.';
      throw error;
    }
  }
};

const validateAuthTable = async (connection) => {
  logStep('Validating auth columns...');
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
    [databaseName]
  );

  const columnNames = new Set(rows.map((row) => row.COLUMN_NAME));
  const missingColumns = authRequiredColumns.filter((column) => !columnNames.has(column));

  if (missingColumns.length) {
    const error = new Error(`users table is missing required columns: ${missingColumns.join(', ')}`);
    error.code = 'ER_SCHEMA_VALIDATION_FAILED';
    error.step = 'validate-auth-columns';
    error.location = 'database/schema.sql';
    error.action = dbRecoveryMode
      ? 'Recovery mode is enabled. Rebuild the database to restore the auth table.'
      : 'Missing auth columns are fatal. Enable DB_RECOVERY_MODE=true or restore the schema manually.';
    throw error;
  }
};

const ensureIndexes = async (connection) => {
  logStep('Validating indexes...');

  for (const index of requiredIndexes) {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
      [databaseName, index.table, index.name]
    );

    const exists = Number(rows[0]?.count || 0) > 0;
    if (exists) {
      continue;
    }

    try {
      await connection.query(`ALTER TABLE \`${index.table}\` ADD INDEX \`${index.name}\` (${index.columns})`);
      logStep(`Created missing index ${index.name}`);
    } catch (error) {
      if (error?.code === 'ER_DUP_KEYNAME') {
        logStep(`Index ${index.name} already exists; skipping`);
        continue;
      }

      error.step = 'ensure-indexes';
      error.location = 'src/config/db.js';
      error.action = `Inspect table ${index.table} and create index ${index.name} manually if needed.`;
      throw error;
    }
  }
};

const createAndSeedDatabase = async () => {
  await ensureDatabaseExists();
  logStep('Database exists');

  const connection = await getDatabaseConnection();

  try {
    const schemaExists = await hasAllRequiredTables(connection);
    if (schemaExists) {
      logStep('Existing schema detected; skipping table creation');
      return;
    }

    logStep('Applying schema...');
    await runSchemaFile(connection);
  } finally {
    await connection.end();
  }
};

const dropDatabase = async () => {
  const connection = await getRootConnection();

  try {
    logStep('Dropping corrupted database...');
    await connection.query(`DROP DATABASE IF EXISTS \`${databaseName}\``);
  } finally {
    await connection.end();
  }
};

const performBootstrap = async () => {
  logStep('Connecting...');
  await createAndSeedDatabase();

  const connection = await getDatabaseConnection();
  try {
    await validateRequiredTables(connection);
    await validateAuthTable(connection);
    await ensureIndexes(connection);
  } finally {
    await connection.end();
  }

  logStep('Schema valid');
  createPool();
  logStep('Connection pool ready');
  databaseReady = true;
  logStep('Database ready');
  return true;
};

const isConnectionFailure = (error) => error?.code === 'ECONNREFUSED';

const isSchemaFailure = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    error?.code === 'ER_SCHEMA_VALIDATION_FAILED' ||
    error?.code === 'ER_TABLE_EXISTS_ERROR' ||
    error?.code === 'ER_BAD_TABLE_ERROR' ||
    error?.errno === 1932 ||
    error?.errno === 1215 ||
    message.includes("doesn't exist in engine") ||
    message.includes('foreign key constraint is incorrectly formed') ||
    message.includes('duplicate key name')
  );
};

const attemptBootstrap = async (attemptNumber = 1) => {
  try {
    await performBootstrap();
  } catch (error) {
    databaseReady = false;
    const isRetryableConnection = isConnectionFailure(error) && attemptNumber < maxStartupAttempts;
    const canRecover = dbRecoveryMode && isSchemaFailure(error);

    logError(
      error.step || 'bootstrap',
      error,
      canRecover
        ? 'Recovery mode enabled. Rebuilding the database once.'
        : isRetryableConnection
          ? `Retrying startup attempt ${attemptNumber + 1} of ${maxStartupAttempts}.`
          : 'Startup halted. Fix the database issue and restart the backend.'
    );

    if (canRecover) {
      try {
        await dropDatabase();
        await performBootstrap();
        return;
      } catch (recoveryError) {
        databaseReady = false;
        logError(
          recoveryError.step || 'recovery',
          recoveryError,
          'Recovery failed. Start with a clean database or inspect the schema manually.'
        );
        return;
      }
    }

    if (isRetryableConnection) {
      setTimeout(() => {
        void attemptBootstrap(attemptNumber + 1);
      }, 5000);
      return;
    }
  }
};

export const startDatabaseBootstrap = () => {
  if (bootstrapStarted) {
    return;
  }

  bootstrapStarted = true;
  void attemptBootstrap();
};

export const isDatabaseReady = () => databaseReady;

export const query = (sql, params = []) => {
  if (!pool) {
    throw new Error('Database is not initialized. Call initDatabase() before using queries.');
  }
  return pool.execute(sql, params);
};

export const getConnection = () => {
  if (!pool) {
    throw new Error('Database is not initialized. Call initDatabase() before using connections.');
  }
  return pool.getConnection();
};

export default pool;
