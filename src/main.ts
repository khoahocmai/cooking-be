import { Logger, RequestMethod, ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { swaggerConfig } from "./configs/swagger.config"
import { CustomHttpExceptionFilter } from "./middlewares/custom-filter-http-exception"
import { CustomResponseInterceptor } from "./middlewares/custom-response.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "verbose"]
  })
  const configService = app.get(ConfigService)
  const PORT = configService.get<number>("PORT", 8080)
  const SERVER_URL = configService.get<string>("SERVER_URL", `http://localhost:${PORT}`)

  app.setGlobalPrefix("api", { exclude: [{ path: "auth/google/callback", method: RequestMethod.GET }] }) // Cài đặt global prefix cho tất cả các route

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true // Dùng để ném lỗi khi có trường không được định nghĩa trong DTO
    })
  ) // Cài đặt global pipe cho tất cả các route, dùng để validate dữ liệu

  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    credentials: true
  }) // Cài đặt CORS, dùng để cho phép các domain khác gọi API

  app.useGlobalInterceptors(new CustomResponseInterceptor())
  app.useGlobalFilters(new CustomHttpExceptionFilter())

  swaggerConfig(app) // Cấu hình swagger

  await app.listen(PORT)
  Logger.verbose(`Nest application successfully started`, "NestApplication")
  Logger.verbose(`Server is running on ${SERVER_URL}`, "NestApplication")
  Logger.verbose(`Swagger is running on ${SERVER_URL}/api`, "NestApplication")
}
bootstrap()
