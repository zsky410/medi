#!/usr/bin/env node
import { execFileSync, execSync, spawn } from "node:child_process";
import process from "node:process";

function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: "utf8", stdio: options.stdio ?? "pipe" });
}

function commandExists(command) {
  try {
    execFileSync("sh", ["-lc", `command -v ${command}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (!commandExists("adb")) {
  console.error("adb is not installed.");
  console.error("On Arch Linux, install it with: sudo pacman -S --needed android-tools");
  process.exit(1);
}

execSync("node scripts/free-mobile-ports.mjs", { stdio: "inherit" });

run("adb", ["start-server"], { stdio: "inherit" });
const devicesOutput = run("adb", ["devices"]);
const devices = devicesOutput
  .split("\n")
  .slice(1)
  .map((line) => line.trim().split(/\s+/))
  .filter(([serial, state]) => serial && state);

const authorized = devices.filter(([, state]) => state === "device");
const unauthorized = devices.filter(([, state]) => state === "unauthorized");

if (unauthorized.length > 0) {
  console.error("Android device is connected but unauthorized. Unlock the phone and accept the USB debugging prompt.");
  console.error(devicesOutput.trim());
  process.exit(1);
}

if (authorized.length === 0) {
  console.error("No authorized Android device found over USB.");
  console.error("Enable Developer options > USB debugging, plug the phone in, then run: adb devices");
  process.exit(1);
}

if (authorized.length > 1) {
  console.error("Multiple Android devices found. Disconnect extras or set ANDROID_SERIAL before running this script.");
  console.error(devicesOutput.trim());
  process.exit(1);
}

run("adb", ["reverse", "tcp:8081", "tcp:8081"], { stdio: "inherit" });
run("adb", ["reverse", "tcp:4000", "tcp:4000"], { stdio: "inherit" });

console.log("USB reverse ready:");
console.log("  device localhost:8081 -> laptop Metro 8081");
console.log("  device localhost:4000 -> laptop API 4000");

const child = spawn("pnpm", ["--dir", "apps/mobile", "exec", "expo", "start", "--localhost", "--clear"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: {
    ...process.env,
    EXPO_PUBLIC_API_URL: "http://127.0.0.1:4000",
    MOBILE_API_TIMEOUT_MS: process.env.MOBILE_API_TIMEOUT_MS ?? "15000",
  },
});

child.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
