import { AppController } from "@/app.controller"
import { AppService } from "@/app.service"
import { AuthModule } from "@/auth/auth.module"
import { AccountModule } from "@/modules/account/account.module"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard"
import { DatabaseModule } from "./configs/database.config"
import { MailerConfigModule } from "./configs/mailer.config"
import { IngredientModule } from "./modules/ingredient/ingredient.module"
import { RecipeModule } from "./modules/recipe/recipe.module"
import { TagModule } from "./modules/tag/tag.module"
import { UserInfoModule } from "./modules/user-info/user-info.module"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Đọc file .env
    DatabaseModule, // Kết nối với database
    MailerConfigModule, // Cấu hình Mailer
    AccountModule,
    UserInfoModule,
    TagModule,
    IngredientModule,
    RecipeModule,
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
