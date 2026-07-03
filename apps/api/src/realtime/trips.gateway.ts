import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import type { TripRealtimeEvent } from "@medi/types";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Clients connect to the /trips namespace with `auth: { token }`,
 * then emit "trip:join" with a tripId to receive that trip's events.
 */
@Injectable()
@WebSocketGateway({ namespace: "/trips", cors: { origin: process.env.WEB_URL ?? "http://localhost:3002" } })
export class TripsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TripsGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      socket.disconnect(true);
      return;
    }
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });
      socket.data.userId = payload.sub;
    } catch {
      socket.disconnect(true);
    }
  }

  @SubscribeMessage("trip:join")
  async joinTrip(@ConnectedSocket() socket: Socket, @MessageBody() tripId: string) {
    const userId = socket.data.userId as string | undefined;
    if (!userId || typeof tripId !== "string") return;
    const membership = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!membership) {
      this.logger.warn(`User ${userId} denied joining trip room ${tripId}`);
      return;
    }
    await socket.join(`trip:${tripId}`);
  }

  @SubscribeMessage("trip:leave")
  async leaveTrip(@ConnectedSocket() socket: Socket, @MessageBody() tripId: string) {
    if (typeof tripId === "string") await socket.leave(`trip:${tripId}`);
  }

  emitToTrip(tripId: string, event: TripRealtimeEvent, originSocketId?: string) {
    const room = this.server.to(`trip:${tripId}`);
    const target = originSocketId ? room.except(originSocketId) : room;
    target.emit("trip:event", { tripId, event });
  }
}
