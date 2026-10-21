const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { mkdtempSync, readdirSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Database = require("better-sqlite3");
const directory = mkdtempSync(path.join(tmpdir(), "grocerglow-migration-"));
after(() => rmSync(directory, { recursive: true, force: true }));
const modulePath = path.join(__dirname, "../database.js");
function seed(filename, empty = false) {
    const db = new Database(filename);
    db.exec(`CREATE TABLE items(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,quantity INTEGER NOT NULL CHECK(quantity>0),price REAL,completed INTEGER NOT NULL DEFAULT 0);
 CREATE TABLE settings(id INTEGER PRIMARY KEY CHECK(id=1),budget REAL,currency TEXT NOT NULL);
 INSERT INTO settings VALUES(1,1799.98,'ZAR');
 INSERT INTO items VALUES(7,'Existing milk',2,45,1);
 UPDATE sqlite_sequence SET seq=99 WHERE name='items';`);
    if (empty) db.exec("DELETE FROM items");
    db.close();
}
function migrate(filename) {
    const script = `const d=require(${JSON.stringify(modulePath)});console.log(JSON.stringify({items:d.prepare('SELECT * FROM items').all(),lists:d.prepare('SELECT * FROM shopping_lists').all(),legacy:d.prepare('SELECT * FROM settings').all(),backup:d.migrationBackupPath,foreignKeys:d.pragma('foreign_keys',{simple:true}),violations:d.pragma('foreign_key_check')}));d.close();`;
    const result = spawnSync(process.execPath, ["-e", script], {
        env: { ...process.env, GROCERGLOW_DB_PATH: filename },
        encoding: "utf8",
    });
    return { result, data: result.status === 0 ? JSON.parse(result.stdout) : null };
}
test("legacy migration backs up and preserves IDs, prices, checkmarks and settings", () => {
    const filename = path.join(directory, "legacy.db");
    seed(filename);
    const { result, data } = migrate(filename);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(data.items, [
        { id: 7, list_id: 1, name: "Existing milk", quantity: 2, price: 45, completed: 1 },
    ]);
    assert.equal(data.lists.length, 1);
    assert.equal(data.lists[0].budget, 1799.98);
    assert.equal(data.lists[0].currency, "ZAR");
    assert.deepEqual(data.legacy, [{ id: 1, budget: 1799.98, currency: "ZAR" }]);
    assert.equal(data.foreignKeys, 1);
    assert.deepEqual(data.violations, []);
    const backup = new Database(data.backup, { readonly: true });
    assert.equal(backup.prepare("SELECT COUNT(*) AS n FROM items").get().n, 1);
    assert.equal(
        backup.pragma("table_info(items)").some((column) => column.name === "list_id"),
        false,
    );
    backup.close();
    const d = new Database(filename);
    const added = d
        .prepare("INSERT INTO items(list_id,name,quantity) VALUES(1,?,1)")
        .run("After migration");
    assert.ok(added.lastInsertRowid > 99);
    d.close();
    const again = migrate(filename);
    assert.equal(again.result.status, 0, again.result.stderr);
    assert.equal(again.data.backup, null);
    assert.equal(again.data.lists.length, 1);
    assert.equal(again.data.items.length, 2);
});
test("empty legacy lists retain their item ID sequence", () => {
    const filename = path.join(directory, "empty.db");
    seed(filename, true);
    assert.equal(migrate(filename).result.status, 0);
    const d = new Database(filename);
    assert.ok(
        d.prepare("INSERT INTO items(list_id,name,quantity) VALUES(1,?,1)").run("Fresh item")
            .lastInsertRowid > 99,
    );
    d.close();
});
test("failed backup aborts startup without changing the old schema or rows", () => {
    const isolated = mkdtempSync(path.join(directory, "blocked-"));
    const filename = path.join(isolated, "legacy.db");
    seed(filename);
    writeFileSync(path.join(isolated, "backups"), "not a directory");
    const { result } = migrate(filename);
    assert.notEqual(result.status, 0);
    const d = new Database(filename, { readonly: true });
    assert.equal(
        d.pragma("table_info(items)").some((column) => column.name === "list_id"),
        false,
    );
    assert.equal(d.prepare("SELECT price FROM items WHERE id=7").get().price, 45);
    d.close();
});
