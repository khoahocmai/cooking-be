import { Module } from "@nestjs/common"
import { MailerModule } from "@nestjs-modules/mailer"
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter"
import { ConfigModule, ConfigService } from "@nestjs/config"

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: configService.get<string>("MAIL_USER"),
            pass: configService.get<string>("MAIL_PASSWORD")
          }
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>'
        },
        template: {
          dir: process.cwd() + "/src/templates/",
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      }),
      inject: [ConfigService]
    })
  ]
})
export class MailerConfigModule {}
