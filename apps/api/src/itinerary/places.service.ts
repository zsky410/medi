import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { CreatePlaceInput, ReorderPlacesInput, UpdatePlaceInput } from "@medi/types";
import { PrismaService } from "../prisma/prisma.service";
import { TripAccessService } from "../trips/trip-access.service";

@Injectable()
export class PlacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TripAccessService,
  ) {}

  async create(tripId: string, userId: string, input: CreatePlaceInput) {
    await this.access.assertRole(tripId, userId, "EDITOR");
    if (input.dayId) {
      const day = await this.prisma.day.findFirst({ where: { id: input.dayId, tripId } });
      if (!day) throw new BadRequestException("Ngày không thuộc chuyến đi này");
    }
    const last = await this.prisma.place.findFirst({
      where: { tripId, dayId: input.dayId ?? null },
      orderBy: { order: "desc" },
    });
    return this.prisma.place.create({
      data: {
        tripId,
        dayId: input.dayId ?? null,
        name: input.name,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        category: input.category,
        address: input.address ?? null,
        note: input.note ?? null,
        cost: input.cost ?? null,
        providerId: input.providerId ?? null,
        order: (last?.order ?? -1) + 1,
      },
    });
  }

  async update(tripId: string, placeId: string, userId: string, input: UpdatePlaceInput) {
    await this.access.assertRole(tripId, userId, "EDITOR");
    await this.assertPlaceInTrip(tripId, placeId);
    return this.prisma.place.update({
      where: { id: placeId },
      data: {
        dayId: input.dayId === undefined ? undefined : input.dayId,
        name: input.name,
        lat: input.lat,
        lng: input.lng,
        category: input.category,
        address: input.address,
        note: input.note,
        cost: input.cost,
        providerId: input.providerId,
      },
    });
  }

  async remove(tripId: string, placeId: string, userId: string) {
    await this.access.assertRole(tripId, userId, "EDITOR");
    await this.assertPlaceInTrip(tripId, placeId);
    await this.prisma.place.delete({ where: { id: placeId } });
  }

  /** Applies drag & drop moves: each move sets a place's day (or null) and new order. */
  async reorder(tripId: string, userId: string, input: ReorderPlacesInput) {
    await this.access.assertRole(tripId, userId, "EDITOR");
    const placeIds = input.moves.map((m) => m.placeId);
    const count = await this.prisma.place.count({ where: { id: { in: placeIds }, tripId } });
    if (count !== placeIds.length) {
      throw new BadRequestException("Có địa điểm không thuộc chuyến đi này");
    }
    const dayIds = [...new Set(input.moves.map((m) => m.dayId).filter((d): d is string => !!d))];
    if (dayIds.length > 0) {
      const dayCount = await this.prisma.day.count({ where: { id: { in: dayIds }, tripId } });
      if (dayCount !== dayIds.length) {
        throw new BadRequestException("Có ngày không thuộc chuyến đi này");
      }
    }
    await this.prisma.$transaction(
      input.moves.map((m) =>
        this.prisma.place.update({
          where: { id: m.placeId },
          data: { dayId: m.dayId, order: m.order },
        }),
      ),
    );
  }

  /** Nearest-neighbor reorder within each day (PRO route optimization). */
  async optimizeDay(tripId: string, dayId: string, userId: string) {
    await this.access.assertRole(tripId, userId, "EDITOR");
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.plan !== "PRO") {
      throw new BadRequestException("Tối ưu lộ trình chỉ dành cho tài khoản PRO");
    }

    const day = await this.prisma.day.findFirst({
      where: { id: dayId, tripId },
      include: { places: true },
    });
    if (!day) throw new NotFoundException("Không tìm thấy ngày");

    const withCoords = day.places.filter((p) => p.lat != null && p.lng != null);
    const withoutCoords = day.places.filter((p) => p.lat == null || p.lng == null);
    if (withCoords.length < 2) {
      throw new BadRequestException("Cần ít nhất 2 địa điểm có tọa độ để tối ưu");
    }

    const remaining = [...withCoords];
    const ordered = [remaining.shift()!];

    while (remaining.length > 0) {
      const last = ordered[ordered.length - 1];
      let nearestIdx = 0;
      let nearestDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const p = remaining[i];
        const dist = Math.hypot(p.lat! - last.lat!, p.lng! - last.lng!);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }
      ordered.push(remaining.splice(nearestIdx, 1)[0]);
    }

    const finalOrder = [...ordered, ...withoutCoords];
    await this.prisma.$transaction(
      finalOrder.map((p, i) =>
        this.prisma.place.update({ where: { id: p.id }, data: { order: i } }),
      ),
    );
    return { ok: true, optimized: ordered.length };
  }

  private async assertPlaceInTrip(tripId: string, placeId: string) {
    const place = await this.prisma.place.findFirst({ where: { id: placeId, tripId } });
    if (!place) throw new NotFoundException("Không tìm thấy địa điểm");
  }
}
