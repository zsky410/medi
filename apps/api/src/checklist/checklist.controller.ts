import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  createChecklistItemSchema,
  updateChecklistItemSchema,
  type CreateChecklistItemInput,
  type UpdateChecklistItemInput,
} from "@medi/types";
import { JwtGuard } from "../auth/jwt.guard";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { ZodPipe } from "../common/zod.pipe";
import { TripsGateway } from "../realtime/trips.gateway";
import { ChecklistService } from "./checklist.service";

@UseGuards(JwtGuard)
@Controller("trips/:tripId/checklist")
export class ChecklistController {
  constructor(
    private readonly checklist: ChecklistService,
    private readonly realtime: TripsGateway,
  ) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Param("tripId") tripId: string) {
    return this.checklist.list(tripId, user.id);
  }

  @Post()
  async create(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Body(new ZodPipe(createChecklistItemSchema)) input: CreateChecklistItemInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const item = await this.checklist.create(tripId, user.id, input);
    this.realtime.emitToTrip(tripId, { type: "checklist:changed" }, socketId);
    return item;
  }

  @Patch(":itemId")
  async update(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Param("itemId") itemId: string,
    @Body(new ZodPipe(updateChecklistItemSchema)) input: UpdateChecklistItemInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const item = await this.checklist.update(tripId, itemId, user.id, input);
    this.realtime.emitToTrip(tripId, { type: "checklist:changed" }, socketId);
    return item;
  }

  @Delete(":itemId")
  async remove(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Param("itemId") itemId: string,
    @Headers("x-socket-id") socketId?: string,
  ) {
    await this.checklist.remove(tripId, itemId, user.id);
    this.realtime.emitToTrip(tripId, { type: "checklist:changed" }, socketId);
    return { ok: true };
  }
}
