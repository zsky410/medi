import { Module } from "@nestjs/common";
import { TripsModule } from "../trips/trips.module";
import { ImportController } from "./import.controller";
import { ImportService } from "./import.service";
import { BookingParserService } from "./booking-parser.service";

@Module({
  imports: [TripsModule],
  controllers: [ImportController],
  providers: [ImportService, BookingParserService],
})
export class ImportModule {}
