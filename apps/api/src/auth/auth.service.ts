import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, type JwtSignOptions } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import type {
  AuthResponse,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  UserDto,
} from "@medi/types";
import type { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  toUserDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      authProvider: user.authProvider,
      defaultCurrency: user.defaultCurrency,
      locale: user.locale,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ConflictException("Email đã được đăng ký");
    }
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash: await bcrypt.hash(input.password, 10),
        authProvider: "LOCAL",
      },
    });
    return this.issueTokens(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (!user?.passwordHash || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }
    return this.issueTokens(user);
  }

  async loginWithGoogle(profile: { email: string; name: string; avatarUrl?: string }): Promise<AuthResponse> {
    const user = await this.prisma.user.upsert({
      where: { email: profile.email },
      update: { avatarUrl: profile.avatarUrl ?? undefined },
      create: {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl ?? null,
        authProvider: "GOOGLE",
      },
    });
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Refresh token không hợp lệ");
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshHash || !(await bcrypt.compare(refreshToken, user.refreshHash))) {
      throw new UnauthorizedException("Refresh token không hợp lệ");
    }
    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshHash: null } });
  }

  async me(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.toUserDto(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        avatarUrl: input.avatarUrl,
        defaultCurrency: input.defaultCurrency,
        locale: input.locale,
      },
    });
    return this.toUserDto(user);
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<{ ok: true }> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.authProvider !== "LOCAL" || !user.passwordHash) {
      throw new BadRequestException("Tài khoản Google không thể đổi mật khẩu tại đây");
    }
    if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException("Mật khẩu hiện tại không đúng");
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(input.newPassword, 10) },
    });
    return { ok: true };
  }

  private async issueTokens(user: User): Promise<AuthResponse> {
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: (this.config.get<string>("JWT_ACCESS_TTL") ?? "15m") as JwtSignOptions["expiresIn"],
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      expiresIn: (this.config.get<string>("JWT_REFRESH_TTL") ?? "30d") as JwtSignOptions["expiresIn"],
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshHash: await bcrypt.hash(refreshToken, 10) },
    });
    return { user: this.toUserDto(user), accessToken, refreshToken };
  }
}
