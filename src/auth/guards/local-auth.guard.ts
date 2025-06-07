import { Injectable, UnauthorizedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {
  handleRequest(err, user, info) {
    if (err || !user || user._authError) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: "Unauthorized",
        messageDetail: user?._authError ?? info?.message ?? "Invalid credentials",
        data: null
      })
    }
    return user
  }
}
