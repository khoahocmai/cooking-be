import { ExecutionContext, Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { lastValueFrom } from "rxjs"

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    // Lấy deviceId từ query hoặc cookie
    const deviceId = request.query.deviceId

    // Lưu deviceId vào session nếu có
    if (deviceId) {
      if (!request.session) {
        request.session = {}
      }
      request.session.deviceId = deviceId
    }

    const result = await super.canActivate(context)
    return typeof result === "boolean" ? result : await lastValueFrom(result)
  }

  // Override handleRequest to add deviceId to the user object
  handleRequest(err, user, info, context) {
    // Get the request object
    const request = context.switchToHttp().getRequest()

    // If auth succeeded and we have a user and deviceId
    if (user && request.session?.deviceId) {
      // Add deviceId to the authenticated user object
      user.deviceId = request.session.deviceId
    }

    // Pass to parent implementation to handle errors etc.
    return super.handleRequest(err, user, info, context)
  }
}
