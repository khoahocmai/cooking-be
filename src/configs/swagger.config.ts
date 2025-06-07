import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from "@nestjs/swagger"
import { INestApplication } from "@nestjs/common"

export function swaggerConfig(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("API Documentation")
    .setDescription("API Documentation for Capstone Project (Application - Mobile)")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      },
      "JWT-auth" // This is the name of the security scheme
    )
    .build()

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey
  }

  const document = SwaggerModule.createDocument(app, config, options)
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1
    },
    jsonDocumentUrl: "api/json"
  })
}
