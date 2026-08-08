import { Injectable } from "@nestjs/common";
import type { ListTripMessagesQuery, SendTripMessageInput, TripMessageDto } from "@medi/types";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TripAccessService } from "./trip-access.service";

const senderSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

const messageInclude = {
  sender: { select: senderSelect },
} satisfies Prisma.TripMessageInclude;

type TripMessageWithSender = Prisma.TripMessageGetPayload<{ include: typeof messageInclude }>;

const CHAT_IDLE_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class TripMessagesService {
  private clock: { now: () => Date } = { now: () => new Date() };

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TripAccessService,
  ) {}

  async list(tripId: string, userId: string, query: ListTripMessagesQuery = {}): Promise<TripMessageDto[]> {
    await this.access.assertRole(tripId, userId, "VIEWER");
    if (await this.clearExpiredTripChat(tripId)) return [];
    const limit = Math.min(Math.max(query.limit ?? 50, 1), 100);
    const messages = await this.prisma.tripMessage.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      include: messageInclude,
    });
    return messages.map((message) => this.toDto(message));
  }

  async create(tripId: string, userId: string, input: SendTripMessageInput): Promise<TripMessageDto> {
    await this.access.assertRole(tripId, userId, "VIEWER");
    await this.clearExpiredTripChat(tripId);
    const message = await this.prisma.tripMessage.create({
      data: { tripId, senderId: userId, body: input.body },
      include: messageInclude,
    });
    return this.toDto(message);
  }

  private async clearExpiredTripChat(tripId: string): Promise<boolean> {
    const newest = await this.prisma.tripMessage.findFirst({
      where: { tripId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (!newest) return false;
    const idleMs = this.clock.now().getTime() - newest.createdAt.getTime();
    if (idleMs < CHAT_IDLE_TTL_MS) return false;
    await this.prisma.tripMessage.deleteMany({ where: { tripId } });
    return true;
  }

  private toDto(message: TripMessageWithSender): TripMessageDto {
    return {
      id: message.id,
      tripId: message.tripId,
      senderId: message.senderId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      sender: message.sender,
    };
  }
}
