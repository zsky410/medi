import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TripsModule } from "../trips/trips.module";
import { AffiliateController } from "./affiliate.controller";
import { AffiliateService } from "./affiliate.service";

@Module({
  imports: [TripsModule, JwtModule.register({})],
  controllers: [AffiliateController],
  providers: [AffiliateService],
})
export class AffiliateModule {}
