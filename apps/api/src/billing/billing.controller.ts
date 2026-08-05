import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import type { CreateCheckoutInput, SepayWebhookDto } from "@medi/types";
import { JwtGuard } from "../auth/jwt.guard";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { BillingService } from "./billing.service";

function webhookSecretFromHeaders(
  headerSecret: string | undefined,
  authorization: string | undefined,
  querySecret: string | undefined,
): string | undefined {
  if (headerSecret) return headerSecret;
  const match = authorization?.match(/^Apikey\s+(.+)$/i);
  return match?.[1]?.trim() || querySecret;
}

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
  checkout(@CurrentUser() user: JwtUser, @Body() input: CreateCheckoutInput | undefined) {
    return this.billing.createCheckout(user.id, input);
  }

  @UseGuards(JwtGuard)
  @Get("checkout/:id")
  checkoutDetail(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.billing.getSepayCheckout(user.id, id);
  }

  @UseGuards(JwtGuard)
  @Get("checkout/:id/status")
  checkoutStatus(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.billing.getSepayCheckoutStatus(user.id, id);
  }

  @Get("mock/complete")
  async completeMock(@Query("token") token: string | undefined, @Res() res: Response) {
    if (!token) throw new BadRequestException("Thiếu token");
    const redirectUrl = await this.billing.completeMockCheckout(token);
    res.redirect(redirectUrl);
  }

  @Post("webhook/sepay")
  @HttpCode(200)
  async sepayWebhook(
    @Body() payload: SepayWebhookDto,
    @Headers("x-sepay-secret") headerSecret: string | undefined,
    @Headers("authorization") authorization: string | undefined,
    @Query("token") querySecret: string | undefined,
  ) {
    await this.billing.handleSepayWebhook(payload, webhookSecretFromHeaders(headerSecret, authorization, querySecret));
    return { success: true };
  }
}

@Controller("webhooks")
export class SepayWebhookController {
  constructor(private readonly billing: BillingService) {}

  @Post("sepay")
  @HttpCode(200)
  async sepayWebhook(
    @Body() payload: SepayWebhookDto,
    @Headers("x-sepay-secret") headerSecret: string | undefined,
    @Headers("authorization") authorization: string | undefined,
    @Query("token") querySecret: string | undefined,
  ) {
    await this.billing.handleSepayWebhook(payload, webhookSecretFromHeaders(headerSecret, authorization, querySecret));
    return { success: true };
  }
}
