#!/usr/bin/env node
import { execSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function waitForPort(host, port, timeoutMs = 90_000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();

    const attempt = () => {
      const socket = net.connect({ host, port }, () => {
        socket.end();
        resolve();
      });

      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }
        setTimeout(attempt, 500);
      });
    };

    attempt();
  });
}

console.log("Starting Docker services (postgres + redis)...");
execSync("docker compose up -d", { cwd: root, stdio: "inherit" });

console.log("Waiting for Postgres on localhost:5433...");
await waitForPort("127.0.0.1", 5433);

console.log("Waiting for Redis on localhost:6380...");
await waitForPort("127.0.0.1", 6380);

console.log("Dependencies are ready.");
