import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { createAttachmentSchema, updateAttachmentSchema, type CreateAttachmentInput, type UpdateAttachmentInput } from "@medi/types";
import { JwtGuard } from "../auth/jwt.guard";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { ZodPipe } from "../common/zod.pipe";
import { TripsGateway } from "../realtime/trips.gateway";
import { AttachmentsService } from "./attachments.service";

@UseGuards(JwtGuard)
@Controller("trips/:tripId/attachments")
export class AttachmentsController {
  constructor(
    private readonly attachments: AttachmentsService,
    private readonly realtime: TripsGateway,
  ) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Param("tripId") tripId: string) {
    return this.attachments.list(tripId, user.id);
  }

  @Post()
  async create(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Body(new ZodPipe(createAttachmentSchema)) input: CreateAttachmentInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const attachment = await this.attachments.create(tripId, user.id, input);
    this.realtime.emitToTrip(tripId, { type: "trip:updated" }, socketId);
    if (input.metadata?.amount) {
      this.realtime.emitToTrip(tripId, { type: "expenses:changed" }, socketId);
    }
    return attachment;
  }

  @Patch(":attachmentId")
  async update(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Param("attachmentId") attachmentId: string,
    @Body(new ZodPipe(updateAttachmentSchema)) input: UpdateAttachmentInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const attachment = await this.attachments.update(tripId, attachmentId, user.id, input);
    this.realtime.emitToTrip(tripId, { type: "trip:updated" }, socketId);
    if (input.metadata?.amount !== undefined || input.name) {
      this.realtime.emitToTrip(tripId, { type: "expenses:changed" }, socketId);
    }
    return attachment;
  }

  @Delete(":attachmentId")
  async remove(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Param("attachmentId") attachmentId: string,
    @Headers("x-socket-id") socketId?: string,
  ) {
    await this.attachments.remove(tripId, attachmentId, user.id);
    this.realtime.emitToTrip(tripId, { type: "trip:updated" }, socketId);
    this.realtime.emitToTrip(tripId, { type: "expenses:changed" }, socketId);
    return { ok: true };
  }
}
