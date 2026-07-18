import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  ROUTE_LODGING_ID,
  type CreatePlaceInput,
  type DayRouteLegsDto,
  type DayRoutePathDto,
  type OptimizeDayResult,
  type ReorderPlacesInput,
  type RouteLegDto,
  type UpdatePlaceInput,
} from "@medi/types";
import { GeoService, type GeoPoint } from "../geo/geo.service";
import { PrismaService } from "../prisma/prisma.service";
import { TripAccessService } from "../trips/trip-access.service";
import { completeMatrix, optimizeRoute, type RouteCell } from "./route-optimizer";

const ROUTE_VEHICLE = "car";

@Injectable()
export class PlacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TripAccessService,
    private readonly geo: GeoService,
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

  /**
   * TSP reorder within a day (PRO route optimization): Goong Distance Matrix
   * for real road times, Held-Karp / Or-opt for the order, lodging as anchor.
   */
  async optimizeDay(tripId: string, dayId: string, userId: string): Promise<OptimizeDayResult> {
    await this.access.assertRole(tripId, userId, "EDITOR");
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.plan !== "PRO") {
      throw new BadRequestException("Tối ưu lộ trình chỉ dành cho tài khoản PRO");
    }

    const day = await this.prisma.day.findFirst({
      where: { id: dayId, tripId },
      include: { places: { orderBy: { order: "asc" } } },
    });
    if (!day) throw new NotFoundException("Không tìm thấy ngày");

    const withCoords = day.places.filter((p) => p.lat != null && p.lng != null);
    const withoutCoords = day.places.filter((p) => p.lat == null || p.lng == null);
    if (withCoords.length < 2) {
      throw new BadRequestException("Cần ít nhất 2 địa điểm có tọa độ để tối ưu");
    }

    const { cells, anchorIndex } = await this.buildRouteCells(
      tripId,
      withCoords.map((p) => ({ lat: p.lat!, lng: p.lng! })),
    );
    const visitIndices = withCoords.map((_, i) => i);
    const { order, totalDurationSec, totalDistanceM } = optimizeRoute(cells, visitIndices, anchorIndex);

    const finalOrder = [...order.map((i) => withCoords[i]), ...withoutCoords];
    await this.prisma.$transaction(
      finalOrder.map((p, i) =>
        this.prisma.place.update({ where: { id: p.id }, data: { order: i } }),
      ),
    );
    return { ok: true, optimized: order.length, totalDurationSec, totalDistanceM };
  }

  /** Real travel time/distance for each leg of a day, in current itinerary order. */
  async getDayRouteLegs(tripId: string, dayId: string, userId: string): Promise<DayRouteLegsDto> {
    await this.access.assertRole(tripId, userId, "VIEWER");
    const day = await this.prisma.day.findFirst({
      where: { id: dayId, tripId },
      include: { places: { orderBy: { order: "asc" } } },
    });
    if (!day) throw new NotFoundException("Không tìm thấy ngày");

    const placed = day.places.filter((p) => p.lat != null && p.lng != null);
    if (placed.length === 0) return { legs: [], vehicle: ROUTE_VEHICLE };

    const { cells, anchorIndex } = await this.buildRouteCells(
      tripId,
      placed.map((p) => ({ lat: p.lat!, lng: p.lng! })),
    );

    const legs: RouteLegDto[] = [];
    const pushLeg = (fromId: string, toId: string, from: number, to: number) => {
      const cell = cells[from][to];
      legs.push({
        fromId,
        toId,
        durationSec: Math.round(cell.durationSec),
        distanceM: Math.round(cell.distanceM),
        estimated: cell.estimated,
      });
    };

    if (anchorIndex != null) {
      pushLeg(ROUTE_LODGING_ID, placed[0].id, anchorIndex, 0);
    }
    for (let i = 0; i + 1 < placed.length; i++) {
      pushLeg(placed[i].id, placed[i + 1].id, i, i + 1);
    }
    if (anchorIndex != null) {
      pushLeg(placed[placed.length - 1].id, ROUTE_LODGING_ID, placed.length - 1, anchorIndex);
    }
    return { legs, vehicle: ROUTE_VEHICLE };
  }

  /** Real road-route polyline (Goong Directions) for a day's stops, lodging-anchored. */
  async getDayRoutePath(tripId: string, dayId: string, userId: string): Promise<DayRoutePathDto> {
    await this.access.assertRole(tripId, userId, "VIEWER");
    const day = await this.prisma.day.findFirst({
      where: { id: dayId, tripId },
      include: { places: { orderBy: { order: "asc" } } },
    });
    if (!day) throw new NotFoundException("Không tìm thấy ngày");

    const placed = day.places.filter((p) => p.lat != null && p.lng != null);
    const points: GeoPoint[] = placed.map((p) => ({ lat: p.lat!, lng: p.lng! }));

    const anchor = await this.getLodgingAnchor(tripId);
    if (anchor) {
      points.unshift(anchor);
      points.push(anchor);
    }

    if (points.length < 2) return { encodedPolyline: null, vehicle: ROUTE_VEHICLE };
    const encodedPolyline = await this.geo.directionsPath(points, ROUTE_VEHICLE);
    return { encodedPolyline, vehicle: ROUTE_VEHICLE };
  }

  /**
   * Cost matrix for a day's stops plus the (geocoded) lodging anchor when the
   * trip has a lodging booking. Falls back to Haversine estimates per cell.
   */
  private async buildRouteCells(
    tripId: string,
    placePoints: GeoPoint[],
  ): Promise<{ cells: RouteCell[][]; anchorIndex: number | null }> {
    const points = [...placePoints];
    let anchorIndex: number | null = null;

    const anchor = await this.getLodgingAnchor(tripId);
    if (anchor) {
      anchorIndex = points.length;
      points.push(anchor);
    }

    const matrix = points.length >= 2 ? await this.geo.distanceMatrix(points, ROUTE_VEHICLE) : null;
    return { cells: completeMatrix(matrix, points), anchorIndex };
  }

  /** Geocode the trip's first lodging booking (name + address) as the route anchor. */
  private async getLodgingAnchor(tripId: string): Promise<GeoPoint | null> {
    const lodging = await this.prisma.attachment.findFirst({
      where: { tripId, type: "lodging" },
      orderBy: { createdAt: "asc" },
    });
    if (!lodging) return null;

    const meta = lodging.metadata as { address?: string } | null;
    const title = lodging.name?.split(" · ")[0]?.trim();
    const query = [title, meta?.address].filter(Boolean).join(", ");
    if (!query) return null;
    return this.geo.geocodeAddress(query);
  }

  private async assertPlaceInTrip(tripId: string, placeId: string) {
    const place = await this.prisma.place.findFirst({ where: { id: placeId, tripId } });
    if (!place) throw new NotFoundException("Không tìm thấy địa điểm");
  }
}
