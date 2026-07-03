import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TripsGateway } from "./trips.gateway";

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [TripsGateway],
  exports: [TripsGateway],
})
export class RealtimeModule {}
