import { BadRequestException, Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/jwt.guard";
import { GeoService } from "./geo.service";

@UseGuards(JwtGuard)
@Controller("geo")
export class GeoController {
  constructor(private readonly geo: GeoService) {}

  @Get("search")
  search(@Query("q") q?: string) {
    if (!q || q.trim().length < 2) {
      throw new BadRequestException("Từ khoá tìm kiếm tối thiểu 2 ký tự");
    }
    return this.geo.search(q.trim());
  }
}
