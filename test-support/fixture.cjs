const { fork } = require("node:child_process");
const { once } = require("node:events");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");

async function startServer() {
    const directory = mkdtempSync(path.join(tmpdir(), "grocerglow-browser-"));
    const child = fork(path.join(__dirname, "server.cjs"), [], {
        env: { ...process.env, GROCERGLOW_DB_PATH: path.join(directory, "test.db") },
        stdio: ["ignore", "pipe", "pipe", "ipc"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
        stderr += chunk;
    });
    let timer;
    async function close() {
        clearTimeout(timer);
        if (child.exitCode === null) {
            const exited = once(child, "exit");
            child.kill();
            await exited;
        }
        rmSync(directory, { recursive: true, force: true });
    }
    try {
        const { port } = await Promise.race([
            once(child, "message").then(([message]) => message),
            once(child, "exit").then(([code]) => {
                throw new Error(`Test server exited ${code}: ${stderr}`);
            }),
            new Promise((_, reject) => {
                timer = setTimeout(
                    () => reject(new Error(`Test server timed out: ${stderr}`)),
                    15000,
                );
            }),
        ]);
        clearTimeout(timer);
        return { port, base: `http://127.0.0.1:${port}`, close };
    } catch (error) {
        await close();
        throw error;
    }
}
module.exports = { startServer };
