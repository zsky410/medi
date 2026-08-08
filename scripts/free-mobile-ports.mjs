#!/usr/bin/env node
import { execSync } from "node:child_process";

const PORTS = [8081, 8082];

function pidsOnPort(port) {
  try {
    const out = execSync(`ss -tlnp 'sport = :${port}'`, { encoding: "utf8" });
    return [...new Set([...out.matchAll(/pid=(\d+)/g)].map((match) => Number(match[1])))];
  } catch {
    return [];
  }
}

let stopped = 0;

for (const port of PORTS) {
  for (const pid of pidsOnPort(port)) {
    try {
      process.kill(pid, "SIGTERM");
      console.log(`Stopped mobile Metro PID ${pid} on port ${port}`);
      stopped++;
    } catch {
      // already stopped
    }
  }
}

try {
  execSync("pkill -TERM -f 'apps/mobile/node_modules/.bin/../expo/bin/cli start' 2>/dev/null || true");
} catch {
  // no matching processes
}

if (stopped === 0) console.log("Mobile Metro ports 8081 and 8082 are free.");
else execSync("sleep 0.5");
