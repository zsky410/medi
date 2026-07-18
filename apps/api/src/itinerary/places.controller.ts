import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  createPlaceSchema,
  reorderPlacesSchema,
  updatePlaceSchema,
  type CreatePlaceInput,
  type ReorderPlacesInput,
  type UpdatePlaceInput,
} from "@medi/types";
import { JwtGuard } from "../auth/jwt.guard";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { ZodPipe } from "../common/zod.pipe";
import { TripsGateway } from "../realtime/trips.gateway";
import { PlacesService } from "./places.service";

@UseGuards(JwtGuard)
@Controller("trips/:tripId/places")
export class PlacesController {
  constructor(
    private readonly places: PlacesService,
    private readonly realtime: TripsGateway,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Body(new ZodPipe(createPlaceSchema)) input: CreatePlaceInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const place = await this.places.create(tripId, user.id, input);
    this.realtime.emitToTrip(tripId, { type: "itinerary:changed" }, socketId);
    return place;
  }

  @Post("days/:dayId/optimize")
  async optimizeDay(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Param("dayId") dayId: string,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const result = await this.places.optimizeDay(tripId, dayId, user.id);
    this.realtime.emitToTrip(tripId, { type: "itinerary:changed" }, socketId);
    return result;
  }

  @Get("days/:dayId/route-legs")
  routeLegs(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Param("dayId") dayId: string,
  ) {
    return this.places.getDayRouteLegs(tripId, dayId, user.id);
  }

  @Patch("reorder")
  async reorder(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Body(new ZodPipe(reorderPlacesSchema)) input: ReorderPlacesInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    await this.places.reorder(tripId, user.id, input);
    this.realtime.emitToTrip(tripId, { type: "itinerary:changed" }, socketId);
    return { ok: true };
  }

  @Patch(":placeId")
  async update(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Param("placeId") placeId: string,
    @Body(new ZodPipe(updatePlaceSchema)) input: UpdatePlaceInput,
    @Headers("x-socket-id") socketId?: string,
  ) {
    const place = await this.places.update(tripId, placeId, user.id, input);
    this.realtime.emitToTrip(tripId, { type: "itinerary:changed" }, socketId);
    return place;
  }

  @Delete(":placeId")
  async remove(
    @CurrentUser() user: JwtUser,
    @Param("tripId") tripId: string,
    @Param("placeId") placeId: string,
    @Headers("x-socket-id") socketId?: string,
  ) {
    await this.places.remove(tripId, placeId, user.id);
    this.realtime.emitToTrip(tripId, { type: "itinerary:changed" }, socketId);
    return { ok: true };
  }
}
