import { consoleLogCustom } from "@/helpers/utils"
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

@Injectable()
export class CustomResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse()

    return next.handle().pipe(
      map((data) => {
        if (data?.statusCode && Number.isFinite(data.statusCode)) {
          response.status(data.statusCode)
        } else {
          response.status(200)
        }

        return data
      })
    )
  }
}
