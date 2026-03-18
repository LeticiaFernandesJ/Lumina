const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, '..', 'lumina.db');

let _db = null;

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(fileBuffer);
  } else {
    _db = new SQL.Database();
  }

  const save = () => {
    try {
      const data = _db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    } catch(e) {}
  };

  process.on('exit', save);
  process.on('SIGINT', () => { save(); process.exit(0); });
  process.on('SIGTERM', () => { save(); process.exit(0); });
  setInterval(save, 5000).unref();

  _db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS study_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      filename TEXT NOT NULL,
      extracted_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      material_id INTEGER,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      source_type TEXT DEFAULT 'pdf',
      topic_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      duration_minutes INTEGER DEFAULT 0,
      topic TEXT,
      cards_reviewed INTEGER DEFAULT 0,
      score_percent REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS essays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      topic_name TEXT NOT NULL,
      content TEXT NOT NULL,
      feedback_json TEXT,
      score REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS study_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      topic_name TEXT NOT NULL,
      plan_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS frequency_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return _db;
}

function makeStmt(sql) {
  return {
    get: (...params) => {
      const flat = params.flat();
      const stmt = _db.prepare(sql);
      stmt.bind(flat.length ? flat : undefined);
      const has = stmt.step();
      const row = has ? stmt.getAsObject() : undefined;
      stmt.free();
      return row;
    },
    all: (...params) => {
      const flat = params.flat();
      const results = [];
      const stmt = _db.prepare(sql);
      stmt.bind(flat.length ? flat : undefined);
      while (stmt.step()) results.push(stmt.getAsObject());
      stmt.free();
      return results;
    },
    run: (...params) => {
      const flat = params.flat();
      _db.run(sql, flat.length ? flat : undefined);
      const meta = _db.exec('SELECT last_insert_rowid() as id, changes() as c');
      const row = meta[0]?.values[0];
      return { lastInsertRowid: row?.[0] ?? 0, changes: row?.[1] ?? 0 };
    },
  };
}

const db = {
  prepare: (sql) => makeStmt(sql),
  run: (sql, ...params) => { _db.run(sql, params.flat()); },
  exec: (sql) => { _db.run(sql); },
  pragma: () => {},
  transaction: (fn) => (...args) => {
    _db.run('BEGIN');
    try { fn(...args); _db.run('COMMIT'); }
    catch (e) { _db.run('ROLLBACK'); throw e; }
  },
};

module.exports = db;
module.exports.initDb = initDb;
