import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { GeoModule } from "../geo/geo.module";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [RealtimeModule, GeoModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
