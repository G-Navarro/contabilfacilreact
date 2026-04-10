const express = require('express');
const cors = require('cors');
const db = require('./db');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Proxy CNPJ Request
app.get('/api/cnpj/:cnpj', async (req, res) => {
    try {
        const { cnpj } = req.params;
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        const data = await response.json();

        if (response.ok) {
            res.json(data);
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        console.error('CNPJ Proxy Error:', error);
        res.status(500).json({ error: 'Erro ao consultar API externa' });
    }
});

// === ADMIN / PUBLIC ROUTES ===

// Get All Offices (With User Count)
app.get('/api/offices', (req, res) => {
    try {
        const stmt = db.prepare(`
        SELECT o.*, COUNT(u.id) as user_count 
        FROM offices o 
        LEFT JOIN users u ON o.id = u.office_id 
        GROUP BY o.id 
        ORDER BY o.created_at DESC
    `);
        const offices = stmt.all();
        res.json(offices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle Office Status
app.patch('/api/offices/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const stmt = db.prepare('UPDATE offices SET status = ? WHERE id = ?');
        stmt.run(status, id);
        res.json({ success: true, status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Office
app.post('/api/offices', (req, res) => {
    const { name, cnpj, email, phone, street, number, complement, neighborhood, city, state } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO offices (name, cnpj, email, phone, street, number, complement, neighborhood, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        const info = stmt.run(name, cnpj, email, phone, street, number, complement, neighborhood, city, state);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'CNPJ já cadastrado.' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Get Users for Office
app.get('/api/offices/:id/users', (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare('SELECT id, name, email, created_at FROM users WHERE office_id = ?');
        const users = stmt.all(id);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create User
app.post('/api/users', (req, res) => {
    const { officeId, name, email, password } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO users (office_id, name, email, password) VALUES (?, ?, ?, ?)');
        const info = stmt.run(officeId, name, email, password);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'Email já cadastrado.' });
        }
        res.status(500).json({ error: error.message });
    }
});

// === SCHEMA MIGRATION FOR EMPLOYEES ===
// (Placed here to run on server start, though technically inside app logic it runs once)
// Actually, let's run this immediately at top level scope
try {
    const columns = db.prepare("PRAGMA table_info(employees)").all();
    const hasInternalId = columns.some(c => c.name === 'internal_id');
    const hasEsocial = columns.some(c => c.name === 'esocial_registration');
    const hasRoleId = columns.some(c => c.name === 'role_id');
    const hasWorkScheduleId = columns.some(c => c.name === 'work_schedule_id');
    const hasDataSaida = columns.some(c => c.name === 'data_saida');

    if (!hasInternalId) {
        console.log('[MIGRATION] Adding internal_id to employees table...');
        db.prepare("ALTER TABLE employees ADD COLUMN internal_id TEXT").run();
        try { db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_emp_client_internal ON employees(client_id, internal_id)").run(); } catch (e) { }
    }
    if (!hasEsocial) {
        console.log('[MIGRATION] Adding esocial_registration to employees table...');
        db.prepare("ALTER TABLE employees ADD COLUMN esocial_registration TEXT").run();
        try { db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_emp_client_esocial ON employees(client_id, esocial_registration)").run(); } catch (e) { }
    }
    if (!hasRoleId) {
        console.log('[MIGRATION] Adding role_id to employees table...');
        db.prepare("ALTER TABLE employees ADD COLUMN role_id INTEGER").run();
    }
    if (!hasWorkScheduleId) {
        console.log('[MIGRATION] Adding work_schedule_id to employees table...');
        db.prepare("ALTER TABLE employees ADD COLUMN work_schedule_id INTEGER").run();
    }
    if (!hasDataSaida) {
        console.log('[MIGRATION] Adding data_saida to employees table...');
        db.prepare("ALTER TABLE employees ADD COLUMN data_saida TEXT").run();
    }
} catch (error) {
    // Table might not exist yet, which is fine as it's created later if not exists.
    // Or if it exists, we just migrated.
    console.error('[MIGRATION CHECK]', error.message);
}

// Generate Token
app.post('/api/tokens', (req, res) => {
    const { officeId } = req.body;
    if (!officeId) return res.status(400).json({ error: 'officeId is required' });

    try {
        const token = `ACCESS-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Date.now()}`;
        const stmt = db.prepare('INSERT INTO tokens (office_id, token) VALUES (?, ?)');
        stmt.run(officeId, token);
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Stats (Total Offices)
app.get('/api/stats', (req, res) => {
    try {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM offices');
        const result = stmt.get();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// === OFFICE PORTAL ROUTES ===

// Login (Simulated)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    try {
        const stmt = db.prepare('SELECT id, office_id, name, email FROM users WHERE email = ? AND password = ?');
        const user = stmt.get(email, password);

        if (user) {
            // Also fetch the office details to check status
            const officeStmt = db.prepare('SELECT name, status FROM offices WHERE id = ?');
            const office = officeStmt.get(user.office_id);

            if (office && office.status === 'active') {
                res.json({ ...user, officeName: office.name, role: 'office_user' });
            } else {
                res.status(403).json({ error: 'Acesso do escritório inativo ou não encontrado.' });
            }
        } else {
            res.status(401).json({ error: 'Credenciais inválidas.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    try {
        const stmt = db.prepare('SELECT id, email FROM admin_users WHERE email = ? AND password = ?');
        const admin = stmt.get(email, password);

        if (admin) {
            res.json({ ...admin, role: 'admin' });
        } else {
            res.status(401).json({ error: 'Credenciais de administrador inválidas.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CLIENTS
app.get('/api/portal/:officeId/clients', (req, res) => {
    const { officeId } = req.params;
    try {
        const stmt = db.prepare('SELECT * FROM clients WHERE office_id = ? ORDER BY name ASC');
        const clients = stmt.all(officeId);
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/clients', (req, res) => {
    const { officeId, name, cnpj, email, phone } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO clients (office_id, name, cnpj, email, phone) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(officeId, name, cnpj, email, phone);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// TASKS
app.get('/api/portal/:officeId/tasks', (req, res) => {
    const { officeId } = req.params;
    try {
        const stmt = db.prepare(`
            SELECT t.*, c.name as client_name 
            FROM tasks t 
            LEFT JOIN clients c ON t.client_id = c.id 
            WHERE t.office_id = ? 
            ORDER BY t.due_date ASC
        `);
        const tasks = stmt.all(officeId);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tasks', (req, res) => {
    const { officeId, clientId, title, due_date } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO tasks (office_id, client_id, title, due_date) VALUES (?, ?, ?, ?)');
        const info = stmt.run(officeId, clientId, title, due_date);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// BILLING
app.get('/api/portal/:officeId/billings', (req, res) => {
    const { officeId } = req.params;
    try {
        const stmt = db.prepare(`
            SELECT b.*, c.name as client_name 
            FROM billings b 
            LEFT JOIN clients c ON b.client_id = c.id 
            WHERE b.office_id = ? 
            ORDER BY b.due_date ASC
        `);
        const billings = stmt.all(officeId);
        res.json(billings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.post('/api/billings', (req, res) => {
    const { officeId, clientId, amount, due_date } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO billings (office_id, client_id, amount, due_date) VALUES (?, ?, ?, ?)');
        const info = stmt.run(officeId, clientId, amount, due_date);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === ROLES & SCHEDULES ===

app.get('/api/clients/:clientId/roles', (req, res) => {
    const { clientId } = req.params;
    try {
        const stmt = db.prepare('SELECT * FROM roles WHERE client_id = ? ORDER BY name ASC');
        const roles = stmt.all(clientId);
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/clients/:clientId/roles', (req, res) => {
    const { clientId } = req.params;
    const { name, cbo } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO roles (client_id, name, cbo) VALUES (?, ?, ?)');
        const info = stmt.run(clientId, name, cbo);
        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/clients/:clientId/schedules', (req, res) => {
    const { clientId } = req.params;
    try {
        const stmt = db.prepare('SELECT * FROM work_schedules WHERE client_id = ? ORDER BY name ASC');
        const schedules = stmt.all(clientId);
        // Parse JSON for frontend convenience? Or let frontend do it.
        // Let's return raw and let frontend parse.
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/clients/:clientId/schedules', (req, res) => {
    const { clientId } = req.params;
    const { name, schedule } = req.body; // schedule is Object
    try {
        const scheduleJson = JSON.stringify(schedule);
        const stmt = db.prepare('INSERT INTO work_schedules (client_id, name, schedule_json) VALUES (?, ?, ?)');
        const info = stmt.run(clientId, name, scheduleJson);
        res.status(201).json({ id: info.lastInsertRowid, name, schedule_json: scheduleJson });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/clients/:clientId/schedules/:id', (req, res) => {
    const { clientId, id } = req.params;
    const { name, schedule } = req.body;
    try {
        const scheduleJson = JSON.stringify(schedule);
        const stmt = db.prepare('UPDATE work_schedules SET name = ?, schedule_json = ? WHERE id = ? AND client_id = ?');
        stmt.run(name, scheduleJson, id, clientId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === PDF IMPORT & EMPLOYEES ===
// === EMPLOYEES & IMPORT ===
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

app.get('/api/clients/:clientId/employees', (req, res) => {
    const { clientId } = req.params;
    try {
        const stmt = db.prepare('SELECT * FROM employees WHERE client_id = ?');
        const employees = stmt.all(clientId);
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare('SELECT * FROM employees WHERE id = ?');
        const employee = stmt.get(id);
        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({ error: 'Funcionário não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare('DELETE FROM employees WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.json({ success: true, message: 'Funcionário excluído.' });
        } else {
            res.status(404).json({ error: 'Funcionário não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    // We expect body like { role_id: 2 } or { work_schedule_id: 5 }
    const validFields = ['role_id', 'work_schedule_id', 'internal_id', 'esocial_registration'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(req.body)) {
        if (validFields.includes(key)) {
            updates.push(`${key} = ?`);
            values.push(value);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo válido para atualizar.' });
    }

    values.push(id); // for the WHERE clause

    try {
        const sql = `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`;
        const stmt = db.prepare(sql);
        const info = stmt.run(...values);
        if (info.changes > 0) {
            res.json({ success: true, message: 'Funcionário atualizado.' });
        } else {
            res.status(404).json({ error: 'Funcionário não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const { processarPlanilhaBuffer } = require('./csvParser');

app.post('/api/clients/:clientId/upload-employees', upload.single('file'), async (req, res) => {
    const { clientId } = req.params;
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    console.log(`Received file: ${req.file.originalname}, Size: ${req.file.size} bytes, Mime: ${req.file.mimetype}`);

    try {
        const funcionariosList = await processarPlanilhaBuffer(req.file.buffer);
        let importados = 0;
        let erros = 0;

        // Prepare the statement once outside the loop
        const stmt = db.prepare(`
            INSERT INTO employees (
                client_id, internal_id, esocial_registration, name, cpf, role, salary, admission_date, data_saida
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(client_id, esocial_registration) DO UPDATE SET
                internal_id=excluded.internal_id,
                name=excluded.name,
                cpf=excluded.cpf,
                role=excluded.role,
                salary=excluded.salary,
                admission_date=excluded.admission_date,
                data_saida=excluded.data_saida
        `);

        for (const funcionario of funcionariosList) {
            if (funcionario.nome && funcionario.cpf) {
                console.log(`[DB IMPORT] Found: ${funcionario.nome}, CPF: ${funcionario.cpf}, ID: ${funcionario.internal_id}, Esocial: ${funcionario.esocial_registration}`);

                try {
                    stmt.run(
                        clientId,
                        funcionario.internal_id,
                        funcionario.esocial_registration,
                        funcionario.nome,
                        funcionario.cpf,
                        funcionario.cargo,
                        funcionario.salario,
                        funcionario.dataAdmissao,
                        funcionario.data_saida
                    );
                    importados++;
                } catch (dbErr) {
                    console.error(`Erro inserindo funcionário ${funcionario.nome}:`, dbErr.message);
                    erros++;
                }
            } else {
                console.log(`[DB IMPORT SKIP] Funcionário inválido (sem nome ou cpf):`, funcionario);
                erros++;
            }
        }

        res.json({
            success: true,
            message: `Processamento concluído. ${importados} importados/atualizados, ${erros} ignorados ou com erro.`,
            total_processed: importados + erros,
            success_count: importados
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao processar Excel: ' + e.message });
    }
});

const { processXmlBuffer } = require('./xmlParser');

// --- INVOICES (NOTAS FISCAIS) XML UPLOAD ---
// Accepts multiple files: upload.array('files')
app.post('/api/clients/:clientId/invoices/upload', upload.array('files'), async (req, res) => {
    const { clientId } = req.params;
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    let importados = 0;
    let erros = 0;

    const stmt = db.prepare(`
        INSERT INTO invoices (
            client_id, xml_type, invoice_number, issue_date, provider_cnpj, provider_name, taker_cnpj, taker_name, total_value, raw_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const file of req.files) {
        try {
            const parsedData = processXmlBuffer(file.buffer);

            // Basic validation: skip completely empty unknown payloads if we want, but here we save EVERYTHING
            // for the sake of letting the user review it later.
            stmt.run(
                clientId,
                parsedData.xml_type,
                parsedData.invoice_number,
                parsedData.issue_date,
                parsedData.provider_cnpj,
                parsedData.provider_name,
                parsedData.taker_cnpj,
                parsedData.taker_name,
                parsedData.total_value,
                parsedData.raw_data
            );
            importados++;
        } catch (err) {
            console.error(`[XML Parse Error] file: ${file.originalname}`, err.message);
            erros++;
        }
    }

    res.json({
        success: true,
        message: `Processamento concluído. ${importados} XMLs salvos, ${erros} erros.`,
        success_count: importados,
        error_count: erros
    });
});

// --- GET INVOICES ---
app.get('/api/clients/:clientId/invoices', (req, res) => {
    const { clientId } = req.params;
    try {
        const rows = db.prepare("SELECT * FROM invoices WHERE client_id = ? ORDER BY issue_date DESC").all(clientId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
