import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { TripsModule } from "./trips/trips.module";
import { ItineraryModule } from "./itinerary/itinerary.module";
import { ExpensesModule } from "./expenses/expenses.module";
import { ChecklistModule } from "./checklist/checklist.module";
import { GeoModule } from "./geo/geo.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { BillingModule } from "./billing/billing.module";
import { AttachmentsModule } from "./attachments/attachments.module";
import { AiModule } from "./ai/ai.module";
import { AffiliateModule } from "./affiliate/affiliate.module";
import { ShopModule } from "./shop/shop.module";
import { ImportModule } from "./import/import.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ["../../.env", ".env"] }),
    PrismaModule,
    AuthModule,
    RealtimeModule,
    TripsModule,
    ItineraryModule,
    ExpensesModule,
    ChecklistModule,
    GeoModule,
    BillingModule,
    AttachmentsModule,
    AiModule,
    AffiliateModule,
    ShopModule,
    ImportModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
