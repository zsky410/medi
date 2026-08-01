import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { customAlphabet } from "nanoid";
import {
  PRO_PLANS,
  type CreateCheckoutInput,
  type CheckoutSessionDto,
  type ProBillingPeriod,
  type SepayCheckoutDto,
  type SepayCheckoutStatusDto,
  type SepayWebhookDto,
  type SubscriptionDto,
} from "@medi/types";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Billing with two providers:
 * - "sepay": real bank-transfer checkout completed by SePay webhook
 * - "mock":  dev-only fallback when SePay env is missing
 */
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly checkoutCode = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  private webUrl(): string {
    return this.config.get<string>("WEB_URL") ?? "http://localhost:3002";
  }

  private apiUrl(): string {
    return this.config.get<string>("API_URL") ?? `http://localhost:${this.config.get("API_PORT") ?? 4000}`;
  }

  private configValue(...keys: string[]): string | undefined {
    for (const key of keys) {
      const value = this.config.get<string>(key);
      if (value) return value;
    }
    return undefined;
  }

  private sepayBankName(): string {
    return this.config.getOrThrow<string>("SEPAY_BANK_NAME");
  }

  private sepayAccountNumber(): string {
    const value = this.configValue("SEPAY_BANK_ACCOUNT", "SEPAY_ACCOUNT_NUMBER");
    if (!value) throw new Error("Missing SEPAY_BANK_ACCOUNT");
    return value;
  }

  private sepayAccountName(): string {
    const value = this.configValue("SEPAY_ACCOUNT_HOLDER", "SEPAY_ACCOUNT_NAME");
    if (!value) throw new Error("Missing SEPAY_ACCOUNT_HOLDER");
    return value;
  }

  private hasSepayConfig(): boolean {
    return Boolean(
      this.config.get<string>("SEPAY_BANK_NAME") &&
        this.configValue("SEPAY_BANK_ACCOUNT", "SEPAY_ACCOUNT_NUMBER") &&
        this.configValue("SEPAY_ACCOUNT_HOLDER", "SEPAY_ACCOUNT_NAME") &&
        this.config.get<string>("SEPAY_WEBHOOK_SECRET"),
    );
  }

  private sepayCheckoutUrl(intentId: string): string {
    return `${this.webUrl()}/pricing/sepay/${intentId}`;
  }

  private proPlan(period: ProBillingPeriod = "YEAR") {
    return PRO_PLANS.find((plan) => plan.period === period) ?? PRO_PLANS[2];
  }

  private sepayQrUrl(amount: number, checkoutCode: string): string | null {
    const templateName = this.config.get<string>("SEPAY_QR_TEMPLATE");
    if (templateName === "compact") {
      return `https://img.vietqr.io/image/${encodeURIComponent(this.sepayBankName())}-${encodeURIComponent(
        this.sepayAccountNumber(),
      )}-compact.png?amount=${encodeURIComponent(String(amount))}&addInfo=${encodeURIComponent(
        checkoutCode,
      )}&accountName=${encodeURIComponent(this.sepayAccountName())}`;
    }

    const template = this.config.get<string>("SEPAY_QR_TEMPLATE_URL");
    if (!template) return null;
    return template
      .replaceAll("{amount}", encodeURIComponent(String(amount)))
      .replaceAll("{content}", encodeURIComponent(checkoutCode))
      .replaceAll("{accountName}", encodeURIComponent(this.sepayAccountName()))
      .replaceAll("{accountNumber}", encodeURIComponent(this.sepayAccountNumber()));
  }

  private toSepayCheckout(intent: {
    id: string;
    amount: number;
    currency: string;
    status: "PENDING" | "PAID" | "EXPIRED" | "CANCELED";
    billingPeriod?: ProBillingPeriod;
    checkoutCode: string;
    createdAt: Date;
    paidAt: Date | null;
  }): SepayCheckoutDto {
    return {
      id: intent.id,
      status: intent.status,
      period: intent.billingPeriod ?? "YEAR",
      amount: intent.amount,
      currency: intent.currency,
      checkoutCode: intent.checkoutCode,
      bankName: this.sepayBankName(),
      accountNumber: this.sepayAccountNumber(),
      accountName: this.sepayAccountName(),
      qrUrl: this.sepayQrUrl(intent.amount, intent.checkoutCode),
      createdAt: intent.createdAt.toISOString(),
      paidAt: intent.paidAt?.toISOString() ?? null,
    };
  }

  async getSubscription(userId: string): Promise<SubscriptionDto> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.plan === "FREE") {
      return { plan: "FREE", provider: null, renewsAt: null, cancelAtPeriodEnd: false, period: null };
    }

    if (user.proExpiresAt && user.proExpiresAt.getTime() <= Date.now()) {
      await this.prisma.user.update({ where: { id: userId }, data: { plan: "FREE" } });
      return { plan: "FREE", provider: null, renewsAt: null, cancelAtPeriodEnd: false, period: null };
    }

    return {
      plan: "PRO",
      provider: this.hasSepayConfig() ? "sepay" : "mock",
      renewsAt: user.proExpiresAt?.toISOString() ?? null,
      cancelAtPeriodEnd: false,
      period: null,
    };
  }

  async createPortal(userId: string): Promise<CheckoutSessionDto> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.plan !== "PRO") {
      throw new BadRequestException("Tài khoản chưa nâng cấp PRO");
    }

    throw new BadRequestException("Gói PRO thanh toán qua SePay chưa có cổng huỷ tự động. Vui lòng liên hệ hỗ trợ.");
  }

  async createCheckout(userId: string, input: CreateCheckoutInput = {}): Promise<CheckoutSessionDto> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.plan === "PRO") {
      throw new BadRequestException("Tài khoản của bạn đã là PRO");
    }

    const plan = this.proPlan(input.period);
    if (this.hasSepayConfig()) {
      const existing = await this.prisma.proPaymentIntent.findFirst({
        where: { userId: user.id, status: "PENDING", billingPeriod: plan.period },
        orderBy: { createdAt: "desc" },
      });
      const intent =
        existing ??
        (await this.prisma.proPaymentIntent.create({
          data: {
            userId: user.id,
            amount: plan.price,
            currency: "VND",
            billingPeriod: plan.period,
            durationDays: plan.period === "WEEK" ? 7 : plan.period === "MONTH" ? 30 : 365,
            checkoutCode: `MEDIPRO${this.checkoutCode()}`,
          },
        }));
      return { url: this.sepayCheckoutUrl(intent.id), provider: "sepay" };
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

  async getSepayCheckout(userId: string, intentId: string): Promise<SepayCheckoutDto> {
    const intent = await this.prisma.proPaymentIntent.findFirst({
      where: { id: intentId, userId },
    });
    if (!intent) throw new NotFoundException("Không tìm thấy phiên thanh toán");
    return this.toSepayCheckout(intent);
  }

  async getSepayCheckoutStatus(userId: string, intentId: string): Promise<SepayCheckoutStatusDto> {
    const [intent, user] = await Promise.all([
      this.prisma.proPaymentIntent.findFirst({
        where: { id: intentId, userId },
        select: { id: true, status: true },
      }),
      this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { plan: true, proExpiresAt: true } }),
    ]);
    if (!intent) throw new NotFoundException("Không tìm thấy phiên thanh toán");
    return { id: intent.id, status: intent.status, plan: user.plan, renewsAt: user.proExpiresAt?.toISOString() ?? null };
  }

  async handleSepayWebhook(payload: SepayWebhookDto, providedSecret: string | undefined): Promise<void> {
    if (providedSecret !== this.config.getOrThrow<string>("SEPAY_WEBHOOK_SECRET")) {
      throw new UnauthorizedException("Webhook SePay không hợp lệ");
    }

    const transactionId = payload.id === undefined ? undefined : String(payload.id);
    if (transactionId) {
      const duplicate = await this.prisma.proPaymentIntent.findUnique({
        where: { sepayTransactionId: transactionId },
      });
      if (duplicate) return;
    }

    if (String(payload.transferType ?? "").toLowerCase() !== "in") return;
    if (
      payload.accountNumber &&
      String(payload.accountNumber) !== this.sepayAccountNumber()
    ) {
      return;
    }

    const amount = Number(payload.transferAmount ?? 0);
    if (!Number.isFinite(amount)) return;

    const checkoutCode = this.extractCheckoutCode(payload);
    if (!checkoutCode) return;

    const intent = await this.prisma.proPaymentIntent.findUnique({
      where: { checkoutCode },
      include: { user: { select: { proExpiresAt: true } } },
    });
    if (!intent || intent.status !== "PENDING" || amount < intent.amount) return;

    const paidAt = new Date();
    const baseDate =
      intent.user?.proExpiresAt && intent.user.proExpiresAt.getTime() > paidAt.getTime()
        ? intent.user.proExpiresAt
        : paidAt;
    const proExpiresAt = new Date(baseDate.getTime() + intent.durationDays * 24 * 60 * 60 * 1000);
    await this.prisma.proPaymentIntent.update({
      where: { id: intent.id },
      data: {
        status: "PAID",
        sepayTransactionId: transactionId,
        paidAt,
      },
    });
    await this.prisma.user.update({
      where: { id: intent.userId },
      data: { plan: "PRO", proExpiresAt },
    });
    this.logger.log(`User ${intent.userId} upgraded to PRO via SePay transaction ${transactionId ?? "unknown"}`);
  }

  private extractCheckoutCode(payload: SepayWebhookDto): string | null {
    const direct = typeof payload.code === "string" ? payload.code.trim().toUpperCase() : "";
    if (/^MEDIPRO[A-Z0-9]{8}$/.test(direct)) return direct;
    if (/^MEDIPRO-[A-Z0-9]{8}$/.test(direct)) return direct.replace("-", "");

    const haystack = [payload.content, payload.description, payload.referenceCode]
      .filter((value): value is string => typeof value === "string")
      .join(" ")
      .toUpperCase();
    const compact = haystack.match(/MEDIPRO[A-Z0-9]{8}/)?.[0];
    if (compact) return compact;
    return haystack.match(/MEDIPRO-[A-Z0-9]{8}/)?.[0].replace("-", "") ?? null;
  }
}
