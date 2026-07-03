import { Module } from "@nestjs/common";
import { TripsController } from "./trips.controller";
import { PublicController } from "./public.controller";
import { TripsService } from "./trips.service";
import { TripAccessService } from "./trip-access.service";

@Module({
  controllers: [TripsController, PublicController],
  providers: [TripsService, TripAccessService],
  exports: [TripAccessService, TripsService],
})
export class TripsModule {}
