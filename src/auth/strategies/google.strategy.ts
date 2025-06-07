import googleOauthConfig from "@/configs/google-oauth.config"
import { Inject, Injectable } from "@nestjs/common"
import { ConfigType } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-google-oauth20"
import { VerifiedCallback } from "passport-jwt"
import { AuthService } from "../auth.service"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY) private googleConfig: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService
  ) {
    super({
      clientID: googleConfig.clientID,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackUrl,
      scope: ["profile", "email"]
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifiedCallback) {
    const user = await this.authService.validateGoogleUser(
      profile.emails[0].value,
      profile.name.givenName,
      profile.name.familyName,
      profile.photos[0].value
    )
    done(null, user)
  }
}
