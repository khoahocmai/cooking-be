import { Role } from "@/constants/types"
import { ROLE_KEY } from "@/decorator/customize"
import responses from "@/helpers/responses"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(ROLE_KEY, context.getHandler())
    if (!requiredRoles || requiredRoles.length === 0) {
      // Nếu không có yêu cầu cụ thể, cho phép truy cập
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user // Giả sử user đã được thêm vào request thông qua middleware hoặc guard trước đó

    if (!user || user.role === undefined) {
      throw responses.response401Unauthorized("User not authenticated")
    }

    const userRole = Role[user.role.toUpperCase() as keyof typeof Role]

    if (!requiredRoles.includes(userRole)) {
      throw responses.response403Forbidden("Insufficient permissions")
    }

    return true
  }
}
