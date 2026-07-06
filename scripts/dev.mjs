/** Runs the local API server and the Vite dev server together. */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const api = spawn("node", ["server/index.mjs"], { cwd: root, stdio: "inherit" });
const vite = spawn("npx", ["vite", "--host", "127.0.0.1"], { cwd: root, stdio: "inherit" });

const stop = () => {
  api.kill();
  vite.kill();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
api.on("exit", (code) => code && stop());
vite.on("exit", stop);
