import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from "@nestjs/common"
import { Request, Response } from "express"

@Catch(HttpException)
export class CustomHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("HttpException")

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const errorPath = `[${request.method}] ${request.url} → ${status}`

    if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
      const res = exceptionResponse as any
      if (res.messageDetail) {
        this.logger.error(`${errorPath}: ${res.messageDetail}`)
      } else if (res.details) {
        // Nếu bạn dùng CustomBadRequestException với mảng details
        this.logger.error(`${errorPath}: ${res.details.join(" | ")}`)
      } else {
        this.logger.error(JSON.stringify(res, null, 2))
      }
    } else {
      this.logger.error(exceptionResponse)
    }

    response.status(status).json(exceptionResponse)
  }
}
