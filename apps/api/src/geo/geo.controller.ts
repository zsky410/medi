import { BadRequestException, Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/jwt.guard";
import { GeoService } from "./geo.service";

@UseGuards(JwtGuard)
@Controller("geo")
export class GeoController {
  constructor(private readonly geo: GeoService) {}

  @Get("autocomplete")
  autocomplete(
    @Query("q") q?: string,
    @Query("lat") lat?: string,
    @Query("lng") lng?: string,
  ) {
    if (!q || q.trim().length < 2) {
      throw new BadRequestException("Từ khoá tìm kiếm tối thiểu 2 ký tự");
    }
    const parsedLat = lat != null ? Number(lat) : undefined;
    const parsedLng = lng != null ? Number(lng) : undefined;
    const location =
      parsedLat != null &&
      parsedLng != null &&
      Number.isFinite(parsedLat) &&
      Number.isFinite(parsedLng)
        ? { lat: parsedLat, lng: parsedLng }
        : undefined;
    return this.geo.autocomplete(q.trim(), location);
  }

  @Get("place")
  place(@Query("providerId") providerId?: string) {
    if (!providerId || providerId.length > 300) {
      throw new BadRequestException("Địa điểm không hợp lệ");
    }
    return this.geo.resolve(providerId);
  }
}
