import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  publishGuideSchema,
  updateGuideSchema,
  type PublishGuideInput,
  type UpdateGuideInput,
} from "@medi/types";
import { JwtGuard } from "../auth/jwt.guard";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { ZodPipe } from "../common/zod.pipe";
import { ShopService } from "./shop.service";

@Controller("shop")
export class ShopController {
  constructor(private readonly shop: ShopService) {}

  @Get("guides")
  list() {
    return this.shop.listPublished();
  }

  @Get("public/guides/:id")
  publicDetail(@Param("id") id: string) {
    return this.shop.getDetail(id);
  }

  @UseGuards(JwtGuard)
  @Get("guides/:id")
  detail(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.shop.getDetail(id, user.id);
  }

  @UseGuards(JwtGuard)
  @Get("my-guides")
  myGuides(@CurrentUser() user: JwtUser) {
    return this.shop.myGuides(user.id);
  }

  @UseGuards(JwtGuard)
  @Post("guides")
  publish(@CurrentUser() user: JwtUser, @Body(new ZodPipe(publishGuideSchema)) input: PublishGuideInput) {
    return this.shop.publish(user.id, input);
  }

  @UseGuards(JwtGuard)
  @Patch("guides/:id")
  update(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Body(new ZodPipe(updateGuideSchema)) input: UpdateGuideInput,
  ) {
    return this.shop.update(user.id, id, input);
  }

  @UseGuards(JwtGuard)
  @Post("guides/:id/purchase")
  purchase(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.shop.purchase(user.id, id);
  }
}
