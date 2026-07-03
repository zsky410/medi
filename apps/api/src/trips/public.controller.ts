import { Controller, Get, Param, Query } from "@nestjs/common";
import { listPublicTripsSchema, type ListPublicTripsQuery } from "@medi/types";
import { ZodPipe } from "../common/zod.pipe";
import { TripsService } from "./trips.service";

/** Unauthenticated endpoints for the public share page. */
@Controller("public")
export class PublicController {
  constructor(private readonly trips: TripsService) {}

  @Get("trips")
  listTrips(@Query(new ZodPipe(listPublicTripsSchema)) query: ListPublicTripsQuery) {
    return this.trips.listPublic(query);
  }

  @Get("trips/:id")
  getTrip(@Param("id") id: string) {
    return this.trips.getPublic(id);
  }
}
