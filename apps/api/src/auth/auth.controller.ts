import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import type { Response } from "express";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type LoginInput,
  type RegisterInput,
  type UpdateProfileInput,
} from "@medi/types";
import { ZodPipe } from "../common/zod.pipe";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { AuthService } from "./auth.service";
import { JwtGuard } from "./jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post("register")
  register(@Body(new ZodPipe(registerSchema)) input: RegisterInput) {
    return this.auth.register(input);
  }

  @Post("login")
  login(@Body(new ZodPipe(loginSchema)) input: LoginInput) {
    return this.auth.login(input);
  }

  @Post("refresh")
  refresh(@Body() body: { refreshToken?: string }) {
    if (!body.refreshToken) throw new BadRequestException("Thiếu refreshToken");
    return this.auth.refresh(body.refreshToken);
  }

  @UseGuards(JwtGuard)
  @Post("logout")
  async logout(@CurrentUser() user: JwtUser) {
    await this.auth.logout(user.id);
    return { ok: true };
  }

  @UseGuards(JwtGuard)
  @Get("me")
  me(@CurrentUser() user: JwtUser) {
    return this.auth.me(user.id);
  }

  @UseGuards(JwtGuard)
  @Patch("me")
  updateProfile(
    @CurrentUser() user: JwtUser,
    @Body(new ZodPipe(updateProfileSchema)) input: UpdateProfileInput,
  ) {
    return this.auth.updateProfile(user.id, input);
  }

  @UseGuards(JwtGuard)
  @Post("change-password")
  changePassword(
    @CurrentUser() user: JwtUser,
    @Body(new ZodPipe(changePasswordSchema)) input: ChangePasswordInput,
  ) {
    return this.auth.changePassword(user.id, input);
  }

  @UseGuards(AuthGuard("google"))
  @Get("google")
  google() {
    // Passport redirects to Google.
  }

  @UseGuards(AuthGuard("google"))
  @Get("google/callback")
  async googleCallback(@Req() req: { user: { email?: string; name: string; avatarUrl?: string } }, @Res() res: Response) {
    if (!req.user?.email) throw new BadRequestException("Google không trả về email");
    const result = await this.auth.loginWithGoogle({
      email: req.user.email,
      name: req.user.name,
      avatarUrl: req.user.avatarUrl,
    });
    const webUrl = this.config.get<string>("WEB_URL") ?? "http://localhost:3002";
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    res.redirect(`${webUrl}/auth/callback?${params.toString()}`);
  }
}
