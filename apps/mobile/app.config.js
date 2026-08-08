const os = require("node:os");
const appJson = require("./app.json");

function localLanIp() {
  const interfaces = os.networkInterfaces();
  for (const [name, entries] of Object.entries(interfaces)) {
    if (/^(docker|br-|veth|lo)/.test(name)) continue;
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) return entry.address;
    }
  }
  return null;
}

function apiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (process.env.MOBILE_API_URL) return process.env.MOBILE_API_URL;
  const ip = localLanIp();
  return ip ? `http://${ip}:4000` : appJson.expo.extra.apiUrl;
}

module.exports = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    apiUrl: apiUrl(),
    apiTimeoutMs: Number(process.env.MOBILE_API_TIMEOUT_MS ?? 15000),
  },
};
