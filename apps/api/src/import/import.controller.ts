import { Body, Controller, Headers, Param, Post, UseGuards } from "@nestjs/common";
import { inboundEmailSchema, parseBookingTextSchema, type InboundEmailInput, type ParseBookingTextInput } from "@medi/types";
import { JwtGuard } from "../auth/jwt.guard";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { ZodPipe } from "../common/zod.pipe";
import { TripsGateway } from "../realtime/trips.gateway";
import { ImportService } from "./import.service";

@Controller()
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    private readonly realtime: TripsGateway,
  ) {}

  @UseGuards(JwtGuard)
  @Post("trips/:tripId/import/parse-text")
  async parseText(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Body(new ZodPipe(parseBookingTextSchema)) input: ParseBookingTextInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const result = await this.importService.parseAndApply(tripId, user.id, input);
    this.realtime.emitToTrip(tripId, { type: "itinerary:changed" }, socketId);
    this.realtime.emitToTrip(tripId, { type: "trip:updated" }, socketId);
    return result;
  }

  @Post("import/inbound-email")
  async inboundEmail(
    @Headers("x-import-secret") secret: string | undefined,
    @Body(new ZodPipe(inboundEmailSchema)) input: InboundEmailInput,
  ) {
    const result = await this.importService.handleInboundEmail(secret, input);
    this.realtime.emitToTrip(input.tripId, { type: "itinerary:changed" });
    this.realtime.emitToTrip(input.tripId, { type: "trip:updated" });
    return result;
  }
}
