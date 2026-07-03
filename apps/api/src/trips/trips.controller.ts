import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  createTripSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  updateTripSchema,
  type CreateTripInput,
  type InviteMemberInput,
  type UpdateMemberRoleInput,
  type UpdateTripInput,
} from "@medi/types";
import { JwtGuard } from "../auth/jwt.guard";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { ZodPipe } from "../common/zod.pipe";
import { TripsGateway } from "../realtime/trips.gateway";
import { TripsService } from "./trips.service";

@UseGuards(JwtGuard)
@Controller("trips")
export class TripsController {
  constructor(
    private readonly trips: TripsService,
    private readonly realtime: TripsGateway,
  ) {}

  @Post()
  create(@CurrentUser() user: JwtUser, @Body(new ZodPipe(createTripSchema)) input: CreateTripInput) {
    return this.trips.create(user.id, input);
  }

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.trips.listMine(user.id);
  }

  @Get(":id")
  detail(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.trips.getDetail(id, user.id);
  }

  @Patch(":id")
  async update(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Body(new ZodPipe(updateTripSchema)) input: UpdateTripInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const result = await this.trips.update(id, user.id, input);
    this.realtime.emitToTrip(id, { type: "trip:updated" }, socketId);
    return result;
  }

  @Delete(":id")
  async remove(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    await this.trips.remove(id, user.id);
    return { ok: true };
  }

  @Post(":id/members")
  async invite(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Body(new ZodPipe(inviteMemberSchema)) input: InviteMemberInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const members = await this.trips.inviteMember(id, user.id, input);
    this.realtime.emitToTrip(id, { type: "members:changed" }, socketId);
    return members;
  }

  @Post("join/:code")
  join(@CurrentUser() user: JwtUser, @Param("code") code: string) {
    return this.trips.joinByCode(code, user.id);
  }

  @Post(":id/clone")
  clone(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.trips.clone(id, user.id);
  }

  @Patch(":id/members/:memberId")
  async updateMemberRole(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Body(new ZodPipe(updateMemberRoleSchema)) input: UpdateMemberRoleInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const members = await this.trips.updateMemberRole(id, user.id, memberId, input);
    this.realtime.emitToTrip(id, { type: "members:changed" }, socketId);
    return members;
  }

  @Delete(":id/members/:memberId")
  async removeMember(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const members = await this.trips.removeMember(id, user.id, memberId);
    this.realtime.emitToTrip(id, { type: "members:changed" }, socketId);
    return members;
  }
}
