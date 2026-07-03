import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
