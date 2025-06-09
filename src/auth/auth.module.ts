import googleOauthConfig from "@/configs/google-oauth.config"
import { AccountModule } from "@/modules/account/account.module"
import { CacheModule } from "@nestjs/cache-manager"
import { forwardRef, Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import * as redisStore from "cache-manager-redis-store"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { GoogleStrategy } from "./strategies/google.strategy"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { LocalStrategy } from "./strategies/local.strategy"

@Module({
  imports: [
    forwardRef(() => AccountModule),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_ACCESS_TOKEN_EXPIRED")
        }
      }),
      inject: [ConfigService]
    }),
    PassportModule,
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // isGlobal: true,
        store: redisStore,
        host: configService.get<string>("REDIS_HOST"),
        port: configService.get<number>("REDIS_PORT"),
        username: configService.get<string>("REDIS_USERNAME"),
        password: configService.get<string>("REDIS_PASSWORD"),
        ttl: 2592000
      })
    }),
    ConfigModule.forFeature(googleOauthConfig)
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  exports: [AuthService]
})
export class AuthModule {}
