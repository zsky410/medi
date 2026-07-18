import { Module } from "@nestjs/common";
import { GeoModule } from "../geo/geo.module";
import { TripsModule } from "../trips/trips.module";
import { PlacesController } from "./places.controller";
import { PlacesService } from "./places.service";

@Module({
  imports: [TripsModule, GeoModule],
  controllers: [PlacesController],
  providers: [PlacesService],
})
export class ItineraryModule {}
