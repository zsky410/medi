import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import Stripe from "stripe";
import type { CheckoutSessionDto, SubscriptionDto } from "@medi/types";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Billing with two providers:
 * - "stripe": real Stripe Checkout (enabled when STRIPE_SECRET_KEY is set)
 * - "mock":   dev-only flow that upgrades the account through a signed link,
 *             so the full upgrade UX can be tested without a Stripe account.
 */
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {
    const key = this.config.get<string>("STRIPE_SECRET_KEY");
    if (key) this.stripe = new Stripe(key);
  }

  private webUrl(): string {
    return this.config.get<string>("WEB_URL") ?? "http://localhost:3002";
  }

  private apiUrl(): string {
    return this.config.get<string>("API_URL") ?? `http://localhost:${this.config.get("API_PORT") ?? 4000}`;
  }

  async getSubscription(userId: string): Promise<SubscriptionDto> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.plan === "FREE") {
      return { plan: "FREE", provider: null, renewsAt: null, cancelAtPeriodEnd: false };
    }

    if (this.stripe && user.stripeSubscriptionId) {
      try {
        const sub = await this.stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
        return {
          plan: "PRO",
          provider: "stripe",
          renewsAt: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        };
      } catch {
        return { plan: "PRO", provider: "stripe", renewsAt: null, cancelAtPeriodEnd: false };
      }
    }

    return { plan: "PRO", provider: "mock", renewsAt: null, cancelAtPeriodEnd: false };
  }

  async createPortal(userId: string): Promise<CheckoutSessionDto> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.plan !== "PRO") {
      throw new BadRequestException("Tài khoản chưa nâng cấp PRO");
    }

    if (this.stripe && user.stripeCustomerId) {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${this.webUrl()}/settings`,
      });
      return { url: session.url, provider: "stripe" };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { plan: "FREE", stripeSubscriptionId: null },
    });
    return { url: `${this.webUrl()}/settings?downgraded=1`, provider: "mock" };
  }

  async createCheckout(userId: string): Promise<CheckoutSessionDto> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.plan === "PRO") {
      throw new BadRequestException("Tài khoản của bạn đã là PRO");
    }

    if (this.stripe) {
      const priceId = this.config.getOrThrow<string>("STRIPE_PRICE_ID");
      const session = await this.stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: user.id,
        customer_email: user.email,
        success_url: `${this.webUrl()}/pricing?success=1`,
        cancel_url: `${this.webUrl()}/pricing?canceled=1`,
      });
      if (!session.url) throw new BadRequestException("Không tạo được phiên thanh toán");
      return { url: session.url, provider: "stripe" };
    }

    const token = await this.jwt.signAsync(
      { sub: user.id, purpose: "mock-upgrade" },
      { secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"), expiresIn: "15m" },
    );
    return { url: `${this.apiUrl()}/billing/mock/complete?token=${token}`, provider: "mock" };
  }

  /** Dev-only: completes the mock checkout and upgrades the account. */
  async completeMockCheckout(token: string): Promise<string> {
    let payload: { sub: string; purpose: string };
    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Link thanh toán không hợp lệ hoặc đã hết hạn");
    }
    if (payload.purpose !== "mock-upgrade") {
      throw new UnauthorizedException("Link thanh toán không hợp lệ");
    }
    await this.prisma.user.update({ where: { id: payload.sub }, data: { plan: "PRO" } });
    this.logger.log(`Mock upgrade completed for user ${payload.sub}`);
    return `${this.webUrl()}/pricing?success=1`;
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    if (!this.stripe) throw new BadRequestException("Stripe chưa được cấu hình");
    const secret = this.config.getOrThrow<string>("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException("Chữ ký webhook không hợp lệ");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        if (!userId) break;
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            plan: "PRO",
            stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
            stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
          },
        });
        this.logger.log(`User ${userId} upgraded to PRO via Stripe`);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
        if (!customerId) break;
        await this.prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: "FREE", stripeSubscriptionId: null },
        });
        this.logger.log(`Subscription cancelled for Stripe customer ${customerId}`);
        break;
      }
      default:
        break;
    }
  }
}
