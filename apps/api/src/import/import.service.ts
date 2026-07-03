import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ImportBookingResultDto, InboundEmailInput, ParseBookingTextInput } from "@medi/types";
import { PrismaService } from "../prisma/prisma.service";
import { TripAccessService } from "../trips/trip-access.service";
import { BookingParserService } from "./booking-parser.service";

function formatDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function resolveDayId(
  days: Array<{ id: string; date: Date }>,
  itemDate: string | null,
): string | null {
  if (!itemDate || days.length === 0) return days[0]?.id ?? null;

  const exact = days.find((d) => formatDayKey(d.date) === itemDate);
  if (exact) return exact.id;

  const targetMs = Date.parse(`${itemDate}T12:00:00.000Z`);
  if (Number.isNaN(targetMs)) return days[0]?.id ?? null;

  const tripStart = days[0].date.getTime();
  const tripEnd = days[days.length - 1].date.getTime();
  if (targetMs < tripStart || targetMs > tripEnd) return null;

  let closest = days[0];
  let closestDist = Math.abs(days[0].date.getTime() - targetMs);
  for (const day of days.slice(1)) {
    const dist = Math.abs(day.date.getTime() - targetMs);
    if (dist < closestDist) {
      closestDist = dist;
      closest = day;
    }
  }
  return closest.id;
}

@Injectable()
export class ImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TripAccessService,
    private readonly parser: BookingParserService,
    private readonly config: ConfigService,
  ) {}

  async parseAndApply(
    tripId: string,
    userId: string,
    input: ParseBookingTextInput,
  ): Promise<ImportBookingResultDto> {
    await this.access.assertRole(tripId, userId, "EDITOR");
    const items = this.parser.parse(input.text);
    return this.applyItems(tripId, userId, items);
  }

  async handleInboundEmail(secret: string | undefined, input: InboundEmailInput): Promise<ImportBookingResultDto> {
    const expected = this.config.get<string>("IMPORT_EMAIL_SECRET");
    if (!expected || secret !== expected) {
      throw new UnauthorizedException("Invalid import webhook secret");
    }

    const trip = await this.prisma.trip.findUnique({ where: { id: input.tripId } });
    if (!trip) throw new NotFoundException("Trip not found");

    const text = [input.subject, input.text].filter(Boolean).join("\n");
    const items = this.parser.parse(text);
    return this.applyItems(input.tripId, trip.ownerId, items);
  }

  private async applyItems(
    tripId: string,
    userId: string,
    items: ReturnType<BookingParserService["parse"]>,
  ): Promise<ImportBookingResultDto> {
    if (items.length === 0) {
      return { items: [], placesCreated: 0, attachmentsCreated: 0 };
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { days: { orderBy: { order: "asc" } }, places: true },
    });
    if (!trip) throw new NotFoundException("Không tìm thấy chuyến đi");

    let placesCreated = 0;
    let attachmentsCreated = 0;
    const lastOrder = trip.places.reduce((max, p) => Math.max(max, p.order), -1);

    for (const [i, item] of items.entries()) {
      const dayId = resolveDayId(trip.days, item.date);

      const place = await this.prisma.place.create({
        data: {
          tripId,
          dayId,
          name: item.name,
          category: item.category,
          note: [item.note, item.confirmationCode ? `Mã: ${item.confirmationCode}` : null]
            .filter(Boolean)
            .join(" · ") || null,
          order: lastOrder + i + 1,
        },
      });
      placesCreated++;

      await this.prisma.attachment.create({
        data: {
          tripId,
          placeId: place.id,
          uploaderId: userId,
          url: `booking://${item.type}/${item.confirmationCode ?? place.id}`,
          name: `${item.type === "flight" ? "Vé máy bay" : item.type === "hotel" ? "Booking khách sạn" : "Xác nhận đặt chỗ"} — ${item.name}`,
          type: "booking",
        },
      });
      attachmentsCreated++;
    }

    return { items, placesCreated, attachmentsCreated };
  }
}
