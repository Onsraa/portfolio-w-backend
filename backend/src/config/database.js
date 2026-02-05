import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || join(dataDir, 'portfolio.db');

let db = null;
let SQL = null;

export async function initDatabase() {
    if (db) return db;

    SQL = await initSqlJs();

    if (fs.existsSync(dbPath)) {
        console.log(`📁 Chargement de la base de données: ${dbPath}`);
        try {
            const fileBuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(fileBuffer);
        } catch (err) {
            console.error('❌ Erreur lecture DB, création nouvelle:', err.message);
            db = new SQL.Database();
        }
    } else {
        console.log(`📁 Création d'une nouvelle base de données: ${dbPath}`);
        db = new SQL.Database();
    }

    createTables();
    saveDatabase();

    console.log('✓ Base de données initialisée');
    return db;
}

function createTables() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS experiences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            period TEXT NOT NULL,
            company TEXT NOT NULL,
            role_fr TEXT,
            role_en TEXT,
            description_fr TEXT,
            description_en TEXT,
            tech TEXT,
            is_current INTEGER DEFAULT 0,
            is_internship INTEGER DEFAULT 0,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT UNIQUE NOT NULL,
            title_fr TEXT,
            title_en TEXT,
            description_fr TEXT,
            description_en TEXT,
            tech TEXT,
            year TEXT,
            link TEXT,
            image_url TEXT,
            is_featured INTEGER DEFAULT 0,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title_fr TEXT,
            title_en TEXT,
            excerpt_fr TEXT,
            excerpt_en TEXT,
            content_fr TEXT,
            content_en TEXT,
            cover_image TEXT,
            tags TEXT,
            is_published INTEGER DEFAULT 0,
            published_at DATETIME,
            views INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            size INTEGER NOT NULL,
            width INTEGER,
            height INTEGER,
            alt_text TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            name TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    for (const sql of tables) {
        try {
            db.run(sql);
        } catch (err) {
            console.error('Erreur création table:', err.message);
        }
    }
}

export function saveDatabase() {
    if (!db) return;

    try {
        const data = db.export();
        const buffer = Buffer.from(data);

        const tempPath = `${dbPath}.tmp`;
        fs.writeFileSync(tempPath, buffer);
        fs.renameSync(tempPath, dbPath);
    } catch (error) {
        console.error('❌ Erreur de sauvegarde:', error.message);
    }
}

export function reloadDatabase() {
    if (!SQL || !fs.existsSync(dbPath)) return false;

    try {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
        return true;
    } catch (err) {
        console.error('❌ Erreur rechargement DB:', err.message);
        return false;
    }
}

process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du serveur...');
    saveDatabase();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Arrêt du serveur...');
    saveDatabase();
    process.exit(0);
});

export function getDb() {
    if (!db) {
        throw new Error('Base de données non initialisée');
    }
    return db;
}

export function queryAll(sql, params = []) {
    if (!db) throw new Error('Base de données non initialisée');

    try {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
            stmt.bind(params);
        }
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    } catch (err) {
        console.error('❌ Erreur queryAll:', err.message);
        return [];
    }
}

export function queryOne(sql, params = []) {
    const results = queryAll(sql, params);
    return results[0] || null;
}

export function execute(sql, params = []) {
    if (!db) throw new Error('Base de données non initialisée');

    try {
        db.run(sql, params);

        const lastIdResult = db.exec("SELECT last_insert_rowid() as id");
        const lastId = lastIdResult[0]?.values[0]?.[0] || null;

        saveDatabase();

        return {
            lastInsertRowid: lastId,
            changes: db.getRowsModified(),
        };
    } catch (error) {
        console.error('❌ Erreur SQL:', error.message);
        throw error;
    }
}

export default {
    initDatabase,
    saveDatabase,
    reloadDatabase,
    getDb,
    queryAll,
    queryOne,
    execute,
};