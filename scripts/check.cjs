const { readdirSync, readFileSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");
const root = join(__dirname, "..");
let count = 0;
function check(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (
            [
                "node_modules",
                ".git",
                "backups",
                "docs",
                "test-results",
                "playwright-report",
                "coverage",
            ].includes(entry.name)
        )
            continue;
        const filename = join(directory, entry.name);
        if (entry.isDirectory()) check(filename);
        else if (/\.(c?js)$/.test(entry.name)) {
            const result = spawnSync(process.execPath, ["--check", filename], { encoding: "utf8" });
            if (result.status !== 0) throw new Error(result.stderr);
            count++;
        }
    }
}
check(root);
const html = readFileSync(join(root, "public/index.html"), "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
if (new Set(ids).size !== ids.length) throw new Error("Duplicate HTML IDs");
for (const [, filename] of html.matchAll(/(?:src|href)="\/(\w[\w./-]*)"/g)) {
    readFileSync(join(root, "public", filename));
}
console.log(`PASS syntax: ${count} authored JS/CJS files; HTML IDs and local assets`);
