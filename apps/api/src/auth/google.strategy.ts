import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, type Profile } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>("GOOGLE_CLIENT_ID"),
      clientSecret: config.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL:
        config.get<string>("GOOGLE_CALLBACK_URL") ?? "http://localhost:4000/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    return {
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}
