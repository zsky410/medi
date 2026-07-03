import { Module } from "@nestjs/common";
import { TripsModule } from "../trips/trips.module";
import { ChecklistController } from "./checklist.controller";
import { ChecklistService } from "./checklist.service";

@Module({
  imports: [TripsModule],
  controllers: [ChecklistController],
  providers: [ChecklistService],
})
export class ChecklistModule {}
