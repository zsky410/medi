#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

console.log("Building @medi/types...");
execSync("pnpm --filter @medi/types build", { cwd: root, stdio: "inherit" });

console.log("Starting @medi/types watch...");
const types = spawn("pnpm", ["--filter", "@medi/types", "dev"], {
  cwd: root,
  stdio: "inherit",
});

console.log("Starting app dev servers...");
const turbo = spawn(
  "pnpm",
  ["exec", "turbo", "run", "dev", "--filter=@medi/api", "--filter=@medi/web"],
  {
    cwd: root,
    stdio: "inherit",
  },
);

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of [turbo, types]) {
    if (!child.killed) {
      try {
        child.kill("SIGTERM");
      } catch {
        // ignore
      }
    }
  }

  setTimeout(() => process.exit(code), 250).unref();
}

types.on("exit", (code, signal) => {
  if (shuttingDown) return;
  if (code === 0) return;
  console.error(`@medi/types dev exited${signal ? ` via ${signal}` : ""}${code != null ? ` with code ${code}` : ""}.`);
  shutdown(code ?? 1);
});

turbo.on("exit", (code, signal) => {
  if (shuttingDown) return;
  shutdown(code ?? (signal ? 1 : 0));
});

process.on("SIGINT", () => shutdown(130));
process.on("SIGTERM", () => shutdown(143));
