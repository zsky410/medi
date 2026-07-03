import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import type { ServerOptions } from "socket.io";
import { AppModule } from "./app.module";

class RedisIoAdapter extends IoAdapter {
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  async connectToRedis(url: string): Promise<void> {
    const pubClient = new Redis(url, { lazyConnect: true });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
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
    await redisAdapter.connectToRedis(process.env.REDIS_URL ?? "redis://localhost:6379");
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
