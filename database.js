const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

const filename = process.env.GROCERGLOW_DB_PATH || path.join(__dirname, "grocerglow.db");
const db = new Database(filename);
db.pragma("foreign_keys = ON");
const columns = db.pragma("table_info(items)");
const migrating = columns.length > 0 && !columns.some((column) => column.name === "list_id");
let backupPath = null;

try {
    // Make a consistent SQLite snapshot BEFORE any change to the legacy schema.
    // A failed backup aborts startup, leaving the original data in place.
    if (migrating) {
        const backupDirectory = path.join(path.dirname(filename), "backups");
        fs.mkdirSync(backupDirectory, { recursive: true });
        backupPath = path.join(
            backupDirectory,
            `${path.basename(filename, ".db")}-before-lists-${Date.now()}-${randomUUID()}.db`,
        );
        db.prepare("VACUUM INTO ?").run(backupPath);
    }

    db.transaction(() => {
        // Retain the old settings row as migration history, without overwriting it.
        db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY CHECK(id = 1),
                budget REAL CHECK(budget IS NULL OR budget >= 0),
                currency TEXT NOT NULL DEFAULT 'ZAR'
            );
            INSERT OR IGNORE INTO settings (id, budget, currency) VALUES (1, NULL, 'ZAR');
            CREATE TABLE IF NOT EXISTS shopping_lists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 80),
                budget REAL CHECK(budget IS NULL OR budget >= 0),
                currency TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
        if (!db.prepare("SELECT id FROM shopping_lists LIMIT 1").get()) {
            const legacy = db.prepare("SELECT budget, currency FROM settings WHERE id = 1").get();
            db.prepare(
                "INSERT INTO shopping_lists (id, name, budget, currency) VALUES (1, ?, ?, ?)",
            ).run("Shopping list", legacy.budget, legacy.currency);
        }
        const itemSchema = (name) => `CREATE TABLE ${name} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            list_id INTEGER NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            price REAL CHECK(price IS NULL OR price >= 0),
            completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1))
        )`;
        if (migrating) {
            const oldSequence =
                db.prepare("SELECT seq FROM sqlite_sequence WHERE name = 'items'").get()?.seq || 0;
            db.exec(itemSchema("items_migrated"));
            db.exec(`INSERT INTO items_migrated (id, list_id, name, quantity, price, completed)
                     SELECT id, 1, name, quantity, price, completed FROM items;
                     DROP TABLE items;
                     ALTER TABLE items_migrated RENAME TO items;`);
            // Do not reuse IDs of items that were deleted before the migration.
            db.prepare("UPDATE sqlite_sequence SET seq = MAX(seq, ?) WHERE name = 'items'").run(
                oldSequence,
            );
            db.prepare(
                "INSERT INTO sqlite_sequence (name, seq) SELECT 'items', ? WHERE NOT EXISTS (SELECT 1 FROM sqlite_sequence WHERE name = 'items')",
            ).run(oldSequence);
        } else if (columns.length === 0) {
            db.exec(itemSchema("items"));
        }
        db.exec("CREATE INDEX IF NOT EXISTS items_list_id ON items(list_id)");
        if (db.pragma("foreign_key_check").length)
            throw new Error("Shopping-list migration failed its integrity check.");
        db.pragma("user_version = 1");
    })();
    db.migrationBackupPath = backupPath;
    module.exports = db;
} catch (error) {
    db.close();
    throw error;
}
