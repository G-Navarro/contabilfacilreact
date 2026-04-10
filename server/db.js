const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('contabilfacil.db', { verbose: console.log });

// Initialize Tables
db.exec(`
--   DROP TABLE IF EXISTS tokens;
--   DROP TABLE IF EXISTS users;
--   DROP TABLE IF EXISTS offices;

  CREATE TABLE IF NOT EXISTS offices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    email TEXT,
    phone TEXT,
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    status TEXT DEFAULT 'active', -- 'active' or 'inactive'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    office_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Plain text for demo
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(office_id) REFERENCES offices(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    office_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(office_id) REFERENCES offices(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    office_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    cnpj TEXT,
    email TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(office_id) REFERENCES offices(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    office_id INTEGER NOT NULL,
    client_id INTEGER,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, in_progress, done
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(office_id) REFERENCES offices(id) ON DELETE CASCADE,
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS billings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    office_id INTEGER NOT NULL,
    client_id INTEGER,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, overdue
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(office_id) REFERENCES offices(id) ON DELETE CASCADE,
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  INSERT OR IGNORE INTO admin_users (email, password) VALUES ('admin@system.com', 'admin123');

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    cpf TEXT,
    pis TEXT,
    role TEXT,
    salary REAL,
    admission_date DATETIME,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    cbo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS work_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    schedule_json TEXT, -- JSON string for 7 days * 4 slots
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    xml_type TEXT NOT NULL, -- To track which parser processed it
    invoice_number TEXT,
    issue_date DATETIME,
    provider_cnpj TEXT,
    provider_name TEXT,
    taker_cnpj TEXT,
    taker_name TEXT,
    total_value REAL,
    raw_data TEXT, -- JSON fallback of the entire parsed XML
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
  );
`);

console.log('Database initialized successfully with detailed schema and default admin.');

module.exports = db;
