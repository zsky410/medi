import "reflect-metadata";
import net from "node:net";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import type { ServerOptions } from "socket.io";
import { AppModule } from "./app.module";

const DEFAULT_REDIS_URL = "redis://127.0.0.1:6380";

async function waitForTcp(host: string, port: number, timeoutMs = 60_000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = net.connect({ host, port }, () => {
          socket.end();
          resolve();
        });
        socket.on("error", reject);
      });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Timed out waiting for ${host}:${port}`);
}

function parseRedisEndpoint(url: string): { host: string; port: number } {
  const parsed = new URL(url);
  return {
    host: parsed.hostname || "127.0.0.1",
    port: parsed.port ? Number(parsed.port) : 6379,
  };
}

class RedisIoAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  async connectToRedis(url: string): Promise<void> {
    const { host, port } = parseRedisEndpoint(url);
    await waitForTcp(host, port);

    const pubClient = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      enableOfflineQueue: false,
    });
    const subClient = pubClient.duplicate();
    pubClient.on("error", () => {});
    subClient.on("error", () => {});

    try {
      await Promise.all([pubClient.connect(), subClient.connect()]);
    } catch (err) {
      pubClient.disconnect();
      subClient.disconnect();
      throw err;
    }

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}

async function bootstrap() {
  // rawBody is required for Stripe webhook signature verification.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.useBodyParser("json", { limit: "5mb" });
  app.useBodyParser("urlencoded", { limit: "5mb", extended: true });

  const webUrl = process.env.WEB_URL ?? "http://localhost:3002";
  const devOrigins = new Set([
    webUrl,
    "http://localhost:3002",
    "http://127.0.0.1:3002",
  ]);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow non-browser clients (curl, server-side) and known dev origins.
      if (!origin) {
        callback(null, true);
        return;
      }
      if (devOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      // Dev: allow LAN access e.g. http://192.168.x.x:3002 from another device.
      if (
        process.env.NODE_ENV !== "production" &&
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  });

  const redisAdapter = new RedisIoAdapter(app);
  try {
    await redisAdapter.connectToRedis(process.env.REDIS_URL ?? DEFAULT_REDIS_URL);
    app.useWebSocketAdapter(redisAdapter);
  } catch (err) {
    // Realtime still works single-instance without Redis; log and continue.
    console.warn("Redis unavailable, socket.io running without redis adapter:", (err as Error).message);
  }

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  console.log(`medi API listening on http://localhost:${port}`);
}

bootstrap();
