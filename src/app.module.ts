import { AppController } from "@/app.controller"
import { AppService } from "@/app.service"
import { AuthModule } from "@/auth/auth.module"
import { UserModule } from "@/modules/account/account.module"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard"
import { DatabaseModule } from "./configs/database.config"
import { MailerConfigModule } from "./configs/mailer.config"
import { UserInfoModule } from "./modules/user-info/user-info.module"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Đọc file .env
    DatabaseModule, // Kết nối với database
    MailerConfigModule, // Cấu hình Mailer
    UserModule,
    UserInfoModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ]
})
export class AppModule {}
