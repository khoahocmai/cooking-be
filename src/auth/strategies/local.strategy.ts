import responses from "@/helpers/responses"
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-local"
import { Request } from "express"
import { AuthService } from "../auth.service"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
  constructor(private authService: AuthService) {
    super({ usernameField: "loginKey", passReqToCallback: true })
  }

  async validate(req: Request, loginKey: string, password: string): Promise<any> {
    const user = await this.authService.validateUserLocalStrategy(loginKey.trim(), password.trim())
    if (!user) {
      return { _authError: "Wrong email/username or password" }
    }
    if (user.isActive === false) {
      return { _authError: "Account is not activate" }
    }
    if (user.isBanned === true) {
      return { _authError: "Account is banned" }
    }
    return user
  } // Đăng nhập bằng email và password, trả về user
}
