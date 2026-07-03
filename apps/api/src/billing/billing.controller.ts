import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Query,
  RawBodyRequest,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { JwtGuard } from "../auth/jwt.guard";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { BillingService } from "./billing.service";

@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @UseGuards(JwtGuard)
  @Get("subscription")
  subscription(@CurrentUser() user: JwtUser) {
    return this.billing.getSubscription(user.id);
  }

  @UseGuards(JwtGuard)
  @Post("portal")
  portal(@CurrentUser() user: JwtUser) {
    return this.billing.createPortal(user.id);
  }

  @UseGuards(JwtGuard)
  @Post("checkout")
  checkout(@CurrentUser() user: JwtUser) {
    return this.billing.createCheckout(user.id);
  }

  @Get("mock/complete")
  async completeMock(@Query("token") token: string | undefined, @Res() res: Response) {
    if (!token) throw new BadRequestException("Thiếu token");
    const redirectUrl = await this.billing.completeMockCheckout(token);
    res.redirect(redirectUrl);
  }

  @Post("webhook/stripe")
  @HttpCode(200)
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string | undefined,
  ) {
    if (!req.rawBody || !signature) throw new BadRequestException("Thiếu chữ ký webhook");
    await this.billing.handleStripeWebhook(req.rawBody, signature);
    return { received: true };
  }
}
