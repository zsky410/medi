import { BadRequestException, Controller, Get, Param, Query, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { JwtGuard } from "../auth/jwt.guard";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { AffiliateService } from "./affiliate.service";

@Controller()
export class AffiliateController {
  constructor(private readonly affiliate: AffiliateService) {}

  @UseGuards(JwtGuard)
  @Get("trips/:tripId/affiliate")
  getTripAffiliate(@CurrentUser() user: JwtUser, @Param("tripId") tripId: string) {
    return this.affiliate.getTripAffiliate(tripId, user.id);
  }

  @Get("affiliate/go")
  async redirect(@Query("token") token: string | undefined, @Res() res: Response) {
    if (!token) throw new BadRequestException("Thiếu token");
    const url = await this.affiliate.handleRedirect(token);
    res.redirect(302, url);
  }
}
