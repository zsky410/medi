import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import {
  generateTripSchema,
  optimizeRouteSchema,
  suggestPlacesSchema,
  type GenerateTripInput,
  type OptimizeRouteInput,
  type SuggestPlacesInput,
} from "@medi/types";
import { JwtGuard } from "../auth/jwt.guard";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { ZodPipe } from "../common/zod.pipe";
import { TripsGateway } from "../realtime/trips.gateway";
import { AiService } from "./ai.service";

@UseGuards(JwtGuard)
@Controller("ai")
export class AiController {
  constructor(
    private readonly ai: AiService,
    private readonly realtime: TripsGateway,
  ) {}

  @Get("usage")
  usage(@CurrentUser() user: JwtUser) {
    return this.ai.getUsage(user.id);
  }

  @Post("generate-trip")
  @HttpCode(HttpStatus.ACCEPTED)
  generateTrip(
    @CurrentUser() user: JwtUser,
    @Body(new ZodPipe(generateTripSchema)) input: GenerateTripInput,
  ) {
    return this.ai.generateTrip(user.id, input);
  }

  @Get("generations/:id")
  getGeneration(
    @CurrentUser() user: JwtUser,
    @Param("id") generationId: string,
  ) {
    return this.ai.getGeneration(user.id, generationId);
  }

  @Post("trips/:tripId/suggest-places")
  suggestPlaces(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Body(new ZodPipe(suggestPlacesSchema)) input: SuggestPlacesInput,
  ) {
    return this.ai.suggestPlaces(user.id, tripId, input);
  }

  @Post("trips/:tripId/optimize-route")
  async optimizeRoute(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Body(new ZodPipe(optimizeRouteSchema)) input: OptimizeRouteInput,
  ) {
    const result = await this.ai.optimizeRoute(user.id, tripId, input);
    this.realtime.emitToTrip(tripId, { type: "itinerary:changed" });
    return result;
  }
}
