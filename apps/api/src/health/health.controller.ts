import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true, database: "up" };
    } catch {
      throw new ServiceUnavailableException({ ok: false, database: "down" });
    }
  }
}
