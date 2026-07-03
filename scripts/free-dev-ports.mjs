#!/usr/bin/env node
/**
 * Free medi dev ports (3002 web, 4000 API) before starting a new dev session.
 * Prevents EADDRINUSE when a previous pnpm dev was not stopped cleanly.
 */
import { execSync } from "node:child_process";

const PORTS = [3002, 4000];

const DEV_PATTERNS = [
  "medi/node_modules/.bin/../turbo/bin/turbo run dev",
  "medi/apps/web/node_modules/.bin/../next/dist/bin/next dev --port 3002",
  "medi/apps/api/node_modules/.bin/../@nestjs/cli/bin/nest.js start --watch",
];

function pidsOnPort(port) {
  try {
    const out = execSync(`ss -tlnp 'sport = :${port}'`, { encoding: "utf8" });
    const pids = new Set();
    for (const match of out.matchAll(/pid=(\d+)/g)) {
      pids.add(Number(match[1]));
    }
    return [...pids];
  } catch {
    return [];
  }
}

let freed = 0;

for (const port of PORTS) {
  const pids = pidsOnPort(port);
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
      console.log(`Stopped PID ${pid} on port ${port}`);
      freed++;
    } catch {
      // already gone
    }
  }
}

for (const pattern of DEV_PATTERNS) {
  try {
    execSync(`pkill -TERM -f '${pattern}' 2>/dev/null || true`);
  } catch {
    // no matching processes
  }
}

if (freed === 0) {
  console.log("Dev ports 3002 and 4000 are free.");
} else {
  execSync("sleep 0.5");
  console.log(`Freed ${freed} stale process(es).`);
}
