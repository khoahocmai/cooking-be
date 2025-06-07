import { Role } from "@/constants/types"
import { CustomDecorator, SetMetadata } from "@nestjs/common"

export const IS_PUBLIC_KEY = "isPublic"
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

export const ROLE_KEY = "requiredRole"
export const RequireRole = (roles: Role[]): CustomDecorator<string> => {
  return SetMetadata(ROLE_KEY, roles)
}
