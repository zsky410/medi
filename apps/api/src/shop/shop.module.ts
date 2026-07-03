import { Module } from "@nestjs/common";
import { TripsModule } from "../trips/trips.module";
import { ShopController } from "./shop.controller";
import { ShopService } from "./shop.service";

@Module({
  imports: [TripsModule],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}
